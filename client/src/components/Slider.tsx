import React, { useMemo } from "react";
import { controlProps } from "../interface";

import { Slider as MuiSlider, Stack } from "@mui/material";
import { emit } from "../functions";
import { Events } from "../enum";

const Slider = (props: { ws: WebSocket, controlProps: controlProps, disabled?: boolean }) => {

  const { controlProps, ws } = props;

  const disabled = props.disabled || controlProps.disabled || false;

  const events = useMemo(() => {
    if (disabled) {
      return {}
    }

    let isActive = false;

    return {
      onChange: (e: Event, value: number | number[], activeThumb: number) => {

        if (isActive) return;
        isActive = true;
        setTimeout(() => { isActive = false }, 100);

        emit(ws, { action: controlProps.id, event: Events.keyUp, context: JSON.stringify(value) })
      },
    }

  }, [ws, controlProps, disabled]);

  return (
    <Stack spacing={2} direction="row" sx={{ mb: 1, width: "100%" }} alignItems="center">
      {/* <VolumeDown /> */}
      <MuiSlider
        aria-label="Volume"
        defaultValue={Number(controlProps.current || 0)}
        disabled={disabled}
        { ...(controlProps.props || {}) }
        { ...events }
        />
      {/* <VolumeUp /> */}
    </Stack>
  )
}

export default Slider;
