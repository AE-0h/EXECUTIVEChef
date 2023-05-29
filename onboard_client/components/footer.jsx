import React from "react";
import { Box, styled } from "@mui/system";
import { Link } from "@mui/material";
import { GitHub, LinkedIn, Twitter } from "@mui/icons-material";

const Footer = styled("footer")(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(15, 20, 15, 0.9)"
      : "rgba(244, 238, 217, 0.9)",
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  marginTop: theme.spacing(4),
  position: "sticky",
  bottom: 0,
  minWidth: "330px",
}));

const Socials = styled("div")({
  display: "flex",
  justifyContent: "center",
  gap: "3rem",
});

const SocialLink = styled(Link)(({ theme }) => ({
  fontSize: "2rem",
  size: "4rem",
  color: theme.palette.text.primary,
  "&:hover": {
    color: theme.palette.secondary.main,
  },
}));

const FooterAuthor = styled("Typography")(({ theme }) => ({
  display: "flex",
  fontSize: "0.75rem",
  color: "darkgrey",
}));

const PageFooter = () => {
  return (
    <Footer>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ flexGrow: 1, width: "100%" }}
      >
        <Socials>
          <SocialLink
            href="https://github.com/AE-0h"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHub />
          </SocialLink>
          <SocialLink
            href="https://www.linkedin.com/in/conor-gallagher-182955213/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedIn />
          </SocialLink>
          <SocialLink
            href="https://twitter.com/Byzan_solutions"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter />
          </SocialLink>
        </Socials>
        <FooterAuthor>
          Copyright © {new Date().getFullYear()} ⛓ AE0h
        </FooterAuthor>
      </Box>
    </Footer>
  );
};

export default PageFooter;
