// import React, { useState, useEffect } from "react";
// import { Box, TextField, Button } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import Message from "./Message";

// const ChatBox = () => {
//   const [messages, setMessages] = useState([]);
//   const [response, setResponse] = useState("");
//   const [webSocket, setSocket] = useState(null);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [streaming, setStreaming] = useState(false);

//   useEffect(() => {
//     if (!streaming && webSocket) {
//       setMessages([...messages, { text: response, isUser: false }]);
//       setResponse("");
//     }
//   }, [streaming]);

//   useEffect(() => {
//     if (!webSocket) {
//       const newSocket = new WebSocket("ws://localhost:4000");
//       newSocket.onopen = () => {
//         console.log("WebSocket Client Connected");
//       };

//       newSocket.onmessage = (message) => {
//         setStreaming(true);
//         let dataFromServer;
//         dataFromServer = message.data;

//         if (dataFromServer === "√∫√") {
//           setStreaming(false);
//         } else {
//           setResponse((prevResponse) => prevResponse + dataFromServer);
//         }
//       };

//       newSocket.onerror = (error) => {
//         console.error("clientError", error);
//       };

//       newSocket.onclose = (event) => {
//         setIsLoading(false);
//         if (event.wasClean) {
//           console.log(
//             `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
//           );
//         } else {
//           console.error("[close] Connection died");
//         }
//       };
//       setSocket(newSocket);
//     }
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setMessages([...messages, { text: input, isUser: true }]);

//     if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
//       console.error("WebSocket is not open. ReadyState: ");
//       return;
//     }

//     try {
//       const data = JSON.stringify({ question: input });
//       webSocket.send(data);
//       // setIsLoading(true);
//     } catch (error) {
//       console.error(error);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           text: "An error occurred while sending the question",
//           isUser: false,
//         },
//       ]);
//     }

//     setInput("");
//   };

//   return (
//     <>
//       <Box
//         border={1}
//         borderColor="grey.500"
//         borderRadius={6}
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           height: "70vh",
//           overflowY: "auto",
//           p: 2,
//           mb: "12vh",
//         }}
//       >
//         {messages.map((message, index) => (
//           <Message
//             key={index}
//             initialText={message.text}
//             isUser={message.isUser}
//             isLoading={isLoading && index === messages.length - 1}
//           />
//         ))}
//         {/* {isLoading && ( */}
//         <Message initialText={response} isUser={false} isLoading={isLoading} />
//         {/* )} */}
//       </Box>
//       <Box
//         component="form"
//         variant="outlined"
//         padding={"1rem"}
//         sx={{
//           display: "flex",
//           mt: -15,
//           padding: "1rem",
//           position: "sticky",
//         }}
//         onSubmit={handleSubmit}
//       >
//         <TextField
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           sx={{ flex: 1, mr: 2 }}
//           variant="outlined"
//           placeholder="Ask me anything about this source code..."
//           size="small"
//           position="sticky"
//         />
//         <Button type="submit" variant="contained" endIcon={<SendIcon />}>
//           Send
//         </Button>
//       </Box>
//     </>
//   );
// };

// export default ChatBox;

import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message";
import useWebSocket, { ReadyState } from "react-use-websocket";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState("");
  const [input, setInput] = useState("");

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    "ws://localhost:4000",
    {
      share: true,
    }
  );

  useEffect(() => {
    if (lastMessage?.data) {
      const serverMessage = lastMessage.data;
      if (serverMessage === "√∫√") {
        setMessages([...messages, { text: response, isUser: false }]);
        setResponse("");
      } else {
        setResponse((prevResponse) => prevResponse + serverMessage);
      }
    }
  }, [lastMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages([...messages, { text: input, isUser: true }]);

    if (readyState !== ReadyState.OPEN) {
      console.error("WebSocket is not open. ReadyState: ", readyState);
      //reconnect to websocket here
      getWebSocket();

      return;
    }

    try {
      const data = JSON.stringify({ question: input });
      sendMessage(data);
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

  const isQuestionAsked = messages.some(
    (message) => message.isUser || message.isUser === true
  );

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
        {messages.map((message, index) => (
          <Message
            key={index}
            initialText={message.text}
            isUser={message.isUser}
            isLoading={
              readyState === ReadyState.CONNECTING &&
              index === messages.length - 1
            }
          />
        ))}
        {isQuestionAsked && (
          <Message
            initialText={response}
            isUser={false}
            isLoading={readyState === ReadyState.CONNECTING}
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
