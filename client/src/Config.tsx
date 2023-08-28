import { memo } from "react";
import { Container, Typography } from "@mui/material";

import Connection from "./Connection";

const Config = memo(() => {
  return (
    <Container>
      <Typography variant="h5">Connection</Typography>
      <Connection />
    </Container>
  )
});

export default Config;
