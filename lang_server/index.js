import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { cloneParseOrPullParse } from "./fileparse.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { mkdir, readdir, writeFile, readFile, unlink } from "fs/promises";
import { marked } from "marked";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import * as dotenv from "dotenv";
dotenv.config();

const currentModulePath = path.dirname(new URL(import.meta.url).pathname);

// Specify the path for conversation data storage
const conversationDataFolder = path.join(
  currentModulePath,
  "conversation_data"
);

// Check if conversation data folder exists, create it if not
const createConversationDataFolder = async () => {
  try {
    await mkdir(conversationDataFolder);
    console.log("Conversation data folder created");
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error("Error creating conversation data folder:", err);
    }
  }
};

// Create the conversation data folder if it doesn't exist
createConversationDataFolder();

export const createPineconeIndex = async (
  client,
  indexName,
  vectorDimension
) => {
  console.log(`Checking "${indexName}"...`);

  const existingIndexes = await client.listIndexes();

  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating "${indexName}"...`);

    const createClient = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: "cosine",
      },
    });

    console.log(`Created with client:`, createClient);

    await new Promise((resolve) => setTimeout(resolve, 60000));
  } else {
    console.log(`"${indexName}" already exists.`);
  }
};

export const updatePinecone = async (client, indexName, docs) => {
  console.log("Retrieving Pinecone index...");

  const index = client.Index(indexName);

  console.log(`Pinecone index retrieved: ${indexName}`);

  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    console.log("Splitting text into chunks...");

    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );
    console.log("Finished embedding documents");
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`
    );

    const batchSize = 100;
    let batch = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch.push(vector);
      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert({
          upsertRequest: {
            vectors: batch,
          },
        });
        batch = [];
      }
    }
    console.log(`Pinecone index updated with ${chunks.length} vectors`);
  }
};

// Adjusted logic for formatting response using marked library
const renderer = new marked.Renderer();

renderer.html = (html) => {
  // Handle bold text (one backtick)
  if (html.startsWith("<p>`") && html.endsWith("`</p>")) {
    const text = html.substring(4, html.length - 5);
    return `<p><strong>${text}</strong></p>`;
  }
  // Handle embedded code (three backticks)
  else if (html.startsWith("<p>```") && html.endsWith("```</p>")) {
    const code = html.substring(7, html.length - 8);
    return `<pre><code>${code}</code></pre>`;
  }
  // Handle other HTML tags
  else {
    return html;
  }
};

marked.setOptions({ renderer });

const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = createServer(app);

const txtLocalStorePath = path.join(
  new URL(".", import.meta.url).pathname,
  "tokenizedJSLocalStore"
);

const loader = new DirectoryLoader(txtLocalStorePath, {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();

const indexName = "onboard";
const vectorDimension = 1536;

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENV,
});

updatePinecone(client, indexName, docs);

let clients = [];

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

app.post("/question", async (req, res) => {
  const question = req.body.question;
  console.log("Received POST request to /question");
  console.log(clients);

  try {
    console.log("Querying Pinecone vector store...");

    const index = client.Index(indexName);

    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

    let queryResponse = await index.query({
      queryRequest: {
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true,
        includeValues: true,
      },
    });

    console.log(`Found ${queryResponse.matches.length} matches...`);

    console.log(`Asking question: ${question}...`);

    if (queryResponse.matches.length) {
      const chat = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token) {
              clients[0].write(`data: ${JSON.stringify(token)}\n\n`),
                console.log(JSON.stringify(token));
            },
          },
        ],
      });

      const concatenatedPageContent = queryResponse.matches
        .map((match) => match.metadata.pageContent)
        .join(" ");

      // Fetch all stored questions and responses from the conversation data folder
      let chatHistoryArray = [];
      try {
        const files = readdir(conversationDataFolder);
        for (const file of files) {
          const filePath = path.join(conversationDataFolder, file);
          const content = readFile(filePath, "utf-8");
          const data = JSON.parse(content);
          chatHistoryArray.push(...data);

          // Set a timer to delete the file after 5 minutes
          setTimeout(async () => {
            try {
              await unlink(filePath);
              console.log(`Deleted file: ${filePath}`);
            } catch (error) {
              console.error(`Error deleting file: ${filePath}`, error);
            }
          }, 5 * 60 * 1000); // 5 minutes
        }
      } catch (err) {
        console.error("Error reading conversation data folder:", err);
      }

      let historyString = chatHistoryArray
        .map(({ message }) => message)
        .join(" ");
      //add to input array
      let combinedInput = concatenatedPageContent + historyString;

      const messages = await ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          "Welcome to the Executive Chef chatbot we will need you to review the data given and answer questions about it to assist onboarding people to this source code."
        ),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
      ]);

      const chain = await new ConversationChain({
        prompt: messages,
        llm: chat,
      });

      const queryRes = await chain.call({
        //input: [combibnedInput, question],switch to this for context and memory.
        input: [question],
      });
      clients[0].write(`data: ${JSON.stringify("!%!")}\n\n`);

      // Update the chat history with the new question and response
      chatHistoryArray.push({ message: question, from: "user" });
      chatHistoryArray.push({ message: queryRes.response, from: "bot" });

      // Save the conversation data to the local storage folder
      const timestamp = new Date().getTime();
      const fileName = `conversation_${timestamp}.json`;
      const filePath = path.join(conversationDataFolder, fileName);
      try {
        writeFile(filePath, JSON.stringify(chatHistoryArray), "utf-8");
        console.log("Conversation data saved:", filePath);
      } catch (err) {
        console.error("Error saving conversation data:", err);
      }
    } else {
      console.log("Since there are no matches, GPT-3 will not be queried.");

      // Return an empty string or any default message when no matches are found
      return "NO MATCHES FOUND";
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred on the server" });
  }
});

server.listen(4000, () => {
  console.log("Server started on port 4000");
});

cloneParseOrPullParse();
createPineconeIndex(client, indexName, vectorDimension);
