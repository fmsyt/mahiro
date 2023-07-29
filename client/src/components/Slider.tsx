import React, { useMemo } from "react";
import { controlProps } from "../interface";

import { Slider as MuiSlider, Stack } from "@mui/material";
import { emit } from "../functions";
import { Events } from "../enum";
import styled from "@emotion/styled";

const sliderSize = "100%";

const BoldSlider = styled(MuiSlider)(({ theme }) => ({

  "& .MuiSlider-thumb": {
    width: 4,
    height: sliderSize,
    backgroundColor: "white",
    borderRadius: 2,
    cursor: "pointer",

    "&:hover": {
      boxShadow: "0 0 0 8px rgba(0, 0, 0, 0.1)",
    },
  },
  "&.MuiSlider-vertical .MuiSlider-thumb": {
    width: sliderSize,
    height: 4,
  },
  "& .MuiSlider-rail": {
    width: "100%",
    height: sliderSize,
    cursor: "pointer",
    borderRadius: 2,
    backgroundColor: "secondary.main",
  },
  "&.MuiSlider-vertical .MuiSlider-rail": {
    width: sliderSize,
    height: "100%",
  },
  "& .MuiSlider-track": {
    width: "100%",
    // height: 4,
    height: sliderSize,
    cursor: "pointer",
    borderRadius: 2,
    backgroundColor: "secondary.main",
  }
}));


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
      <BoldSlider
        aria-label="Volume"
        defaultValue={Number(controlProps.current || 0)}
        disabled={disabled}
        orientation="vertical"
        sx={{ width: "100%", height: "100%" }}
        { ...(controlProps.props || {}) }
        { ...events }
        />
      {/* <VolumeUp /> */}
    </Stack>
  )
}

export default Slider;
