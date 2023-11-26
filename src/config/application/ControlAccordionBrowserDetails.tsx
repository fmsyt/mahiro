import { FormControl, FormLabel, TextField } from "@mui/material";
import { ConfigBrowserControlProps } from "../../interface";
import { ControlAccordionDetailsProps } from "./Controls";

export default function ControlAccordionBrowserDetails(props: ControlAccordionDetailsProps) {

  const { control, setControl } = props;
  const url = (control as ConfigBrowserControlProps).url || "";

  return (
    <FormControl>
      <FormLabel>URL</FormLabel>
      <TextField
        defaultValue={url}
        variant="standard"
        onChange={(e) => setControl({ ...control, url: e.target.value })} />
    </FormControl>
  );
}
