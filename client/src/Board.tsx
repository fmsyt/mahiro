import React, { memo, useContext, useState } from "react";
import { pageProps } from "./interface";

import { Button, CircularProgress, Container, Grid, Pagination, Stack } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import { Control, ControlUI } from "./Control";

import { AppContext } from "./AppContext";

const Board = memo(() => {

  const { pages, webSocket } = useContext(AppContext);

  const [page, setPage] = useState(1);
  const [isEditMode] = useState(false);

  return (
    <Container>
      {
        webSocket?.readyState === WebSocket.OPEN
        ? (
          <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={1}>

            {pages.length > 0 && (
              <Page webSocket={webSocket} isEditMode={isEditMode} {...pages[page - 1]} />
            )}

            {pages.length > 1 && (
              <Stack position="absolute" bottom={32}>
                <Pagination
                  count={pages.length}
                  color="primary"
                  onChange={(e, page) => setPage(page)}
                  page={page}
                  />
              </Stack>
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
})

interface PageProps extends pageProps {
  webSocket: WebSocket;
  isEditMode: boolean;
}

const Page = (props: PageProps) => {

  const { controls, webSocket, columns, isEditMode } = props;

  return (
    <Grid container columns={columns} spacing={2} maxHeight="100%" sx={{ overflowY: "auto" }}>
      {controls.map((control, i) => (
        <Grid item key={i} xs={1} overflow="hidden" textOverflow="clip">
          {!isEditMode ? (
            <Control controlProps={control} ws={webSocket} />
          )
          : (
            <Button sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }}>
              <ControlUI controlProps={control} />
            </Button>
          )}
        </Grid>
      ))}

      {isEditMode && (
        <Grid item xs={1}>
          <Button variant="outlined" sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }} onClick={() => console.log("edit")}>
            <AddIcon />
          </Button>
        </Grid>
      )}
    </Grid>
  )
}

export default Board;
