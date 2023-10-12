import { useCallback, useEffect, useRef, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, CircularProgress, FormControl, FormLabel, IconButton, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { ConfigBrowserControlProps, ConfigCommandControlProps, ConfigControlProps, ConfigHotkeyControlProps, ConfigKeyboardControlProps, ControlType, isTypeOfConfigCommandControl } from "../../interface";
import fetchControls from "../fetchControls";
import saveControls from "../saveControls";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;


interface ControlAccordionProps {
  initialControl: ConfigControlProps;
  index: number;
  onSave?: (control: ConfigControlProps) => void;
}

const ControlAccordion = (props: ControlAccordionProps) => {

  const { index, initialControl } = props;
  const [control, setControl] = useState<ConfigControlProps>(initialControl);

  return (
    <Accordion key={index}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${initialControl.id}-content`}
        id={`panel-${initialControl.id}-header`}
      >
        <Stack
          direction="row"
          gap={2}
          alignItems="center"
        >
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            {`${index + 1}. ${initialControl.label || initialControl.id}`}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {initialControl.description}
          </Typography>
        </Stack>
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
              fullWidth
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
            <ControlAccordionBrowserDetails
              control={control}
              setControl={setControl}
              />
          )}

          {control.type === ControlType.Command && (
            <ControlAccordionCommandDetails
              control={control}
              setControl={setControl}
              />
          )}

          {control.type === ControlType.Keyboard && (
            <ControlAccordionKeyboardDetails
              control={control}
              setControl={setControl}
              />
          )}

          {control.type === ControlType.Hotkey && (
            <ControlAccordionHotkeyDetails
              control={control}
              setControl={setControl}
              />
          )}

        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center" paddingTop={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
            onClick={() => props.onSave?.(control)}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none" }}
            onClick={() => setControl(props.initialControl)}
          >
            Reset
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

interface ControlAccordionDetailsProps {
  control: ConfigControlProps;
  setControl: React.Dispatch<React.SetStateAction<ConfigControlProps>>;
}

const ControlAccordionBrowserDetails = (props: ControlAccordionDetailsProps) => {

  const { control, setControl } = props;
  const url = (control as ConfigBrowserControlProps).url || "";

  return (
    <FormControl>
      <FormLabel>URL</FormLabel>
      <TextField
        value={url}
        variant="standard"
        onChange={(e) => setControl({ ...control, url: e.target.value })}
        />
    </FormControl>
  )
}

const ControlAccordionCommandDetails = (props: ControlAccordionDetailsProps) => {

  const { control, setControl } = props;
  const commands = (control as ConfigCommandControlProps).commands || [];

  const command = commands[0] || "";
  const [, ...args] = commands || [];

  const handleDeleteArgument = useCallback((index: number) => {

    setControl((prev) => {

      if (isTypeOfConfigCommandControl(prev)) {
        const newCommands = [...prev.commands];
        newCommands.splice(index + 1, 1);
        return { ...prev, commands: newCommands };
      }

      return prev;
    });

  }, [setControl]);


  return (
    <>
      <FormControl>
        <FormLabel>Command</FormLabel>
        <TextField
          value={command}
          variant="standard"
          onChange={(e) => setControl({ ...control, command: e.target.value })}
          />
      </FormControl>
      <FormControl>
        <FormLabel>arguments</FormLabel>
        {args.map((arg, index) => (
          <Stack direction="row" gap={2}>
            <TextField
              key={index}
              value={arg}
              variant="standard"
              onChange={(e) => {
                const newArgs = [...args];
                newArgs[index] = e.target.value;
                setControl({ ...control, commands: [command, ...newArgs] })
              }}
              />

            <Tooltip title="この引数を削除">
              <IconButton onClick={() => handleDeleteArgument(index)}>
                <RemoveCircleIcon
                  sx={{
                    color: "secondary",
                    "&:hover": { color: "error" }
                  }}
                  />
              </IconButton>
            </Tooltip>
          </Stack>
        ))}

        <Button
          variant="outlined"
          color="primary"
          sx={{ textTransform: "none" }}
          onClick={() => { setControl((prev) => ({ ...prev, commands: [command, ...args, ""] })) }}
          >
          Add argument
        </Button>
      </FormControl>
    </>
  )
}

const ControlAccordionKeyboardDetails = (props: ControlAccordionDetailsProps) => {

  const { control, setControl } = props;
  const text = (control as ConfigKeyboardControlProps).text || "";

  return (
    <FormControl>
      <FormLabel>Text</FormLabel>
      <TextField
        value={text}
        variant="standard"
        onChange={(e) => setControl({ ...control, key: e.target.value })}
        />
    </FormControl>
  )
}

const ControlAccordionHotkeyDetails = (props: ControlAccordionDetailsProps) => {

  const { control, setControl } = props;
  const hotkeys = (control as ConfigHotkeyControlProps).hotkeys || [];

  return (
    <FormControl>
      <FormLabel>Hotkey</FormLabel>
      {/* <TextField
        defaultValue={hotkeys}
        variant="standard"
        onChange={(e) => setControl({ ...control, key: e.target.value })}
        /> */}

      {hotkeys.map((hotkey, index) => (
        <Stack
          direction="row"
          gap={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <TextField
            key={index}
            value={hotkey}
            variant="standard"
            onChange={(e) => {
              const newHotkeys = [...hotkeys];
              newHotkeys[index] = e.target.value;
              setControl({ ...control, hotkeys: newHotkeys })
            }}
            />

          <Tooltip title="このホットキーを削除">
            <IconButton onClick={() => {
              const newHotkeys = [...hotkeys];
              newHotkeys.splice(index, 1);
              setControl({ ...control, hotkeys: newHotkeys })
            }}>
              <RemoveCircleIcon
                sx={{
                  color: "secondary",
                  "&:hover": { color: "error" }
                }}
                />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}

      <Button
        variant="outlined"
        color="primary"
        sx={{ textTransform: "none" }}
        onClick={() => { setControl((prev) => ({ ...prev, hotkeys: [...hotkeys, ""] })) }}
        >
        Add hotkey
      </Button>
    </FormControl>
  )
}



export default function Controls() {

  const [controls, setControls] = useState<ConfigControlProps[] | null>(null);
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

  const handleSave = useCallback((control: ConfigControlProps, index: number) => {

    const newControls = [...controls!];
    newControls[index] = control;

    saveControls(newControls).then(() => {
      setControls(newControls);
    });

  }, [controls]);

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
              onSave={(control) => handleSave(control, index)}
              />
          ))}
        </>
      )}

    </Stack>
  );
}
