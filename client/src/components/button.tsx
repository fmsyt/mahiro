import React from "react";
import { componentProps } from "../interface";

import { Card, CardContent, CardMedia, Typography } from "@mui/material";

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
    <Card sx={{ width: "100%", textAlign: "center" }} variant="outlined">
      <CardMedia
        component="img"
        height={60}
        image={logo}
        alt=""
        />

      <CardContent sx={{ padding: 0 }}>
        <Typography component="div" variant="caption" padding={1} noWrap>{componentProps.label}</Typography>
      </CardContent>

    </Card>
  )
}

export default AppButton;
