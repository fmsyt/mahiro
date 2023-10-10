import { useEffect, useState } from "react";
import { fs } from "@tauri-apps/api";
import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

interface Control {
  id: string;
  type: string;
  style?: string | null;
  label?: string | null;
  disabled?: boolean | null;
  // default?: string | null;
  props?: object | null;
  platform?: string | null;
  url?: string | null;
  command?: string | null;
  commands?: string[] | null;
  hotkey?: string | null;
  hotkeys?: string[] | null;
  sync?: boolean | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTypeOfControl(object: any): object is Control {
  console.log("object", object);
  return (
    typeof object === "object" &&
    typeof object.id === "string" &&
    typeof object.type === "string" &&
    (object.style == null || typeof object.style === "string") &&
    (object.label == null || typeof object.label === "string") &&
    (object.disabled == null || typeof object.disabled === "boolean") &&
    // (object.default == null || typeof object.default === "string") &&
    (object.props == null || typeof object.props === "object") &&
    (object.platform == null || typeof object.platform === "string") &&
    (object.url == null || typeof object.url === "string") &&
    (object.command == null || typeof object.command === "string") &&
    (object.commands == null || Array.isArray(object.commands)) &&
    (object.hotkey == null || typeof object.hotkey === "string") &&
    (object.hotkeys == null || Array.isArray(object.hotkeys)) &&
    (object.sync == null || typeof object.sync === "boolean")
  )
}

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;

const fsOptions: FsOptions = {
  dir: BaseDirectory.AppLocalData,
}

const useControls = () => {
  const [controls, setControls] = useState<Control[] | null>(null);
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
