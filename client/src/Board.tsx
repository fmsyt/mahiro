import { memo, useCallback, useContext, useMemo, useState } from "react";
import { pageProps } from "./interface";

import { Box, Button, CircularProgress, Container, Pagination, Stack } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import { AppContext } from "./AppContext";
import { Control } from "./Control";
import { useSearchParams } from "react-router-dom";

const Board = memo(() => {

  const { pages, webSocket } = useContext(AppContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const setPage = useCallback((page: number) => setSearchParams({ page: page.toString() }), [setSearchParams]);

  const [isEditMode] = useState(false);

  return (
    <Container>
      {
        webSocket?.readyState === WebSocket.OPEN
        ? (
          <Box sx={{ display: "grid", gap: 2, gridTemplateRows: "1fr 32px", height: "calc(90vh - 88px)" }}>
            {pages.length > 0 && (
              <Page webSocket={webSocket} isEditMode={isEditMode} {...pages[page - 1]} />
            )}

            {pages.length > 1 && (
              <Stack alignItems="center">
                <Pagination
                  count={pages.length}
                  color="primary"
                  onChange={(e, page) => setPage(page)}
                  page={page}
                  />
              </Stack>
            )}
          </Box>
        ): (
          <Stack alignItems="center" justifyContent="center" height="80vh">
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

  const gridTemplateColumns = useMemo(() => `repeat(${columns}, 1fr)`, [columns]);
  const gridTemplateRows = useMemo(() => `repeat(${Math.ceil(controls.length / columns)}, 1fr)`, [controls, columns]);

  return (
    <Box gap={2} sx={{ display: "grid", height: "100%", gridTemplateColumns, gridTemplateRows }}>
      {controls.map((control, i) => (
        <Control key={i} controlProps={control} ws={webSocket} disabled={isEditMode} />
      ))}

      {isEditMode && (
        <Button variant="outlined" sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }} onClick={() => console.log("edit")}>
          <AddIcon />
        </Button>
      )}
    </Box>
  )
}

export default Board;
