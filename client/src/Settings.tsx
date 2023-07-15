import React, { memo, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Button, Container, TextField, Stack } from "@mui/material";

import { useNavigate } from "react-router-dom";

import { AppContext } from "./AppContext";

const Settings = memo(() => {

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


  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  const connect = useCallback(() => {
    if (!ref.current) {
      return;
    }

    setUri(ref.current.value);
  }, [ref, setUri]);


  return (
    <Container>
      <h1>Settings</h1>

      <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="flex-start">
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            label="URL"
            variant="outlined"
            inputRef={ref}
            defaultValue={uri || ""}
            color={readyState === WebSocket.OPEN ? "success" : "primary"}
            focused
            />

          <Button variant="contained" onClick={connect}>Connect</Button>
        </Stack>


        <Button onClick={() => navigate("/")}>Back</Button>

      </Stack>

    </Container>
  )
})

export default Settings;
