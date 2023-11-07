import { useMemo, useRef } from "react";
import { Slider as MuiSlider, Paper, Stack, styled, Typography } from "@mui/material";

import { EmitControllerProps } from "../interface";
import { Events } from "../enum";

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialValue = useMemo(() => Number(sheetItem.value) || 0, []);

  const sliderRef = useRef<HTMLInputElement>(null);
  const isActiveRef = useRef(false);
  const handleChange = (e: Event, value: number | number[]) => {

    if (sliderRef.current === null) {
      return;
    }

    sliderRef.current.value = value.toString();

    if (isActiveRef.current) {
      return;
    }

    if (!sheetItem.action) {
      return;
    }

    isActiveRef.current = true;
    setTimeout(() => { isActiveRef.current = false }, 100);

    emit({
      action: sheetItem.action[Events.keyUp],
      event: Events.keyUp,
      context: JSON.stringify(value)
    })
  }

  const handleMouseUp = () => {

    if (sliderRef.current === null) {
      return;
    }

    if (!sheetItem.action) {
      return;
    }

    const value = Number(sliderRef.current.value);

    emit({
      action: sheetItem.action[Events.keyUp],
      event: Events.keyUp,
      context: JSON.stringify(value)
    })
  }

  const wheel = (e: React.WheelEvent) => {

    if (sliderRef.current === null) {
      return;
    }

    if (!sheetItem.action) {
      return;
    }

    // console.log(sliderRef.current)

    if (e.deltaY > 0) {
      sliderRef.current.stepDown();
    } else {
      sliderRef.current.stepUp();
    }

    const value = Number(sliderRef.current.value);
    console.log(value)

    sliderRef.current.value = value.toString();

    // emit({
    //   action: sheetItem.control_id,
    //   event: Events.keyUp,
    //   context: JSON.stringify(value)
    // })
  }

  return (
    <Paper variant="outlined" sx={{ width: "100%", height: "100%" }}>
      <Stack padding={1} spacing={2} direction="column" sx={{ width: "100%", height: "100%" }} alignItems="center">
        {/* <VolumeDown /> */}
        <BoldSlider
          slotProps={{
            input: { ref: sliderRef }
          }}
          aria-label="Volume"
          defaultValue={initialValue}
          disabled={disabled}
          orientation="vertical"
          sx={{ width: "100%", height: "100%" }}
          { ...(sheetItem.props || {}) }
          onChangeCommitted={handleChange}
          onMouseUp={handleMouseUp}
          onWheel={wheel}
          />
        {/* <VolumeUp /> */}
        <Typography variant="caption">{sheetItem.label}</Typography>
      </Stack>
    </Paper>
  )
}

export default Slider;
