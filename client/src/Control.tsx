import React, { useCallback, useMemo } from "react";
import { controlProps } from "./interface";
import { Events } from "./enum";
import { ButtonBase } from "@mui/material";
import Button from "./components/Button";
import { emit } from "./functions";

interface controlPropsType {
  componentProps?: controlProps,
  ws: WebSocket,
}

const Control = (props: controlPropsType) => {

  const { componentProps, ws } = props;

  const handleMouseUp = useCallback(() => {
    if (!componentProps) return;
    emit(ws, { action: componentProps.id, event: Events.keyUp })
  }, [componentProps, ws]);


  const component = useMemo(() => {

    if (!componentProps) return;

    const { icon, label } = componentProps;

    switch (componentProps.style) {
      default: break;
      case "button":
        return <Button icon={icon} label={label} componentProps={componentProps} webSocket={ws} />
    }
    return null;

  }, [componentProps, ws]);

  return (
    <ButtonBase sx={{ width: "100%" }} onMouseUp={handleMouseUp}>
      { component }
    </ButtonBase>
  )
}



export default Control;
