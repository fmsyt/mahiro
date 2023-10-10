import { memo } from "react";
import { SheetItemProps } from "./interface";
import { Paper } from "@mui/material";

import StyleButton from "./components/Button";
import StyleSlider from "./components/Slider";

interface controlUIPropsType {
  controlProps: SheetItemProps,
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
    <Paper variant="outlined" sx={{ width: "100%", height: "100%" }}></Paper>
  )
})
