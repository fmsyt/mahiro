import React, { useCallback } from "react";
import { action } from "../interface";
import { control } from "../functions";

import { ButtonBase,Stack } from "@mui/material";

import logo from "../logo.svg";

interface propsTypes {
  action: action,
  webSocket?: WebSocket
}

const AppButton = (props: propsTypes) => {

  const { action, webSocket } = props;

  const handleClick = useCallback(() => { webSocket && control(webSocket, action) }, [action, webSocket]);

  return (
    <ButtonBase onClick={(e) => { handleClick() }}>
      <Stack direction={"column"}>
        <img src={logo} className="App-logo" alt="logo" style={{ width: "100%", height: "2em" }} />
        {action.label}
      </Stack>
    </ButtonBase>
  )
}

export default AppButton;
