import React, { memo } from "react";
import { controlProps } from "./interface";
import { Paper, Typography } from "@mui/material";

import StyleButton from "./components/Button";
import StyleSlider from "./components/Slider";
import Square from "./components/Square";

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
      <Square />
      <Typography component="div" variant="caption" noWrap>&nbsp;</Typography>
    </Paper>
  )
})
