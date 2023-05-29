import { CssBaseline } from "@mui/material";
import PageFooter from "@/components/footer";
import Layout from "@/components/layout";
import ChatBox from "@/components/chatbox.jsx";

export default function Home() {
  return (
    <>
      <Layout>
        <CssBaseline />
        <ChatBox />
        <PageFooter />
      </Layout>
    </>
  );
}
