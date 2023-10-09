import { useMemo, useState } from "react";
import ThemeContext from "./ThemeContext";
import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

const initialThemeMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;

const ThemeContextProvider: React.FC<ThemeContextProviderProps> = (props) => {

  const { children } = props;

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(initialThemeMode || "system");

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeMode === "system" ? (prefersDarkMode ? "dark" : "light") : themeMode,
    }
  }), [prefersDarkMode, themeMode]);

  return (
    <ThemeContext.Provider value={{
      themeMode,
      setThemeMode: (themeMode: "light" | "dark" | "system") => {
        localStorage.setItem("themeMode", themeMode);
        setThemeMode(themeMode);
      },
    }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContextProvider;
