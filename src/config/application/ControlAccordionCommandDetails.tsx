import { Button, FormControl, FormLabel, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { ConfigCommandControlProps } from "../../interface";
import { ControlAccordionDetailsProps } from "./Controls";

export default function ControlAccordionCommandDetails(props: ControlAccordionDetailsProps) {

  const { control, onChange } = props;
  const commands = (control as ConfigCommandControlProps).commands || [];

  const command = commands[0] || "";
  const [, ...args] = commands || [];

  const handleDeleteArgument = (index: number) => {

    const newCommands = [...commands];
    newCommands.splice(index, 1);

    onChange("commands", newCommands);
  }

  const handleChangeParameter = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;

    onChange("commands", newCommands);
  }



  return (
    <Stack gap={2}>
      <FormControl>
        <FormLabel>Command</FormLabel>
        <TextField
          defaultValue={command}
          variant="standard"
          onChange={(e) => handleChangeParameter(0, e.target.value) }
          />
      </FormControl>
      <FormControl>

      <Stack gap={1} alignItems="flex-start">
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
                  handleChangeParameter(index + 1, e.target.value);
                } } />

              <Tooltip title="この引数を削除">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteArgument(index + 1)}
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
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => onChange("commands", [...commands, ""])}
          >
            Add argument
          </Button>
        </Stack>

      </Stack>
      </FormControl>
    </Stack>
  );
}
