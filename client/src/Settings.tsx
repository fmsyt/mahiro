import { memo } from "react";
import { Container, Typography } from "@mui/material";

import Connection from "./Connection";

const Settings = memo(() => {
  return (
    <Container>
      <Typography variant="h5">Connection</Typography>
      <Connection />
    </Container>
  )
});

export default Settings;
