import React, { useCallback } from "react";
import { action } from "../interface";
import { control } from "../functions";

import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";

import logo from "../logo.svg";

interface propsTypes {
  action: action,
  webSocket?: WebSocket
}

const AppButton = (props: propsTypes) => {

  const { action, webSocket } = props;

  const handleClick = useCallback(() => {
    window.navigator.vibrate && window.navigator.vibrate(200);
    webSocket && control(webSocket, action);

  }, [action, webSocket]);

  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="img"
          height={60}
          image={logo}
          alt=""
          />

        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="caption" noWrap>{action.label}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default AppButton;
