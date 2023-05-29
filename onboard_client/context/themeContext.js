import { createContext, useContext, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { darkTheme, sunriseTheme } from "../styles/themes.js";

const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(sunriseTheme);

  const toggleTheme = () => {
    setTheme((prevMode) =>
      prevMode === sunriseTheme ? darkTheme : sunriseTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProviderWrapper theme={theme}>{children}</ThemeProviderWrapper>
    </ThemeContext.Provider>
  );
};

const ThemeProviderWrapper = ({ children, theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const useThemeContext = () => useContext(ThemeContext);

export { ThemeContext, ThemeContextProvider, useThemeContext };
