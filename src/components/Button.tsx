import { Box, Button as MuiButton, Stack, Typography } from "@mui/material";
import { EmitControllerProps } from "../interface";

import logo from "../logo.svg";
import { Events } from "../enum";

const Button = (props: EmitControllerProps) => {

  const { sheetItem, emit } = props;
  const { label } = sheetItem;

  const disabled = props.disabled || sheetItem.disabled || false;

  const events = () => {
    if (disabled) {
      return {}
    }

    return {
      onMouseUp: () => emit({
        action: sheetItem.control_id || "",
        event: Events.keyUp
      }),
    }
  }

  return (
    <MuiButton variant="outlined" { ...events } disabled={disabled} sx={{ width: "100%", height: "100%", padding: 0, textTransform: "none" }}>
      <Stack width="100%" height="100%" alignItems="center" justifyContent="space-between" padding={2}>
        <Box>
          {logo && (
            <img src={logo} alt="" className="square-image" />
          )}
        </Box>
        <Typography variant="caption">{label}</Typography>
      </Stack>
    </MuiButton>
  )
}

export default Button;
