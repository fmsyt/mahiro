import React, { memo, useContext } from "react";

import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { AppContext } from "./AppContext";

const Settings = memo(() => {

  const { webSocket } = useContext(AppContext);

  const navigate = useNavigate();

  return (
    <Container>
      <h1>Settings</h1>

      <Button onClick={() => navigate("/")}>Back</Button>
    </Container>
  )
})

export default Settings;
