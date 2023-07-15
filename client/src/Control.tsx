import React, { memo, useCallback } from "react";
import { controlProps } from "./interface";
import { Events } from "./enum";
import { Button, Paper } from "@mui/material";
import StyleButton from "./components/Button";
import { emit } from "./functions";

interface controlUIPropsType {
  controlProps?: controlProps,
}

interface controlPropsType extends controlUIPropsType {
  ws: WebSocket,
}

export const Control = (props: controlPropsType) => {

  const { controlProps, ws } = props;

  const setEvent = useCallback((eventKey: Events) => {
    if (!controlProps) return () => {};
    return () => emit(ws, { action: controlProps.id, event: eventKey })

  }, [ws, controlProps]);

  const handleMouseUp = setEvent(Events.keyUp);

  return (
    <Button sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }} onMouseUp={handleMouseUp}>
      <ControlUI controlProps={controlProps} />
    </Button>
  )
}

export const ControlUI = memo((props: controlUIPropsType) => {

  const { controlProps } = props;
  if (!controlProps) return <DefaultControlUI />;

  switch (controlProps.style) {
    default:
      return <DefaultControlUI />;
    case "button":
      return <StyleButton {...controlProps} />
  }
})

const DefaultControlUI = memo(() => {
  return (
    <Paper variant="outlined" sx={{ width: "100%", height: "100%" }} />
  )
})
