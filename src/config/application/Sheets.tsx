import { Stack, Typography } from "@mui/material";
import useControls from "../useControls";

export default function Sheets() {

  const { controls, invalidJson } = useControls();

  return (
    <Stack>
      <Typography variant="h5">Sheets</Typography>
    </Stack>
  );
}
