import { ThemeContextProvider, useThemeContext } from "../context/themeContext";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeContextProvider>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </ThemeContextProvider>
  );
}

function AppWrapper({ children }) {
  const { theme } = useThemeContext();

  useEffect(() => {
    document.body.classList.remove("light", "dark", "sunrise");
    document.body.classList.add(theme.palette.mode);
  }, [theme]);

  return <>{children}</>;
}

export default MyApp;
