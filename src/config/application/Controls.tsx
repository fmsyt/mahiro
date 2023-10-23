import { useCallback, useEffect, useRef, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardActionArea, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormLabel, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";

import { fs } from "@tauri-apps/api";

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InputIcon from '@mui/icons-material/Input';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { ConfigBrowserControlProps, ConfigCommandControlProps, ConfigControlProps, ConfigHotkeyControlProps, ConfigKeyboardControlProps, ControlType, isTypeOfConfigCommandControl } from "../../interface";
import fetchControls from "../fetchControls";
import saveControls from "../saveControls";
import useIcon from "../../icon/useIcon";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;


interface ControlAccordionProps {
  initialControl: ConfigControlProps;
  index: number;
  onSave?: (control: ConfigControlProps) => void;
  onRemove?: (control: ConfigControlProps) => void;
}

const ControlAccordion = (props: ControlAccordionProps) => {

  const { index, initialControl, onRemove } = props;
  const [control, setControl] = useState<ConfigControlProps>(initialControl);

  const previewIconRef = useRef<HTMLImageElement>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const iconSrc = useIcon(control.icon);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteIconDialog, setOpenDeleteIconDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [openMenu, setOpenMenu] = useState(false);
  const [openIconMenu, setOpenIconMenu] = useState(false);

  const handelOpenMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpenMenu(true);
    setOpenIconMenu(false);

    setAnchorEl(e.currentTarget);
  }, []);

  const handleOpenIconMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpenMenu(false);
    setOpenIconMenu(true);

    setAnchorEl(e.currentTarget);
  }, []);

  const handelCloseMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpenMenu(false);
    setOpenIconMenu(false);
    setAnchorEl(null);
  }, []);

  const handleOpenRemoveDialog = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    handelCloseMenu(e);
    setOpenDeleteDialog(true);
  }, [handelCloseMenu]);

  const handleOpenRemoveIconDialog = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    handelCloseMenu(e);
    setOpenDeleteIconDialog(true);
  }, [handelCloseMenu]);

  const handleRemove = useCallback(() => {

    setOpenDeleteDialog(false);
    onRemove?.(control);

    const removeIcon = async () => {
      if (!control.icon) {
        return;
      }

      const filename = `${control.id}.cache`;
      const savePath = `icons/${filename}`;

      if (await fs.exists(savePath, { dir: fs.BaseDirectory.AppCache })) {
        await fs.removeFile(savePath, { dir: fs.BaseDirectory.AppCache });
      }

      if (await fs.exists(`${savePath}.tmp`, { dir: fs.BaseDirectory.AppCache })) {
        await fs.removeFile(`${savePath}.tmp`, { dir: fs.BaseDirectory.AppCache });
      }
    }

    removeIcon();

  }, [control, onRemove]);


  const handleRemoveIcon = useCallback(async () => {

    setOpenDeleteIconDialog(false);

    if (!control.icon) {
      return;
    }

    const filename = `${control.id}.cache`;
    const tempname = `${filename}.tmp`;
    const dir = "icons";

    if (await fs.exists(`${dir}/${filename}`, { dir: fs.BaseDirectory.AppCache })) {
      await fs.removeFile(`${dir}/${filename}`, { dir: fs.BaseDirectory.AppCache });
    }

    if (await fs.exists(`${dir}/${tempname}`, { dir: fs.BaseDirectory.AppCache })) {
      await fs.removeFile(`${dir}/${tempname}`, { dir: fs.BaseDirectory.AppCache });
    }

    setControl((prev) => ({ ...prev, icon: undefined }));


  }, [control]);

  const handleChange = useCallback((key: string, value: string) => {
    setControl((prev) => ({ ...prev, [key]: value }));
  }, []);


  const handleChangeIcon = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (file == null) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;

      const createTemp = async () => {

        await fs.createDir("icons", { recursive: true, dir: fs.BaseDirectory.AppCache });

        const filename = `${control.id}.cache`;

        const tempname = `${filename}.tmp`;
        const savePath = `icons/${tempname}`;

        if (await fs.exists(savePath, { dir: fs.BaseDirectory.AppCache })) {
          await fs.removeFile(savePath, { dir: fs.BaseDirectory.AppCache });
        }

        try {
          await fs.writeTextFile(savePath, result, { dir: fs.BaseDirectory.AppCache, append: false });

        } catch (error) {
          console.error(error);
        }

        setControl((prev) => ({ ...prev, icon: filename }));
      }

      createTemp();
    }

    reader.readAsDataURL(file);
    previewIconRef.current?.setAttribute("src", URL.createObjectURL(file));

  }, [control.id]);


  const handleSave = useCallback(() => {

    const save = async () => {

      const config = {
        dir: fs.BaseDirectory.AppCache
      }

      const filename = `${control.id}.cache`;
      const tempname = `${filename}.tmp`;
      const dir = "icons";

      // exit if temp file does not exist
      if (!await fs.exists(`${dir}/${tempname}`, config)) {
        return;
      }

      // exit if file already exists
      if (await fs.exists(`${dir}/${filename}`, config)) {
        await fs.removeFile(`${dir}/${filename}`, config);
      }

      if (control.icon) {
        await fs.renameFile(`${dir}/${tempname}`, `${dir}/${filename}`, config);
      }

      props.onSave?.(control);
    }

    save();

  }, [control, props]);

  return (
    <Accordion key={index}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${initialControl.id}-content`}
        id={`panel-${initialControl.id}-header`}
        sx={{ flexDirection: "row-reverse", gap: 2 }}
      >
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
          >
            <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
              {`${index + 1}.${initialControl.label || initialControl.id}`}
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

          <IconButton onClick={handelOpenMenu} disabled={disallowed}>
            <MoreHorizIcon />
          </IconButton>
          <Menu open={openMenu} onClose={handelCloseMenu} anchorEl={anchorEl}>
            <MenuItem onClick={handleOpenRemoveDialog}>
              <ListItemIcon>
                <DeleteForeverIcon />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>

        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={2} alignItems="flex-start" justifyContent="center">
          <FormControl>
            <TextField
              label="ID"
              defaultValue={control.id}
              variant="standard"
              onChange={(e) => handleChange("id", e.target.value)}
              />
          </FormControl>
          <FormControl>
            <TextField
              label="Description"
              defaultValue={control.description}
              variant="standard"
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              />
          </FormControl>
          <FormControl>
            <FormLabel>Control Type</FormLabel>
            <Select
              value={control.type}
              variant="standard"
              onChange={(e) => handleChange("type", e.target.value)}
            >
              {Object.keys(ControlType).map((key) => (
                <MenuItem key={key} value={key.toLowerCase()}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Icon</FormLabel>
            <input
              id={`${index + 1}.${initialControl.label || initialControl.id}.icon`}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleChangeIcon}
              ref={inputFileRef}
              />

            <Card>
              <CardActionArea
                onClick={handleOpenIconMenu}
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
              onClose={handelCloseMenu}
              anchorEl={anchorEl}
            >
              <MenuItem onClick={() => inputFileRef.current?.click()}>
                <ListItemIcon>
                  <InputIcon />
                </ListItemIcon>
                <ListItemText primary="Change" />
              </MenuItem>
              <MenuItem onClick={handleOpenRemoveIconDialog}>
                <ListItemIcon>
                  <DeleteForeverIcon />
                </ListItemIcon>
                <ListItemText primary="Remove" />
              </MenuItem>
            </Menu>
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
            onClick={handleSave}
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

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogContent>
          <DialogContentText>
            このコントロールを削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={() => setOpenDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={handleRemove}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteIconDialog} onClose={() => setOpenDeleteIconDialog(false)}>
        <DialogContent>
          <DialogContentText>
            このアイコンを削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={() => setOpenDeleteIconDialog(false)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={handleRemoveIcon}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
        defaultValue={url}
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
    <Stack gap={2}>
      <FormControl>
        <FormLabel>Command</FormLabel>
        <TextField
          defaultValue={command}
          variant="standard"
          onChange={(e) => setControl({ ...control, command: e.target.value })}
          />
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
                  setControl({ ...control, commands: [command, ...newArgs] })
                }}
                />

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
        </Stack>
      </FormControl>
    </Stack>
  )
}

const ControlAccordionKeyboardDetails = (props: ControlAccordionDetailsProps) => {

  const { control, setControl } = props;
  const text = (control as ConfigKeyboardControlProps).text || "";

  return (
    <FormControl>
      <FormLabel>Text</FormLabel>
      <TextField
        defaultValue={text}
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
                setControl({ ...control, hotkeys: newHotkeys })
              }}
              />

            <Tooltip title="このホットキーを削除">
              <IconButton
                size="small"
                onClick={() => {
                  const newHotkeys = [...hotkeys];
                  newHotkeys.splice(index, 1);
                  setControl({ ...control, hotkeys: newHotkeys })
                }}
              >
                <RemoveCircleIcon
                  sx={{
                    "&:hover": {
                      color: "error.main",
                      borderColor: "error.main",
                    }
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
      </Stack>

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

  const handleRemove = useCallback((index: number) => {

    const newControls = [...controls!];
    newControls.splice(index, 1);

    saveControls(newControls).then(() => {
      setControls(newControls);
    });

  }, [controls]);

  return (
    <Stack gap={2} alignItems="flex-start" justifyContent="center">
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
        <Stack gap={2} sx={{ width: "100%" }}>
          {invalidJson && (
            <Typography variant="body1">
              Invalid JSON in controls.json
            </Typography>
          )}

          <Box width="100%">
            {controls.map((control, index) => (
              <ControlAccordion
                key={index}
                initialControl={control}
                index={index}
                onSave={(control) => handleSave(control, index)}
                onRemove={() => handleRemove(index)}
                />
            ))}
          </Box>

        </Stack>
      )}

      <Button
        variant="outlined"
        color="primary"
        sx={{ textTransform: "none", marginLeft: "auto" }}
        onClick={() => {
          const newControls = [...controls];
          newControls.push({
            id: "(New Control)",
            description: "",
            type: ControlType.Browser,
            url: "",
          });
          setControls(newControls);
        }}
      >
        Add control
      </Button>
    </Stack>
  );
}
