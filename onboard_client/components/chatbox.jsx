import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import axios from "axios";

const ChatBox = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!streaming && response !== "") {
      setMessages([...messages, { text: response, isUser: false }]);
      setResponse("");
    }
  }, [streaming]);

  useEffect(() => {
    let eventSource;

    const fetchData = async () => {
      let baseUrl = "http://localhost:4000";

      try {
        eventSource = await fetchEventSource(`${baseUrl}/sse`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
          },
          onopen(res) {
            console.log("Connection made ", res);
          },
          onmessage(event) {
            setStreaming(true);
            const serverMessage = JSON.parse(event.data);
            if (serverMessage == "!%!") {
              setStreaming(false);
            } else {
              setResponse((prevResponse) => prevResponse + serverMessage);
            }
          },
          onclose() {
            console.log("Connection closed by the server");
          },
          onerror(err) {
            console.log("There was an error from server", err);
          },
        });
      } catch (error) {
        console.error("Error establishing SSE connection:", error);
      }
    };

    fetchData();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { text: input, isUser: true }]);

    try {
      await axios.post("http://localhost:4000/question", {
        question: input,
        isUser: true,
      });
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "An error occurred while sending the question",
          isUser: false,
        },
      ]);
    }

    setInput("");
  };

  const isQuestionAsked = messages.some((message) => message.isUser);
  const isBotResponseEmpty = response === "";

  return (
    <>
      <Box
        border={1}
        borderColor="grey.500"
        borderRadius={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "70vh",
          overflowY: "auto",
          p: 2,
          mb: "12vh",
        }}
      >
        {isQuestionAsked &&
          messages.map((message, index) => (
            <Message
              key={index}
              initialText={message.text}
              isUser={message.isUser}
              isLoading={isLoading && index === messages.length - 1}
            />
          ))}
        {isQuestionAsked && !isBotResponseEmpty && (
          <Message
            initialText={response}
            isUser={false}
            isLoading={isLoading}
          />
        )}
      </Box>
      <Box
        component="form"
        variant="outlined"
        padding={"1rem"}
        sx={{
          display: "flex",
          mt: -15,
          padding: "1rem",
          position: "sticky",
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ flex: 1, mr: 2 }}
          variant="outlined"
          placeholder="Ask me anything about this source code..."
          size="small"
          position="sticky"
        />
        <Button type="submit" variant="contained" endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </>
  );
};

export default ChatBox;
