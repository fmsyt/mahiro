import { memo } from "react";
import { Container } from "@mui/material";

import Connection from "./Connection";

const Settings = memo(() => {
  return (
    <Container>
      <Connection />
    </Container>
  )
});

export default Settings;
