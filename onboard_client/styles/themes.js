import { createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f4eed9",
      alternate: "#ffffff",
    },
    background: {
      default: "#0f140f",
      paper: "#0f140f",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#b3b3b3",
    },
    logo: {
      main: "#f4eed9",
    },
    projectIndexBox: {
      default: "#172016",
    },
    solidity: {
      main: "#7494EE",
    },
    contactButton: {
      main: "#7494EE",
    },
    executiveBubble: {
      default: "#202b20",
    },
    cookBubble: {
      default: "#2a382a",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif, Dosis ",
  },
});

const sunriseTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#f4eed9",
    },
    secondary: {
      main: "#0f140f",
    },
    background: {
      default: "#f4eed9",
      paper: "#ffffff",
    },
    text: {
      primary: "#4c4c4c",
      secondary: "#8c8c8c",
    },
    logo: {
      main: "#5B6871",
    },
    projectIndexBox: {
      default: "#efe8d0",
    },
    solidity: {
      main: "#7494EE",
    },
    contactButton: {
      main: "#5B6871",
    },
    executiveBubble: {
      default: "#e8dbb2",
    },
    cookBubble: {
      default: "#f4e6b7",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif, Dosis",
  },
});

export { darkTheme, sunriseTheme };
