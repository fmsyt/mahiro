import React, { useCallback } from "react";
import { controlProps } from "../interface";

import { Slider as MuiSlider, Stack } from "@mui/material";

interface propsTypes {
  action: controlProps,
  webSocket?: WebSocket
}

const Slider = (props: propsTypes) => {

  const handleChange = useCallback(() => {}, []);

  return (
    <Stack spacing={2} direction="row" sx={{ mb: 1, width: "100%" }} alignItems="center">
      {/* <VolumeDown /> */}
      <MuiSlider aria-label="Volume" value={Number(props.action.current || 0)} onChange={handleChange} />
      {/* <VolumeUp /> */}
    </Stack>
  )
}

export default Slider;
