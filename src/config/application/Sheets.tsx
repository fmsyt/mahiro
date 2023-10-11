import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormLabel, IconButton, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import SaveIcon from '@mui/icons-material/Save';

import { ConfigControlProps, ConfigSheetItemProps, ConfigSheetProps, ControlStyle, isTypeOfConfigSheetItemProps } from "../../interface";
import fetchSheets from "../fetchSheets";
import useControls from "../useControls";
import saveSheets from "../saveSheets";


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
          <ErrorIcon color="error" />
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
              value={control?.id || ""}
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
              value={item.type.toLowerCase()}
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
              defaultValue={item.label || ""}
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

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeletePageDialog, setOpenDeletePageDialog] = useState(false);

  const [sheets, setSheets] = useState<ConfigSheetProps[] | null>(null);
  const [invalidJson, setInvalidJson] = useState(false);
  const [page, setPage] = useState(1);

  const pageIndex = page - 1;

  const [columns, setColumns] = useState(sheets?.[pageIndex].columns || 4);

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
    const newSheets = [...(sheets || [])];
    newSheets[pageIndex].items[itemIndex] = item;
    setSheets(newSheets);
  }, [sheets]);


  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    if (sheets?.[page - 1]) {
      setColumns(sheets[page - 1].columns);
    }
  }, [sheets]);

  const addEmptyControl = useCallback(() => {
    setSheets((prev) => {
      const newSheets = [...(prev || [])];
      newSheets[pageIndex].items.push({
        control_id: undefined,
        type: ControlStyle.Empty,
        label: "Empty",
        disabled: false
      });

      return newSheets;
    });
  }, [pageIndex]);

  const addPage = useCallback(() => {
    setSheets((prev) => {
      const newSheets = [...(prev || [])];
      newSheets.push({
        columns: 4,
        items: []
      });

      return newSheets;
    })

    setPage((prev) => prev + 1);
  }, []);

  const deletePage = useCallback((page: number) => {
    setSheets((prev) => {
      const newSheets = [...(prev || [])];
      newSheets.splice(page, 1);

      if (newSheets.length === 0) {
        newSheets.push({
          columns: 4,
          items: []
        });
      }

      setPage(newSheets.length);
      return newSheets;
    });

  }, []);

  const handleSave = useCallback(() => {
    saveSheets(sheets || []);
  }, [sheets]);

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="h5">Sheets</Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ textTransform: "none" }}
          startIcon={<SaveIcon />}
          onClick={() => setOpenSaveDialog(true)}
          >
          Save
        </Button>
      </Stack>

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
              <Paper sx={{ width: "100%", padding: 2 }}>
                <Stack direction="row" justifyContent="space-around" width="100%">
                  <Stack gap={1} direction="row" justifyContent="flex-start" alignItems="center" width="100%">
                    <FormLabel htmlFor="select-page">Page:</FormLabel>
                    <TextField
                      select
                      id="select-page"
                      value={page}
                      variant="outlined"
                      size="small"
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                    >
                      {Array(sheets.length).fill(0).map((_, index) => (
                        <MenuItem key={index} value={index + 1}>{index + 1}</MenuItem>
                      ))}
                    </TextField>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={addPage}
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      ページを追加
                    </Button>
                  </Stack>

                  <Tooltip title="Delete this page">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ textTransform: "none" }}
                      onClick={() => setOpenDeletePageDialog(true)}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </Stack>
              </Paper>

              <Paper sx={{ width: "100%", padding: 2 }}>
                <Stack gap={2} direction="column" width="100%" justifyContent="center" alignItems="start">
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
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={addEmptyControl}
                      >
                        <AddIcon />
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}

          <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
            <DialogContent>
              <DialogContentText>
                この状態を保存しますか？
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  handleSave();
                  setOpenSaveDialog(false);
                }}
                >
                保存
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpenSaveDialog(false)}
                >
                キャンセル
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDeletePageDialog} onClose={() => setOpenDeletePageDialog(false)}>
            <DialogContent>
              <DialogContentText>
                表示中のページを削除しますか？
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  deletePage(pageIndex);
                  setOpenDeletePageDialog(false);
                }}
                >
                削除
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenDeletePageDialog(false)}
                >
                キャンセル
              </Button>
            </DialogActions>
          </Dialog>

        </Stack>
      )}
    </Stack>
  );
}
