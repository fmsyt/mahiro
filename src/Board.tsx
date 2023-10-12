import { memo, useCallback, useContext, useMemo } from "react";
import { Box, CircularProgress, Pagination, Stack, Typography } from "@mui/material";
import { ReadyState } from "react-use-websocket";

import { useSearchParams } from "react-router-dom";
import { PageProps } from "./interface";

import { AppContext } from "./AppContext";
import { Control } from "./Control";

import WebSocketContext from "./WebSocketContext";

import "./board.css"
import { toURL } from "./webSocket";

const Board = memo(() => {

  const { pages } = useContext(AppContext);
  const { connection, readyState } = useContext(WebSocketContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const setPage = useCallback((page: number) => setSearchParams({ page: page.toString() }), [setSearchParams]);

  return readyState !== ReadyState.OPEN
  ? (
    <Stack alignItems="center" justifyContent="center" gap={2} height="80vh">
      <Typography variant="body1">Connecting to {toURL(connection)}</Typography>
      <CircularProgress />
    </Stack>
  ) : (
    <Box sx={{ display: "grid", gap: 2, gridTemplateRows: "1fr 32px", height: "100%" }}>
      {!!pages && pages.length > 0 && (
        <Page {...pages[page - 1]} />
      )}

      {!!pages && pages.length > 1 && (
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
  )
})

const Page = (props: PageProps) => {

  const { items, columns } = props;
  const { emit } = useContext(AppContext);

  const gridTemplateColumns = useMemo(() => `repeat(${columns}, 1fr)`, [columns]);
  const gridTemplateRows = useMemo(() => `repeat(${Math.ceil(items.length / columns)}, 1fr)`, [items, columns]);

  return (
    <Box gap={2} sx={{ display: "grid", height: "100%", gridTemplateColumns, gridTemplateRows }}>
      {items.map((control, i) => (
        <Control
          key={i}
          emit={emit}
          sheetItem={control}
          />
      ))}

    </Box>
  )
}

export default Board;
