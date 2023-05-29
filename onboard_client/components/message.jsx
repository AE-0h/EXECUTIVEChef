import { Box, CircularProgress } from "@mui/material";

const FormattedText = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

const UserMessage = (props) => (
  <Box
    sx={{
      bgcolor: "#2a382a",
      m: 1,
      p: 1,
      borderRadius: 1,
      alignSelf: "flex-end",
    }}
    {...props}
  />
);

const BotMessage = (props) => (
  <Box
    sx={{
      bgcolor: "#202b20",
      m: 1,
      p: 1,
      borderRadius: 1,
      alignSelf: "flex-start",
    }}
    {...props}
  />
);

export let LoadingDots = () => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <CircularProgress value={1} />
    <Box mr={1}>thinking</Box>
  </Box>
);

const Message = ({ initialText, isUser, isLoading }) => {
  return isUser ? (
    <UserMessage>
      <h4>Cook 👨‍💻</h4>
      {initialText}
    </UserMessage>
  ) : (
    <BotMessage>
      <h4>Executive Chef 👨🏻‍🍳</h4>
      {isLoading ? <LoadingDots /> : <FormattedText html={initialText} />}
    </BotMessage>
  );
};

export default Message;
