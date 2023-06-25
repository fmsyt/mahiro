import React from "react";
import { componentProps } from "../interface";

import { Box, Paper, Typography } from "@mui/material";

import logo from "../logo.svg";

interface propsTypes {
  icon?: string
  label?: string

  onKeyDown?: Function
  onKeyUp?: Function
  onTouchTap?: Function
  onDialDown?: Function
  onDialUp?: Function
  onDialRotate?: Function
  onWillAppear?: Function
  onWillDisappear?: Function
  onTitleParametersDidChange?: Function
  onDeviceDidConnect?: Function
  onDeviceDidDisconnect?: Function
  onApplicationDidLaunch?: Function
  onApplicationDidTerminate?: Function
  onSystemDidWakeUp?: Function
  onPropertyInspectorDidAppear?: Function
  onPropertyInspectorDidDisappear?: Function
  onSendToPlugin?: Function


  componentProps: componentProps
  webSocket?: WebSocket
}

const AppButton = (props: propsTypes) => {

  const { componentProps } = props;

  return (
    <Paper sx={{ width: "100%" }} variant="outlined">
      <Box alignItems="center" justifyContent="center" padding={1} overflow="hidden">
        <Box sx={{ height: "100%" }}>
          <img
            src={logo}
            alt=""
            style={{ objectFit: "cover" }}
            />
        </Box>
        <Typography component="div" variant="caption" noWrap>{componentProps.label}</Typography>
      </Box>
    </Paper>
  )
}

export default AppButton;
