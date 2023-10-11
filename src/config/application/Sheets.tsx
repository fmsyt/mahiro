import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Dialog, FormControl, FormLabel, MenuItem, Pagination, Select, Stack, TextField, Typography } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

import { ConfigControlProps, ConfigSheetItemProps, ConfigSheetProps, ControlStyle, isTypeOfConfigSheetItemProps } from "../../interface";
import fetchSheets from "../fetchSheets";
import useControls from "../useControls";


interface SheetPageControlProps {
  control?: ConfigControlProps;
  controls: ConfigControlProps[];
  defaultItem: ConfigSheetItemProps;
  onChange?: (item: ConfigSheetItemProps) => void;
}

const SheetPageControl = (props: SheetPageControlProps) => {

  const [open, setOpen] = useState(false);
  const { control, controls, defaultItem, onChange } = props;

  const [item, setItem] = useState<ConfigSheetItemProps>(defaultItem);
  const isError = item.type !== ControlStyle.Empty && !control;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((key: string, value: any) => {
    setItem((prev) => {
      const newItem = { ...prev, [key]: value };
      onChange?.(newItem);

      isTypeOfConfigSheetItemProps(newItem);

      return newItem;
    });

  }, [onChange]);

  return (
    <>
      <Button
        variant="outlined"
        sx={{ textTransform: "none" }}
        disabled={item.disabled}
        startIcon={isError && (
          <ErrorIcon
            color="error"
            />
        )}
        onClick={() => setOpen(true)}
      >
        {item.label}
      </Button>
      <Dialog open={open} onClose={() => item.type !== ControlStyle.Empty && setOpen(false)}>
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="center"
          padding={2}
          gap={2}
        >
          <FormControl>
            <FormLabel>Control</FormLabel>
            <Select
              defaultValue={control?.id}
              variant="standard"
              onChange={(e) => handleChange("control_id", e.target.value)}
            >
              {controls.map((control, index) => (
                <MenuItem key={index} value={control.id}>{control.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>UI Type</FormLabel>
            <Select
              defaultValue={item.type.toLowerCase()}
              variant="standard"
              onChange={(e) => handleChange("type", e.target.value)}
            >
              {Object.keys(ControlStyle).map((key) => (
                <MenuItem key={key} value={key.toLowerCase()}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Label</FormLabel>
            <TextField
              defaultValue={item.label}
              variant="standard"
              onChange={(e) => handleChange("label", e.target.value)}
              />
          </FormControl>
        </Stack>
      </Dialog>
    </>
  )
}


export default function Sheets() {

  const { controls } = useControls();

  const [sheets, setSheets] = useState<ConfigSheetProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);
  const [page, setPage] = useState(1);

  const pageIndex = page - 1;

  const [columns, setColumns] = useState(1);

  useEffect(() => {

    const read = async () => {

      try {
        const controls = await fetchSheets();
        setSheets(controls);

      } catch (error) {
        console.error(error);
        setInvalidJson(true);
      }
    }

    read();

  }, []);

  const findControl = useCallback((id?: string) => controls?.find((control) => control.id === id), [controls]);
  const handleSheetItemChange = useCallback((item: ConfigSheetItemProps, pageIndex: number, itemIndex: number) => {

    console.log(item, pageIndex, itemIndex);

    const newSheets = [...(sheets || [])];
    newSheets[pageIndex].items[itemIndex] = item;
    setSheets(newSheets);
  }, [sheets]);


  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
    if (sheets?.[page - 1]) {
      setColumns(sheets[page - 1].columns);
    }
  }, [sheets]);

  return (
    <Stack>
      <Typography variant="h5">Sheets</Typography>

      {sheets == null ? (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      ) : (
        <Stack gap={2}>
          {invalidJson && (
            <Typography variant="body1">
              Invalid JSON in controls.json
            </Typography>
          )}


          {!!sheets?.[pageIndex] && (
            <Stack direction="column" gap={2} justifyContent="center" alignItems="start">
              <Button variant="contained">Save</Button>
              <TextField
                label="Columns"
                value={columns}
                variant="standard"
                inputProps={{
                  type: "number",
                  min: 1,
                 }}
                onChange={(e) => setColumns(Number(e.target.value))}
                />

              <Box
                gap={2}
                sx={{
                    display: "grid",
                    width: "100%",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.ceil(sheets[pageIndex].items.length / columns)}, 1fr)`
                  }}>
                {sheets[pageIndex].items.map((item, index) => (
                  <SheetPageControl
                    key={index}
                    control={findControl(item.control_id)}
                    controls={controls || []}
                    defaultItem={item}
                    onChange={(item) => handleSheetItemChange(item, pageIndex, index)}
                    />
                ))}
              </Box>
            </Stack>
          )}

          <Stack justifyContent="center" alignItems="center">
            <Pagination
              count={sheets.length}
              onChange={handlePageChange}
              />
          </Stack>

        </Stack>
      )}
    </Stack>
  );
}
