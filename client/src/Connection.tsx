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

    if (!webSocket) {
      return;
    }

    if (!otpRef.current?.value) {
      return;
    }

    const protocol = protocolRef.current?.value || wsConditions.protocol;
    const hostname = hostnameRef.current?.value || wsConditions.hostname;
    const port = portRef.current?.value || wsConditions.port;


    const otp = otpRef.current.value;

    const fd = new FormData();
    fd.append("username", "hoge");
    fd.append("password", otp);

    const url = `${protocol === "ws" ? "http" : "https"}://${hostname}:${port}/token`;

    fetch(url, { method: "POST", body: fd })
    .then((res) => res.json())
    .then((res) => {
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

  const otpRequesting = readyState === WebSocket.CLOSED && wsCloseCode == 1008;

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

      {otpRequesting && (
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
