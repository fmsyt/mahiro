import { Slider as MuiSlider, Paper, Stack, styled, Typography } from "@mui/material";
import { EmitControllerProps } from "../interface";

import { Events } from "../enum";
import { useRef } from "react";

const sliderSize = "100%";
const BoldSlider = styled(MuiSlider)(({ theme: _ }) => ({

  "& .MuiSlider-thumb": {
    width: 4,
    height: sliderSize,
    backgroundColor: "white",
    borderRadius: 2,
    cursor: "pointer",

    "&:hover": {
      boxShadow: "0 0 0 8px rgba(0, 0, 0, 0.1)",
    },
  },
  "&.MuiSlider-vertical": {
    padding: 0,
  },
  "&.MuiSlider-vertical .MuiSlider-thumb": {
    width: sliderSize,
    height: 4,
  },
  "& .MuiSlider-rail": {
    width: "100%",
    height: sliderSize,
    cursor: "pointer",
    borderRadius: 2,
    backgroundColor: "secondary.main",
  },
  "&.MuiSlider-vertical .MuiSlider-rail": {
    width: sliderSize,
    height: "100%",
  },
  "& .MuiSlider-track": {
    width: "100%",
    // height: 4,
    height: sliderSize,
    cursor: "pointer",
    borderRadius: 2,
    backgroundColor: "secondary.main",
  }
}));

const Slider = (props: EmitControllerProps) => {

  const { sheetItem, emit } = props;

  const disabled = props.disabled || sheetItem.disabled || false;

  const isActiveRef = useRef(false);
  const handleChange = (e: Event, value: number | number[]) => {
    if (isActiveRef.current) {
      return;
    }

    if (!sheetItem.control_id) {
      return;
    }

    isActiveRef.current = true;
    setTimeout(() => { isActiveRef.current = false }, 100);

    emit({
      action: sheetItem.control_id,
      event: Events.keyUp,
      context: JSON.stringify(value)
    })
  }

  return (
    <Paper variant="outlined">
      <Stack padding={1} spacing={2} direction="column" sx={{ width: "100%", height: "100%" }} alignItems="center">
        {/* <VolumeDown /> */}
        <BoldSlider
          aria-label="Volume"
          defaultValue={Number(sheetItem.value || sheetItem.default || 0)}
          disabled={disabled}
          orientation="vertical"
          sx={{ width: "100%", height: "100%" }}
          { ...(sheetItem.props || {}) }
          onChange={handleChange}
          />
        {/* <VolumeUp /> */}
        <Typography variant="caption">{sheetItem.label}</Typography>
      </Stack>
    </Paper>
  )
}

export default Slider;
