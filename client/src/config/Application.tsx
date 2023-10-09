import { useContext } from "react";

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import ThemeContext from "../ThemeContext";

import { Button, ButtonGroup, Checkbox, FormControl, FormControlLabel, FormLabel, Stack, Tooltip, Typography } from "@mui/material";
import { Form } from "react-router-dom";

/**
 * General tab for the config app.
 * - application settings
 *   - set connection to server
 *   - OTP settings
 * - visibility of the app
 *   - switch dark mode
 *   - set most top
 *
 * @returns { JSX.Element }
 */
export default function Application(): JSX.Element {

  const { themeMode, setThemeMode } = useContext(ThemeContext);

  return (
    <Stack gap={2}>
      <Typography variant="h5">全般</Typography>

      <FormControl>
        <FormLabel>表示モード</FormLabel>
        <ButtonGroup>
          <Tooltip title="System">
            <Button
              variant={themeMode === "system" ? "contained" : "outlined"}
              onClick={() => { setThemeMode("system") }}
              startIcon={themeMode === "system" ? <SettingsBrightnessIcon /> : undefined}
              sx={{ textTransform: "none" }}
            >
              {themeMode === "system" ? "System": <SettingsBrightnessIcon />}
            </Button>
          </Tooltip>
          <Tooltip title="Light">
            <Button
              variant={themeMode === "light" ? "contained" : "outlined"}
              onClick={() => { setThemeMode("light") }}
              startIcon={themeMode === "light" ? <LightModeIcon /> : undefined}
              sx={{ textTransform: "none" }}
            >
              {themeMode === "light" ? "Light": <LightModeIcon />}
            </Button>
          </Tooltip>
          <Tooltip title="Dark">
            <Button
              variant={themeMode === "dark" ? "contained" : "outlined"}
              onClick={() => { setThemeMode("dark") }}
              startIcon={themeMode === "dark" ? <DarkModeIcon /> : undefined}
              sx={{ textTransform: "none" }}
            >
              {themeMode === "dark" ? "Dark": <DarkModeIcon />}
            </Button>
          </Tooltip>
        </ButtonGroup>
      </FormControl>

      <FormControl>
        <FormLabel>最前面に表示</FormLabel>
        <FormControlLabel
          control={<Checkbox />}
          label="最前面に表示する"
          />
      </FormControl>
    </Stack>
  );
}
