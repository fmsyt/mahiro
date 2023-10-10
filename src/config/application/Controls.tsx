import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, FormControl, FormControlLabel, FormLabel, Input, MenuItem, Radio, RadioGroup, Select, Stack, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fs } from "@tauri-apps/api";
import { BaseDirectory, FsOptions } from "@tauri-apps/api/fs";

import { ControlProps, ControlType, isTypeOfControl } from "../../interface";

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
        console.error(error);
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  return { controls, invalidJson };
}

function createAccordion(data: ControlProps, index: number) {
  return (
    <Accordion key={index}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${data.id}-content`}
        id={`panel-${data.id}-header`}
      >
        <Typography>{`${index + 1}. ${data.label || data.id}`}</Typography>
        <Typography sx={{ color: "text.secondary" }}>{data.description}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={2} alignItems="flex-start" justifyContent="center">
          <FormControl>
            <TextField
              label="ID"
              defaultValue={data.id}
              variant="standard"
              onChange={() => {}}
              />
          </FormControl>
          <FormControl>
            <TextField
              label="Description"
              defaultValue={data.description}
              variant="standard"
              onChange={() => {}}
              />
          </FormControl>
          <FormControl>
            <FormLabel>Control Type</FormLabel>
            <Select value={data.type} variant="standard">
              {Object.keys(ControlType).map((key) => (
                <MenuItem key={key} value={key.toLowerCase()}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {data.type === ControlType.Browser && (
            <FormControl>
              <FormLabel>URL</FormLabel>
              <TextField value={data.url} variant="standard" />
            </FormControl>
          )}

          {data.type === ControlType.Command && (
            <FormControl>
              <FormLabel>Command</FormLabel>
              <TextField value={data.command} variant="standard" />
            </FormControl>
          )}

          {data.type === ControlType.Keyboard && (
            <FormControl>
              <FormLabel>Key</FormLabel>
              <TextField value={data.key} variant="standard" />
            </FormControl>
          )}

          {data.type === ControlType.Hotkey && (
            <FormControl>
              <FormLabel>Key</FormLabel>
              <TextField value={data.key} variant="standard" />
            </FormControl>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
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
          {controls.map(createAccordion)}
        </>
      )}

    </Stack>
  );
}
