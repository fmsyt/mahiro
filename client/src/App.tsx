import React, { useEffect, useMemo, useState } from "react";
import { componentProps } from "./interface";

import { CircularProgress, Container, CssBaseline, Grid, Pagination, Stack, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import Control from "./control";

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);


  const [page, setPage] = useState(1);
  const [actions, setActions] = useState<componentProps[][]>([]);

  const [webSocket, setWebSocket] = useState<WebSocket>();

  const [columnCount, setColumnCount] = useState<number>(4);

  useEffect(() => {

    const connectWebSocket = () => {

      if (webSocket) {
        return;
      }

      const host = process.env.NODE_ENV === "production"
        ? window.location.host
        : `${window.location.hostname}:8000`;

      const to = `ws://${host}/ws`;
      console.info(`Connecting to ${to}`);

      const ws = new WebSocket(to);

      ws.addEventListener("open", (e: Event) => {
        console.log("WebSocket Connection Established.");
      })

      ws.addEventListener("close", (e: CloseEvent) => {
        console.log("WebSocket Connection Closed.");
        setWebSocket(undefined);
      })

      ws.addEventListener("message", (e: MessageEvent) => {

        const obj = JSON.parse(e.data);
        setColumnCount(4);

        console.log('Message from server ', obj);

        switch (obj?.method) {
          default: break;

          case "sheets.update":
            setActions(obj?.data || []);
            break;
        }

      })

      setWebSocket(ws);
    }

    const timeout = setTimeout(connectWebSocket, 1000);

    return () => {
      clearTimeout(timeout);
      webSocket && webSocket.close();
    }

  }, [webSocket]);


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container>
        {
          webSocket?.readyState === WebSocket.OPEN
          ? (
            <Stack direction="column" alignItems="center" spacing={1} padding={2}>
              <Grid container columns={columnCount} rowSpacing={1} columnSpacing={2}>
                {actions.length > 0 && actions[page - 1].map((action, i) => (
                  <Grid item key={i} xs={1} overflow="hidden" textOverflow="clip">
                    <Control componentProps={action} ws={webSocket} />
                  </Grid>
                ))}
              </Grid>

              {actions.length > 1 && (
                <Pagination
                  count={actions.length}
                  color="primary"
                  onChange={(e, page) => setPage(page)}
                  page={page}
                  />
              )}
            </Stack>
          ): (
            <Stack alignItems="center" justifyContent="center" height="90vh">
              <CircularProgress />
            </Stack>
          )
        }

      </Container>
    </ThemeProvider>
  )
}

export default App;
