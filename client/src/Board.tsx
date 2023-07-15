import React, { useEffect, useState } from "react";
import { pageProps } from "./interface";

import { CircularProgress, Container, Grid, Pagination, Stack } from "@mui/material";
import Control from "./Control";

interface BoardProps {
  webSocket?: WebSocket|null,
}

const Board = (props: BoardProps) => {

  const { webSocket } = props;

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<pageProps[]>([]);

  useEffect(() => {

    if (!webSocket) return;

    const handleMessage = (e: MessageEvent) => {
      const obj = JSON.parse(e.data);

      console.log('Message from server ', obj);

      switch (obj?.method) {
        default: break;

        case "sheets.update":
          setPages(obj?.data);
          break;
      }
    }

    webSocket?.addEventListener("message", handleMessage);

    return () => {
      webSocket?.removeEventListener("message", handleMessage);
    }


  }, [webSocket]);


  return (
    <Container>
      {
        webSocket?.readyState === WebSocket.OPEN
        ? (
          <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={1} padding={2} height="100vh">
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
          <Stack alignItems="center" justifyContent="center" height="100vh">
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
    <Grid container columns={rows} rowSpacing={1} columnSpacing={2} maxHeight="100%" sx={{ overflowY: "auto" }}>
      {controls.map((control, i) => (
        <Grid item key={i} xs={1} overflow="hidden" textOverflow="clip">
            <Control componentProps={control} ws={webSocket} />
        </Grid>
      ))}
    </Grid>
  )
}

export default Board;
