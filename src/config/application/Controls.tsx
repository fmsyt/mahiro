import { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { fs } from "@tauri-apps/api";
import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

import { ControlProps, isTypeOfControl } from "../../interface";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;

const fsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

const useControls = () => {
  const [controls, setControls] = useState<ControlProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);

  useEffect(() => {

    const read = async () => {
      const isExists = await fs.exists("controls.json", fsOptions);

      if (!isExists) {
        await fs.writeFile("controls.json", "[]", fsOptions);
      }

      const text = await fs.readTextFile("controls.json", fsOptions);
      try {
        const json = JSON.parse(text);
        console.log(json);
        if (Array.isArray(json) && json.every(isTypeOfControl)) {
          setControls(json);
          setInvalidJson(false);
        }
      } catch (error) {
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  return { controls, invalidJson };
}

export default function Controls() {

  const { controls, invalidJson } = useControls();

  return (
    <Stack>
      <Typography variant="h5">Controls</Typography>
      {disallowed && (
        <Typography variant="body1">
          This feature is not available on this platform.
        </Typography>
      )}


      {controls == null ? (
        <Box justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {invalidJson && (
            <Typography variant="body1">
              Invalid JSON in controls.json
            </Typography>
          )}
          <pre>{ JSON.stringify(controls, null, 2) }</pre>
        </>
      )}

    </Stack>
  );
}
