import React, { memo, useContext, useEffect, useState } from "react";
import { pageProps } from "./interface";

import { Button, CircularProgress, Container, Grid, Pagination, Stack } from "@mui/material";
import Control from "./Control";
import { useNavigate } from "react-router-dom";

import { AppContext } from "./AppContext";

const Board = memo(() => {

  const { pages, webSocket } = useContext(AppContext);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

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

            <Button variant="contained" onClick={() => navigate("/settings")}>Settings</Button>
          </Stack>
        ): (
          <Stack alignItems="center" justifyContent="center" height="100vh">
            <CircularProgress />
          </Stack>
        )
      }

    </Container>
  )
})

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
