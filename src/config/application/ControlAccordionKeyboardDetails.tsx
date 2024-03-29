import { FormControl, FormLabel, TextField } from "@mui/material";
import { ConfigKeyboardControlProps } from "../../interface";
import { ControlAccordionDetailsProps } from "./Controls";

export default function ControlAccordionKeyboardDetails(props: ControlAccordionDetailsProps) {

  const { control, onChange } = props;
  const text = (control as ConfigKeyboardControlProps).text || "";

  return (
    <FormControl>
      <FormLabel>Text</FormLabel>
      <TextField
        multiline
        fullWidth
        rows={4}
        defaultValue={text}
        variant="outlined"
        onChange={(e) => onChange("text", e.target.value || undefined)}
        />
    </FormControl>
  );
}
