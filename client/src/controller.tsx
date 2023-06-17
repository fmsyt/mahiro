import React, { useCallback, useEffect, useState } from "react";
import { action } from "./interface";
import AppButton from "./components/button";
import AppSlider from "./components/slider";

import { Box, CircularProgress, Grid, Pagination, Paper, Stack, styled } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


const Controller = () => {

  const [page, setPage] = useState(1);
  const [actions, setActions] = useState<action[][]>([]);

  const [webSocket, setWebSocket] = useState<WebSocket>();

  useEffect(() => {

    const connectWebSocket = () => {

      if (webSocket) {
        return;
      }

      console.info("Connecting WebSocket...");

      const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws`);

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
    <Box sx={{ padding: 8 }}>
      <Box sx={{ width: '100%' }}>
        <Stack direction="column" alignItems="center" spacing={1}>

          {
            webSocket?.readyState === WebSocket.OPEN
            ? (
              <>
                <Grid container rowSpacing={1} columnSpacing={2}>
                  {actions.length > 0 && actions[page - 1].map((action, i) => (
                    <Grid key={i} item xs={12 / 4}>
                      <Item>
                        {putElement(action)}
                      </Item>
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
      </Box>
    </Box>
  )

}

export default Controller;
