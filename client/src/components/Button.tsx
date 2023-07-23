import React, { useMemo } from "react";
import { controlProps } from "../interface";

import { Button as MuiButton, Box, Stack, Typography } from "@mui/material";

import logo from "../logo.svg";
import { Events } from "../enum";
import { emit } from "../functions";

const Button = (props: { ws: WebSocket, controlProps: controlProps, disabled?: boolean }) => {

  const { controlProps, ws } = props;
  const { label } = controlProps;

  const disabled = props.disabled || controlProps.disabled || false;

  const events = useMemo(() => {
    if (disabled) {
      return {}
    }

    return {
      onMouseUp: () => emit(ws, { action: controlProps.id, event: Events.keyUp }),
    }

  }, [ws, controlProps, disabled]);

  return (
    <MuiButton variant="outlined" { ...events } disabled={disabled} sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }}>
      <Stack width="100%" alignItems="center" justifyContent="center">
        <Box sx={{ width: "100%",  "&::before": { content: '""', paddingTop: "100%" } }}>
          <img
            src={logo}
            alt=""
            style={{ width: "100%", objectFit: "cover" }}
            />
        </Box>
        <Typography component="div" variant="caption" noWrap>{label}</Typography>
      </Stack>
    </MuiButton>
  )
}

export default Button;
