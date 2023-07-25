import React, { memo, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Button, Container, TextField, Stack, useTheme, useMediaQuery } from "@mui/material";

import { AppContext } from "./AppContext";
import { updateSheets } from "./functions";

const Settings = memo(() => {

  const theme = useTheme();
  const matched = useMediaQuery(theme.breakpoints.down("sm"));

  const { webSocket, uri, setUri } = useContext(AppContext);

  const [readyState, setReadyState] = useState<WebSocket["readyState"]>(webSocket?.readyState || WebSocket.CLOSED);

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    setReadyState(webSocket.readyState || WebSocket.CLOSED);

    const onOpen = () => {
      setReadyState(WebSocket.OPEN);
    }

    const onClose = () => {
      setReadyState(WebSocket.CLOSED);
    }

    webSocket.addEventListener("open", onOpen);
    webSocket.addEventListener("close", onClose);

    const updateReadyState = () => {
      setReadyState(webSocket.readyState || WebSocket.CLOSED);
    }

    const interval = setInterval(updateReadyState, 1000);

    return () => {
      webSocket.removeEventListener("open", onOpen);
      webSocket.removeEventListener("close", onClose);

      clearInterval(interval);
    }

  }, [webSocket]);


  const ref = useRef<HTMLInputElement>(null);

  const connect = useCallback(() => {
    if (!ref.current) {
      return;
    }

    setUri(ref.current.value);
  }, [ref, setUri]);

  const reload = useCallback(() => {
    if (!webSocket) {
      return;
    }

    updateSheets(webSocket);

  }, [webSocket]);


  return (
    <Container>
      <h1>Connection</h1>

      <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="flex-start">
        <TextField
          label="URL"
          variant="standard"
          inputRef={ref}
          defaultValue={uri || ""}
          color={readyState === WebSocket.OPEN ? "success" : "primary"}
          fullWidth={matched}
          focused
          />

        <Button variant="contained" onClick={connect}>Connect</Button>

        {readyState === WebSocket.OPEN && (
          <Button onClick={reload}>Reload</Button>
        )}

      </Stack>

    </Container>
  )
})

export default Settings;
