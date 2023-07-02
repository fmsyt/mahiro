import React, { useMemo, useState } from "react"
import Board from "./Board"

import { Route, Routes, MemoryRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

const defaultHost = process.env.NODE_ENV === "production"
        ? window.location.host
        : `${window.location.hostname}:8000`;

const App = () => {

  const [host, setHost] = useState(defaultHost);

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
          <Route path="/" element={<Board host={host} />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )
}

export default App;
