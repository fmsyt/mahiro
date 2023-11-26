import { Button, FormControl, FormLabel, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { ConfigHotkeyControlProps } from "../../interface";
import { ControlAccordionDetailsProps } from "./Controls";

export default function ControlAccordionHotkeyDetails(props: ControlAccordionDetailsProps) {

  const { control, setControl } = props;
  const hotkeys = (control as ConfigHotkeyControlProps).hotkeys || [];

  return (
    <FormControl>
      <FormLabel>Hotkey</FormLabel>

      <Stack gap={2} alignItems="flex-start">
        {hotkeys.map((hotkey, index) => (
          <Stack
            key={index}
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <TextField
              key={index}
              defaultValue={hotkey}
              variant="standard"
              onChange={(e) => {
                const newHotkeys = [...hotkeys];
                newHotkeys[index] = e.target.value;
                setControl({ ...control, hotkeys: newHotkeys });
              } } />

            <Tooltip title="このホットキーを削除">
              <IconButton
                size="small"
                onClick={() => {
                  const newHotkeys = [...hotkeys];
                  newHotkeys.splice(index, 1);
                  setControl({ ...control, hotkeys: newHotkeys });
                } }
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
          onClick={() => { setControl((prev) => ({ ...prev, hotkeys: [...hotkeys, ""] })); } }
        >
          Add hotkey
        </Button>
      </Stack>

    </FormControl>
  );
}
