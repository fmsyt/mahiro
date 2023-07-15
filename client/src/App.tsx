import React, { useMemo } from "react"
import Board from "./Board"

import { Route, Routes, BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

import Settings from "./Settings";

import { AppContextProvider } from "./AppContext";

const defaultWebSocketUri = process.env.NODE_ENV === "production"
  ? `ws://${window.location.host}/ws`
  : `ws://${window.location.hostname}:8000/ws`;

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);


  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />

        <AppContextProvider uri={defaultWebSocketUri}>
          <Routes>
            <Route path="/" element={<Board />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App;
