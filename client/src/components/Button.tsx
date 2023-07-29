import React, { useMemo } from "react";
import { controlProps } from "../interface";

import { Box, Chip, Button as MuiButton, Stack } from "@mui/material";

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
      <Stack width="100%" height="100%" alignItems="center" justifyContent="space-between" padding={2}>
        <Box>
          {logo && (
            <img src={logo} alt="" className="square-image" />
          )}
        </Box>
        <Chip size="small" label={label} />
      </Stack>
    </MuiButton>
  )
}

export default Button;
