import React, { useCallback } from "react";
import { componentProps } from "../interface";

import { Slider, Stack } from "@mui/material";

interface propsTypes {
  action: componentProps,
  webSocket?: WebSocket
}

const AppSlider = (props: propsTypes) => {

  const handleChange = useCallback(() => {}, []);

  return (
    <Stack spacing={2} direction="row" sx={{ mb: 1, width: "100%" }} alignItems="center">
      {/* <VolumeDown /> */}
      <Slider aria-label="Volume" value={Number(props.action.current || 0)} onChange={handleChange} />
      {/* <VolumeUp /> */}
    </Stack>
  )
}

export default AppSlider;
