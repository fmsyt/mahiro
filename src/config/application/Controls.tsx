import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormLabel, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { fs } from "@tauri-apps/api";

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { ConfigControlProps, ControlType } from "../../interface";
import fetchControls from "../fetchControls";
import saveControls from "../saveControls";

import { iconsRoot } from "../../path";

import ControlAccordionBrowserDetails from "./ControlAccordionBrowserDetails";
import ControlAccordionCommandDetails from "./ControlAccordionCommandDetails";
import ControlAccordionHotkeyDetails from "./ControlAccordionHotkeyDetails";
import ControlAccordionKeyboardDetails from "./ControlAccordionKeyboardDetails";

const disallowed = !import.meta.env.TAURI_PLATFORM_VERSION;


interface ControlAccordionProps {
  initialControl: ConfigControlProps;
  index: number;
  onSave?: (control: ConfigControlProps) => void;
  onRemove?: (control: ConfigControlProps) => void;
}

export interface ControlAccordionDetailsProps {
  control: ConfigControlProps;
  onChange: (key: keyof ConfigControlProps, value: unknown) => void;
}

const ControlAccordion = (props: ControlAccordionProps) => {

  const { index, initialControl, onRemove, onSave } = props;
  const [control, setControl] = useState<ConfigControlProps>(initialControl);

  const inputFileExtensionRef = useRef<string>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteIconDialog, setOpenDeleteIconDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [openMenu, setOpenMenu] = useState(false);

  const handelOpenMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpenMenu(true);

    setAnchorEl(e.currentTarget);
  }, []);


  const handelCloseMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpenMenu(false);
    setAnchorEl(null);
  }, []);

  const handleOpenRemoveDialog = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    handelCloseMenu(e);
    setOpenDeleteDialog(true);
  }, [handelCloseMenu]);



  const handleRemove = useCallback(() => {

    setOpenDeleteDialog(false);
    onRemove?.(control);

    const removeIcon = async () => {
      if (!control.icon) {
        return;
      }

      const extention = inputFileExtensionRef.current;

      const filename = `${control.id}.${extention}`;
      const savePath = `${iconsRoot}/${filename}`;

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

    const extention = inputFileExtensionRef.current;

    const filename = `${control.id}.${extention}`;
    const tempname = `${filename}.tmp`;

    if (await fs.exists(`${iconsRoot}/${filename}`, { dir: fs.BaseDirectory.AppCache })) {
      await fs.removeFile(`${iconsRoot}/${filename}`, { dir: fs.BaseDirectory.AppCache });
    }

    if (await fs.exists(`${iconsRoot}/${tempname}`, { dir: fs.BaseDirectory.AppCache })) {
      await fs.removeFile(`${iconsRoot}/${tempname}`, { dir: fs.BaseDirectory.AppCache });
    }

    setControl((prev) => ({ ...prev, icon: undefined }));


  }, [control]);

  const handleChange = useCallback((key: string, value: string) => {
    setControl((prev) => ({ ...prev, [key]: value }));
  }, []);


  const handleSave = useCallback(() => onSave?.(control), [control, onSave]);
  const handleDetailsChange = useCallback((key: keyof ConfigControlProps, value: unknown) => {
    setControl((prev) => ({ ...prev, [key]: value }));
  }, []);

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

          {control.type === ControlType.Browser && (
            <ControlAccordionBrowserDetails
              control={control}
              onChange={handleDetailsChange}
              />
          )}

          {control.type === ControlType.Command && (
            <ControlAccordionCommandDetails
              control={control}
              onChange={handleDetailsChange}
              />
          )}

          {control.type === ControlType.Keyboard && (
            <ControlAccordionKeyboardDetails
              control={control}
              onChange={handleDetailsChange}
              />
          )}

          {control.type === ControlType.Hotkey && (
            <ControlAccordionHotkeyDetails
              control={control}
              onChange={handleDetailsChange}
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
