import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { fs } from "@tauri-apps/api";

import { Box, Button, Card, CardActionArea, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormLabel, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { md5 } from "js-md5";

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import InputIcon from '@mui/icons-material/Input';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';

import { ConfigControlProps, ConfigSheetItemProps, ConfigSheetProps, ControlStyle, isTypeOfConfigSheetItemProps } from "../../interface";
import fetchSheets from "../fetchSheets";
import useControls from "../useControls";
import saveSheets from "../saveSheets";
import { Control } from "../../Control";
import { iconsRoot } from "../../path";
import useIcon from "../../icon/useIcon";


interface SheetPageControlProps {
  control?: ConfigControlProps;
  controls: ConfigControlProps[];
  defaultItem: ConfigSheetItemProps;
  onChange?: (item: ConfigSheetItemProps) => void;
  deleteItem?: () => void;
}

enum OpenDialog {
  None,
  DeleteDialog,
  EditDialog,
}

enum OpenMenu {
  None,
  EditMenu,
  IconMenu,
  SetIconMenu,
  DeleteIconMenu,
}

const SheetPageControl = (props: SheetPageControlProps) => {

  const { control, controls, defaultItem, onChange } = props;
  const [openDialog, setOpenDialog] = useState(OpenDialog.None);
  const [openMenu, setMenu] = useState(OpenMenu.None);

  const openEditDialog = useMemo(() => openDialog === OpenDialog.EditDialog, [openDialog]);
  const openDeleteDialog = useMemo(() => openDialog === OpenDialog.DeleteDialog, [openDialog]);
  const openEditMenu = useMemo(() => openMenu === OpenMenu.EditMenu, [openMenu]);
  const openIconMenu = useMemo(() => openMenu === OpenMenu.IconMenu, [openMenu]);

  const anchorRef = useRef<HTMLElement>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const iconSrc = useIcon(defaultItem.icon);

  const handleOpenMenu = useCallback((content: OpenMenu, target: HTMLElement) => {
    setMenu(content);
    anchorRef.current = target;
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenu(OpenMenu.None);
    anchorRef.current = null;
  }, []);

  const handleOpenDialog = useCallback((content: OpenDialog) => {
    handleCloseMenu();
    setOpenDialog(content)
  }, [handleCloseMenu]);

  const handleCloseDialog = useCallback(() => {
    handleCloseMenu();
    setOpenDialog(OpenDialog.None)
  }, [handleCloseMenu]);




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


  const previewIconRef = useRef<HTMLImageElement>(null);
  const handleChangeIcon = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (file == null) {
      return;
    }

    // assert file is image
    if (!file.type.startsWith("image/")) {
      return;
    }

    const extention = file.name.split(".").pop();


    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const hash = md5(arrayBuffer);

      const filename = `${hash}.${extention}`;
      createTempIcon(arrayBuffer, filename).then(() => {
        handleChange("icon", filename);
      })
    }

    reader.readAsArrayBuffer(file);
    previewIconRef.current?.setAttribute("src", URL.createObjectURL(file));

  }, [handleChange]);


  return (
    <>
      <Button
        variant="outlined"
        disabled={item.disabled}
        onClick={(e) => handleOpenMenu(OpenMenu.EditMenu, e.currentTarget)}
        startIcon={isError && (
          <ErrorIcon color="error" />
        )}
        sx={{ textTransform: "none", padding: 0 }}
      >
        <Control
          sheetItem={{ ...item, style: item.type }}
          disabled={true}
          emit={() => {}}
          />
      </Button>
      <Menu
        open={openEditMenu}
        anchorEl={anchorRef.current}
        onClose={handleCloseDialog}
      >
        <MenuItem onClick={() => handleOpenDialog(OpenDialog.EditDialog)}>編集</MenuItem>
        <MenuItem onClick={() => handleOpenDialog(OpenDialog.DeleteDialog)}>削除</MenuItem>
      </Menu>
      <Dialog open={openEditDialog} onClose={() => item.type !== ControlStyle.Empty && handleCloseDialog()}>
        <DialogContent>
          <Stack
            direction="column"
            alignItems="flex-start"
            justifyContent="center"
            gap={2}
          >
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
              <FormLabel>Control</FormLabel>
              <Select
                value={control?.id || ""}
                variant="standard"
                disabled={item.type === ControlStyle.Empty}
                onChange={(e) => handleChange("control_id", e.target.value)}
              >
                {controls.map((control, index) => (
                  <MenuItem key={index} value={control.id}>{control.id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Label</FormLabel>
              <TextField
                defaultValue={item.label || ""}
                variant="standard"
                disabled={item.type === ControlStyle.Empty}
                onChange={(e) => handleChange("label", e.target.value)}
                />
            </FormControl>


            <FormControl>
              <FormLabel>Icon</FormLabel>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChangeIcon}
                ref={inputFileRef}
                />

              <Card>
                <CardActionArea
                  onClick={(e) => handleOpenMenu(OpenMenu.IconMenu, e.currentTarget)}
                >
                  <CardMedia
                    component="img"
                    image={iconSrc}
                    ref={previewIconRef}
                    alt=""
                    sx={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                    }}
                    />
                </CardActionArea>
              </Card>
              <Menu
                open={openIconMenu}
                onClose={handleCloseMenu}
                anchorEl={anchorRef.current}
              >
                <MenuItem onClick={() => inputFileRef.current?.click()}>
                  <ListItemIcon>
                    <InputIcon />
                  </ListItemIcon>
                  <ListItemText primary="Change" />
                </MenuItem>
                <MenuItem onClick={() => handleOpenDialog(OpenDialog.DeleteDialog)}>
                  <ListItemIcon>
                    <DeleteForeverIcon />
                  </ListItemIcon>
                  <ListItemText primary="Remove" />
                </MenuItem>
              </Menu>
            </FormControl>

            {import.meta.env.DEV && (
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </Box>
            )}

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: "none" }}
            onClick={handleCloseDialog}
            >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={() => handleOpenDialog(OpenDialog.None)}>
        <DialogContent>
          <DialogContentText>
            このコントロールを削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              props.deleteItem?.();
              handleOpenDialog(OpenDialog.None)
            }}
          >
            削除
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleOpenDialog(OpenDialog.None)}
          >
            キャンセル
          </Button>
        </DialogActions>
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

  useLayoutEffect(() => {

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
        label: undefined,
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

  const deleteItem = useCallback((itemIndex: number) => {
    setSheets((prev) => {
      const newSheets = [...(prev || [])];
      newSheets[pageIndex].items.splice(itemIndex, 1);
      return newSheets;
    });
  }, [pageIndex]);

  const handleSave = useCallback(async () => {

    if (!sheets) {
      return;
    }

    console.log("handleSave", sheets);

    const promises = sheets.map((sheet) => {
      const list = sheet.items
        .filter((item) => item.icon != null)
        .map((item) => commitCreateTempIcon(item.icon));

      return list;
    }).flat();

    await Promise.all(promises);
    await saveSheets(sheets || []);

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
                      color="secondary"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      sx={{
                        textTransform: "none",
                        "&:hover": {
                          color: "error.main",
                          borderColor: "error.main",
                        }
                      }}
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
                      height: "50vh",
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.ceil(sheets[pageIndex].items.length / columns)}, 1fr)`
                    }}>
                    {sheets[pageIndex].items.map((item, index) => (
                      <SheetPageControl
                        key={`${pageIndex * 10000 + index}.${item.control_id}`}
                        control={findControl(item.control_id)}
                        controls={controls || []}
                        defaultItem={item}
                        onChange={(item) => handleSheetItemChange(item, pageIndex, index)}
                        deleteItem={() => deleteItem(index)}
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





async function createTempIcon(icon: ArrayBuffer, filename: string) {

  const tempname = `${filename}.tmp`;
  const savePath = `${iconsRoot}/${tempname}`;

  console.info("createTempIcon", savePath);

  await fs.createDir(iconsRoot, { recursive: true, dir: fs.BaseDirectory.AppCache });

  if (await fs.exists(savePath, { dir: fs.BaseDirectory.AppCache })) {
    await fs.removeFile(savePath, { dir: fs.BaseDirectory.AppCache });
  }

  await fs.writeBinaryFile(savePath, new Uint8Array(icon), { dir: fs.BaseDirectory.AppCache, append: false });
}

async function commitCreateTempIcon(filename: string) {

  const config = {
    dir: fs.BaseDirectory.AppCache
  }

  const tempname = `${filename}.tmp`;

  // exit if temp file does not exist
  if (!await fs.exists(`${iconsRoot}/${tempname}`, config)) {
    return;
  }

  // exit if file already exists
  if (await fs.exists(`${iconsRoot}/${filename}`, config)) {
    await fs.removeFile(`${iconsRoot}/${filename}`, config);
  }

  await fs.renameFile(`${iconsRoot}/${tempname}`, `${iconsRoot}/${filename}`, config);
}

async function deleteIcon(filename: string) {

  const config = {
    dir: fs.BaseDirectory.AppCache
  }

  const savePath = `${iconsRoot}/${filename}`;

  if (await fs.exists(savePath, config)) {
    await fs.removeFile(savePath, config);
  }

  if (await fs.exists(`${savePath}.tmp`, config)) {
    await fs.removeFile(`${savePath}.tmp`, config);
  }
}
