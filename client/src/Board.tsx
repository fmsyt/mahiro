import React, { useEffect, useState } from "react";
import { controlProps, isTypeOfPageProps, pageProps } from "./interface";

import { CircularProgress, Container, Grid, Pagination, Stack } from "@mui/material";
import Control from "./Control";

interface BoardProps {
  host?: string
}

const Board = (props: BoardProps) => {

  const { host } = props;

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<pageProps[]>([]);

  const [webSocket, setWebSocket] = useState<WebSocket>();

  useEffect(() => {

    const connectWebSocket = () => {

      if (webSocket) {
        return;
      }

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

        console.log('Message from server ', obj);

        switch (obj?.method) {
          default: break;

          case "sheets.update":
            setPages(obj?.data);
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

  }, [host, webSocket]);


  return (
    <Container>
      {
        webSocket?.readyState === WebSocket.OPEN
        ? (
          <Stack direction="column" alignItems="center" spacing={1} padding={2}>
            {pages.length > 0 && (
              <Page webSocket={webSocket} {...pages[page - 1]} />
            )}

            {pages.length > 1 && (
              <Pagination
                count={pages.length}
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
  )
}

interface PageProps extends pageProps {
  webSocket: WebSocket
}

const Page = (props: PageProps) => {

  const { controls, webSocket, columns: rows } = props;

  return (
    <Grid container columns={rows} rowSpacing={1} columnSpacing={2}>
      {controls.map((control, i) => (
        <Grid item key={i} xs={1} overflow="hidden" textOverflow="clip">
            <Control componentProps={control} ws={webSocket} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Board;
