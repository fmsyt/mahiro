import React from "react";
import { controlProps } from "../interface";

import { Box, Paper, Typography } from "@mui/material";

import logo from "../logo.svg";

const Button = (props: controlProps) => {

  const { label } = props;

  return (
    <Paper sx={{ width: "100%", backgroundColor: "transparent" }} variant="outlined">
      <Box alignItems="center" justifyContent="center" padding={1} overflow="hidden">
        <Box sx={{ height: "100%" }}>
          <img
            src={logo}
            alt=""
            style={{ objectFit: "cover" }}
            />
        </Box>
        <Typography component="div" variant="caption" noWrap>{label}</Typography>
      </Box>
    </Paper>
  )
}

export default Button;
