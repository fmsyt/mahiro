import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Button, TextField, Stack, useTheme, useMediaQuery, Select, MenuItem, Typography } from "@mui/material";

import { AppContext } from "./AppContext";
import { updateSheets } from "./functions";

const Connection = memo(() => {

  const theme = useTheme();
  const matched = useMediaQuery(theme.breakpoints.down("sm"));

  const { webSocket, wsConditions, setWebSocketConditions: createWebSocket, wsCloseCode } = useContext(AppContext);
  const [readyState, setReadyState] = useState<WebSocket["readyState"]>(webSocket?.readyState || WebSocket.CLOSED);

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    setReadyState(webSocket.readyState || WebSocket.CLOSED);

    const onOpen = () => {
      setReadyState(WebSocket.OPEN);
    }

    webSocket.addEventListener("open", onOpen);

    const updateReadyState = () => {
      setReadyState(webSocket.readyState || WebSocket.CLOSED);
    }

    const interval = setInterval(updateReadyState, 1000);

    return () => {
      webSocket.removeEventListener("open", onOpen);
      clearInterval(interval);
    }

  }, [webSocket]);


  const protocolRef = useRef<HTMLInputElement>(null);
  const hostnameRef = useRef<HTMLInputElement>(null);
  const portRef = useRef<HTMLInputElement>(null);

  const otpRef = useRef<HTMLInputElement>(null);

  const connect = () => {
    createWebSocket({
      ...wsConditions,
      protocol: (protocolRef.current?.value || "ws") as "ws" | "wss",
      hostname: hostnameRef.current?.value || "localhost",
      port: Number(portRef.current?.value || 80),
    });
  }

  const reload = useCallback(() => {
    if (!webSocket) {
      return;
    }

    updateSheets(webSocket);

  }, [webSocket]);

  const handleVerify = () => {
    if (!otpRef.current) {
      return;
    }

    if (!hostnameRef.current) {
      return;
    }

    // const hostname = new URL(uriRef.current.value).hostname;
    const otp = otpRef.current.value;

    const fd = new FormData();
    fd.append("username", "hoge");
    fd.append("password", otp);

    fetch(`http://localhost:8000/token`, {
      method: "POST",
      body: fd
    })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      const { access_token } = res;

      localStorage.setItem("wsToken", access_token);
      createWebSocket({
        ...wsConditions,
        protocol: (protocolRef.current?.value || "ws") as "ws" | "wss",
        hostname: hostnameRef.current?.value || "localhost",
        port: Number(portRef.current?.value || 80),
        token: access_token,
      });
    })

  }

  const showForm = typeof wsCloseCode === "number" && [1006, 1008].includes(wsCloseCode)
  const otpRequesting = readyState === WebSocket.CLOSED && showForm;

  return (
    <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="flex-start">

      <Stack direction={"row"} spacing={2} alignItems="center">
        <Select
          inputRef={protocolRef}
          defaultValue={wsConditions.protocol || "ws"}
          variant="standard"
          label="Protocol"
        >
          <MenuItem value="ws">ws</MenuItem>
          <MenuItem value="wss">wss</MenuItem>
        </Select>
        <Typography variant="body1">://</Typography>
        <TextField
          // label="Hostname"
          variant="standard"
          inputRef={hostnameRef}
          defaultValue={wsConditions.hostname}
          fullWidth={matched}
          />

        <Typography variant="body1">:</Typography>

        <TextField
          // label="Port"
          variant="standard"
          defaultValue={wsConditions.port || 80}
          inputRef={portRef}
          />

        <Typography variant="body1">/ws</Typography>
      </Stack>

      <Button variant="contained" onClick={connect} disabled={otpRequesting}>Connect</Button>

      {readyState === WebSocket.CLOSED && showForm && (
        <>
          <TextField
            label="OTP"
            variant="standard"
            fullWidth={matched}
            inputRef={otpRef}
          />

          <Button variant="contained" onClick={handleVerify}>verify</Button>
        </>
      )}

      {readyState === WebSocket.OPEN && (
        <Button onClick={reload}>Reload</Button>
      )}

    </Stack>
  )
})

export default Connection;
