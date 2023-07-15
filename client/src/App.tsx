import React, { useMemo, useState } from "react"
import Board from "./Board"

import { Route, Routes, MemoryRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

import useWebSocket from "./webSocket";

const defaultWebSocketUri = process.env.NODE_ENV === "production"
        ? `ws://${window.location.host}/ws`
        : `ws://${window.location.hostname}:8000/ws`;

const App = () => {

  const [webSocketUri, setWebSocketUri] = useState(defaultWebSocketUri);
  const webSocket = useWebSocket(webSocketUri);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Board webSocket={webSocket} />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )
}

export default App;
