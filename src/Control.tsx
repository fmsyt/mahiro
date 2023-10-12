import { memo } from "react";
import { Paper } from "@mui/material";

import { EmitControllerProps } from "./interface";

import StyleButton from "./components/Button";
import StyleSlider from "./components/Slider";

export const Control = memo((props: EmitControllerProps) => {
  const { sheetItem, emit } = props;

  switch (sheetItem.style) {
    default:
    case "empty":
      return <DefaultControlUI />;

    case "button":
      return <StyleButton emit={emit} sheetItem={sheetItem} disabled={props.disabled} />

    case "slider":
      return <StyleSlider emit={emit} sheetItem={sheetItem} disabled={props.disabled} />
  }
})

const DefaultControlUI = memo(() => {
  return (
    <Paper variant="outlined" sx={{ width: "100%", height: "100%" }}></Paper>
  )
})
