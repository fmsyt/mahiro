import React, { memo, useMemo } from "react";
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
  disabled?: boolean,
}

export const Control = (props: controlPropsType) => {

  const { controlProps, disabled, ws } = props;

  const events = useMemo(() => {
    if (!controlProps || disabled || controlProps.disabled) {
      return {}
    }

    return {
      onMouseUp: () => emit(ws, { action: controlProps.id, event: Events.keyUp }),
    }

  }, [ws, controlProps, disabled]);

  return (
    <Button { ...events } sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }}>
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
