import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, CircularProgress, FormControl, FormLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ControlProps, ControlType } from "../../interface";
import fetchControls from "../fetchControls";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;


interface ControlAccordionProps {
  initialControl: ControlProps;
  index: number;
  onSave?: (control: ControlProps) => void;
}

const ControlAccordion = (props: ControlAccordionProps) => {

  const { index, initialControl } = props;
  const [control, setControl] = useState<ControlProps>(initialControl);

  return (
    <Accordion key={index}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${initialControl.id}-content`}
        id={`panel-${initialControl.id}-header`}
      >
        <Typography>{`${index + 1}. ${initialControl.label || initialControl.id}`}</Typography>
        <Typography sx={{ color: "text.secondary" }}>{initialControl.description}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={2} alignItems="flex-start" justifyContent="center">
          <FormControl>
            <TextField
              label="ID"
              defaultValue={control.id}
              variant="standard"
              onChange={(e) => setControl({ ...control, id: e.target.value })}
              />
          </FormControl>
          <FormControl>
            <TextField
              label="Description"
              defaultValue={control.description}
              variant="standard"
              onChange={(e) => setControl({ ...control, description: e.target.value })}
              />
          </FormControl>
          <FormControl>
            <FormLabel>Control Type</FormLabel>
            <Select
              value={control.type}
              variant="standard"
              onChange={(e) => setControl({ ...control, type: e.target.value as ControlType })}
            >
              {Object.keys(ControlType).map((key) => (
                <MenuItem key={key} value={key.toLowerCase()}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {control.type === ControlType.Browser && (
            <FormControl>
              <FormLabel>URL</FormLabel>
              <TextField
                value={control.url}
                variant="standard"
                onChange={(e) => setControl({ ...control, url: e.target.value })}
                />
            </FormControl>
          )}

          {control.type === ControlType.Command && (
            <FormControl>
              <FormLabel>Command</FormLabel>
              <TextField
                value={control.command}
                variant="standard"
                onChange={(e) => setControl({ ...control, command: e.target.value })}
                />
            </FormControl>
          )}

          {control.type === ControlType.Keyboard && (
            <FormControl>
              <FormLabel>Key</FormLabel>
              <TextField
                value={control.key}
                variant="standard"
                onChange={(e) => setControl({ ...control, key: e.target.value })}
                />
            </FormControl>
          )}

          {control.type === ControlType.Hotkey && (
            <FormControl>
              <FormLabel>Key</FormLabel>
              <TextField
                value={control.key}
                variant="standard"
                onChange={(e) => setControl({ ...control, key: e.target.value })}
                />
            </FormControl>
          )}

        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center" paddingTop={2}>
          <Button variant="contained" color="primary" onClick={() => props.onSave?.(control)}>Save</Button>
          <Button variant="outlined" color="secondary" onClick={() => setControl(props.initialControl)} >Reset</Button>
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
          {controls.map((control, index) => (
            <ControlAccordion
              key={index}
              initialControl={control}
              index={index}
              onSave={(control) => {
                const newControls = [...controls];
                newControls[index] = control;
                setControls(newControls);
              }}
              />
          ))}
        </>
      )}

    </Stack>
  );
}
