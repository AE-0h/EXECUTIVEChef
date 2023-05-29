import Head from "next/head";
import { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  Container,
} from "@mui/material";
import Brightness2Icon from "@mui/icons-material/Brightness2";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { sunriseTheme } from "../styles/themes";
import { ThemeContext } from "@/context/themeContext";
import Logo from "./logo.jsx";

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isBetweenSmAndxl = useMediaQuery(theme.breakpoints.between("sm", "xl"));

  return (
    <>
      <Head>
        <title>Executive Chef</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Container
        maxWidth={isBetweenSmAndxl ? "sm" : "md"}
        sx={{
          justifyContent: "start",
          minWidth: "320px",
        }}
      >
        <AppBar
          position="sticky"
          style={{
            top: 0,
            paddingTop: "1rem",
            paddingBottom: "1rem",
            paddingRight: "0.5rem",
            paddingLeft: isMobile ? "1.5rem" : "0rem",
          }}
          elevation={0}
        >
          <Toolbar sx={{ marginBottom: "1vh" }}>
            <Logo />
            <div style={{ marginLeft: "auto" }}>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="theme-toggle"
                onClick={toggleTheme}
                sx={{ marginRight: "0.5rem", mt: ".5rem" }}
              >
                {theme === sunriseTheme ? (
                  <Brightness2Icon />
                ) : (
                  <Brightness7Icon />
                )}
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        <main>{children}</main>
      </Container>
    </>
  );
};

export default Layout;
