import React, { memo } from "react";
import { controlProps } from "./interface";
import { Box, Paper } from "@mui/material";

import StyleButton from "./components/Button";
import StyleSlider from "./components/Slider";

interface controlUIPropsType {
  controlProps: controlProps,
}

interface controlPropsType extends controlUIPropsType {
  ws: WebSocket,
  disabled?: boolean,
}

export const Control = memo((props: controlPropsType) => {

  const { controlProps, ws } = props;

  switch (controlProps.style) {
    default:
    case "empty":
      return <DefaultControlUI />;

    case "button":
      return <StyleButton ws={ws} controlProps={controlProps} disabled={props.disabled} />

    case "slider":
      return <StyleSlider ws={ws} controlProps={controlProps} disabled={props.disabled} />
  }
})

const DefaultControlUI = memo(() => {
  return (
    <Paper variant="outlined" sx={{ width: "100%", height: "100%" }}>
      <Box sx={{ width: "100%",  "&::before": { content: '""', paddingTop: "100%" } }}>
      </Box>
    </Paper>
  )
})
