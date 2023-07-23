import React, { memo, useMemo } from "react";
import { controlProps } from "./interface";
import { Events } from "./enum";
import { Button, Paper } from "@mui/material";
import StyleButton from "./components/Button";
import { emit } from "./functions";

interface controlUIPropsType {
  controlProps: controlProps,
}

interface controlPropsType extends controlUIPropsType {
  ws: WebSocket,
  disabled?: boolean,
}

export const Control = memo((props: controlPropsType) => {

  const { controlProps, ws } = props;

  const disabled = controlProps.style === "empty" || props.disabled || controlProps.disabled || false;

  const events = useMemo(() => {
    if (disabled) {
      return {}
    }

    return {
      onMouseUp: () => emit(ws, { action: controlProps.id, event: Events.keyUp }),
    }

  }, [ws, controlProps, disabled]);

  return (
    <Button variant="outlined" { ...events } disabled={disabled} sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }}>
      <ControlUI controlProps={controlProps} />
    </Button>
  )
})

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
