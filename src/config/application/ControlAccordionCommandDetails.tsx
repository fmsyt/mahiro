import { useCallback } from "react";
import { Button, FormControl, FormLabel, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { ConfigCommandControlProps, isTypeOfConfigCommandControl } from "../../interface";
import { ControlAccordionDetailsProps } from "./Controls";

export default function ControlAccordionCommandDetails(props: ControlAccordionDetailsProps) {

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
    <Stack gap={2}>
      <FormControl>
        <FormLabel>Command</FormLabel>
        <TextField
          defaultValue={command}
          variant="standard"
          onChange={(e) => setControl({ ...control, command: e.target.value })} />
      </FormControl>
      <FormControl>
        <FormLabel>arguments</FormLabel>

        <Stack gap={2} alignItems="flex-start">
          {args.map((arg, index) => (
            <Stack key={index} direction="row" gap={2}>
              <TextField
                key={index}
                defaultValue={arg}
                variant="standard"
                onChange={(e) => {
                  const newArgs = [...args];
                  newArgs[index] = e.target.value;
                  setControl({ ...control, commands: [command, ...newArgs] });
                } } />

              <Tooltip title="この引数を削除">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteArgument(index)}
                >
                  <RemoveCircleIcon
                    sx={{
                      "&:hover": {
                        color: "error.main",
                        borderColor: "error.main",
                      }
                    }} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}

          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: "none" }}
            onClick={() => { setControl((prev) => ({ ...prev, commands: [command, ...args, ""] })); } }
          >
            Add argument
          </Button>
        </Stack>
      </FormControl>
    </Stack>
  );
}
