import { memo, useContext, useRef } from "react";

import { Button, TextField, Stack, useTheme, useMediaQuery, Select, MenuItem, Typography } from "@mui/material";

import WebSocketContext from "./WebSocketContext";

const Connection = memo(() => {

  const theme = useTheme();
  const matched = useMediaQuery(theme.breakpoints.down("sm"));

  const { connection, setToken, tokenRequired } = useContext(WebSocketContext);

  const protocolRef = useRef<HTMLInputElement>(null);
  const hostnameRef = useRef<HTMLInputElement>(null);
  const portRef = useRef<HTMLInputElement>(null);

  const otpRef = useRef<HTMLInputElement>(null);

  const connect = () => {
    const protocol = protocolRef.current?.value || connection.protocol;
    const hostname = hostnameRef.current?.value || connection.hostname;
    const port = portRef.current?.value || connection.port;

    const url = `${protocol === "ws" ? "ws" : "wss"}://${hostname}:${port}/ws`;

    localStorage.setItem("wsUrl", url);
    localStorage.setItem("wsToken", "");

    window.location.reload();
  }

  const handleVerify = () => {

    if (!otpRef.current?.value) {
      return;
    }

    const protocol = protocolRef.current?.value || connection.protocol;
    const hostname = hostnameRef.current?.value || connection.hostname;
    const port = portRef.current?.value || connection.port;


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
      setToken(access_token);
    })

  }

  return (
    <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="flex-start">

      <Stack direction={"row"} spacing={2} alignItems="center">
        <Select
          inputRef={protocolRef}
          defaultValue={connection.protocol || "ws"}
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
          defaultValue={connection.hostname}
          fullWidth={matched}
          />

        <Typography variant="body1">:</Typography>

        <TextField
          // label="Port"
          variant="standard"
          defaultValue={connection.port || 80}
          inputRef={portRef}
          />

        <Typography variant="body1">/ws</Typography>
      </Stack>

      <Button variant="contained" onClick={connect} disabled={tokenRequired}>Connect</Button>

      {tokenRequired && (
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

    </Stack>
  )
})

export default Connection;
