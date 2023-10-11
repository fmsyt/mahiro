import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, CircularProgress, FormControl, FormLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ControlProps, ControlType } from "../../interface";
import fetchControls from "../fetchControls";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;


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

  const [controls, setControls] = useState<ControlProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);

  useEffect(() => {

    const read = async () => {

      try {
        const controls = await fetchControls();
        setControls(controls);

      } catch (error) {
        console.error(error);
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  return (
    <Stack>
      <Typography variant="h5">Controls</Typography>
      {disallowed && (
        <Typography variant="body1">
          This feature is not available on this platform.
        </Typography>
      )}


      {controls == null ? (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
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
