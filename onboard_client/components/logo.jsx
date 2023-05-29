import React from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const imageSize = isMobile ? 44 : 64;

  const logoImage = theme.palette.mode === "dark" ? "/chef.png" : "/chef.svg";

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Link href="/" passHref>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="home"
          sx={{
            marginRight: "0.1rem",
            overflow: "hidden",
            borderRadius: "100%",
            width: isMobile ? "calc(44px - .05rem)" : "58px",
            height: isMobile ? "calc(44px - .05rem)" : "58px",
          }}
        >
          <Image
            src={logoImage}
            alt="Logo"
            width={imageSize}
            height={imageSize}
          />
        </IconButton>
      </Link>
      <Box sx={{ marginLeft: "0.5rem" }}>
        <Typography
          color="#5B6871"
          variant="h5"
          sx={{
            fontWeight: "bold",
            fontFamily: "'Dosis', sans-serif",
            "@media (max-width: 600px)": {
              fontSize: "calc(1.95rem - .05rem)",
            },
          }}
        >
          Executive Chef
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo;
