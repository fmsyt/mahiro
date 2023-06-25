import React, { useCallback, useEffect, useMemo, useState } from "react";
import { action } from "./interface";
import AppButton from "./components/button";
import AppSlider from "./components/slider";

import { CircularProgress, Container, CssBaseline, Grid, Pagination, Stack, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);


  const [page, setPage] = useState(1);
  const [actions, setActions] = useState<action[][]>([]);

  const [webSocket, setWebSocket] = useState<WebSocket>();

  const [columnCount, setColumnCount] = useState<number>(12);

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
        setColumnCount(12);

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


  const putElement = useCallback((action: action, key?: React.Key) => {
    switch (action.type) {
      case "button":
        return <AppButton key={key} action={action} webSocket={webSocket} />;

      case "slider":
        return <AppSlider key={key} action={action} webSocket={webSocket} />;

      default:
        throw Error();
    }

  }, [webSocket]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container>
        <Stack direction="column" alignItems="center" spacing={1} padding={2}>
          {
            webSocket?.readyState === WebSocket.OPEN
            ? (
              <>
                <Grid container columns={columnCount} rowSpacing={1} columnSpacing={2}>
                  {actions.length > 0 && actions[page - 1].map((action, i) => (
                    <Grid key={i} item xs sx={{ flex: 1, width: "100%", overflow: "hidden", textOverflow: "clip" }}>
                      { putElement(action) }
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
              </>
            ): (
              <CircularProgress />
            )
          }
        </Stack>

      </Container>
    </ThemeProvider>
  )
}

export default App;
