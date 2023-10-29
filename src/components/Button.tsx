import { useMemo } from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Button as MuiButton, Paper, Stack, Typography } from "@mui/material";
import { EmitControllerProps } from "../interface";

import logo from "../logo.svg";
import { Events } from "../enum";
import useIcon from "../icon/useIcon";

const Button = (props: EmitControllerProps) => {

  const { sheetItem, emit } = props;
  const { label } = sheetItem;

  const src = useIcon(sheetItem.icon);
  const disabled = props.disabled || sheetItem.disabled || false;

  const events = useMemo(() => {
    if (disabled) {
      return {}
    }

    const action = sheetItem.control_id || "";
    if (!action) {
      return {}
    }

    return {
      onMouseUp: () => {
        emit({ action, event: Events.keyUp })
      },
    }
  }, [disabled, emit, sheetItem.control_id]);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {

    const sx = {
      width: "100%",
      height: "100%",
      // position: "relative",
      // backgroundColor: "transparent",
    }

    return disabled ? (
      <Box sx={sx}>{children}</Box>
    ) : (
      <CardActionArea
        sx={sx}
        { ...(disabled ? {} : events) }
      >
        { children }
      </CardActionArea>
    )
  }


  return (
    <Card variant="outlined" sx={{ width: "100%", height: "100%" }}>
      <Wrapper>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",

              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CardMedia
              component="img"
              image={src || logo}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                marginTop: 0,
              }}
              />

          </Box>
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              textAlign: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              padding: 1,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Wrapper>
    </Card>
  )
}

export default Button;
