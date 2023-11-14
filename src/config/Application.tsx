import { useContext, useLayoutEffect, useState } from "react";

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import ThemeContext from "../ThemeContext";

import { Button, ButtonGroup, Checkbox, Container, FormControl, FormControlLabel, FormHelperText, FormLabel, Stack, Tooltip, Typography } from "@mui/material";

import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import { WebviewWindow } from "@tauri-apps/api/window";

const mainWindow = WebviewWindow.getByLabel("main");

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
  const [isAutoStart, setIsAutoStart] = useState<boolean | null>(null);
  const [isTopMost, setIsTopMost] = useState<boolean | null>(null);

  useLayoutEffect(() => {

    const func = async () => {
      const enabled = await isEnabled();
      if (import.meta.env.DEV) {
        console.info("Auto start is not available in development mode.");
        enabled && await disable();
        return;
      }

      setIsAutoStart(enabled);
    }


    func();

  }, []);

  const handleChangeEnableAutoStart = async (toEnable: boolean) => {
    setIsAutoStart(null);
    if (toEnable) {
      await enable();
      setIsAutoStart(true);
    } else {
      await disable();
      setIsAutoStart(false);
    }
  }

  const handleChangeTopMost = async (toEnable: boolean) => {
    setIsTopMost(null);
    if (toEnable) {
      await mainWindow.setAlwaysOnTop(true);
      setIsTopMost(true);
    } else {
      await mainWindow.setAlwaysOnTop(false);
      setIsTopMost(false);
    }
  }


  return (
    <Container>
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
            label="最前面に表示する"
            control={(
              <Checkbox
                checked={isTopMost === true}
                onChange={(e) => { handleChangeTopMost(e.target.checked) }}
                />
            )}
            />
        </FormControl> 
        <FormControl>
          <FormLabel>自動実行</FormLabel>
          <FormControlLabel
            label="システム起動時に実行する"
            control={(
              <Checkbox
                disabled={isAutoStart === null}
                checked={isAutoStart === true}
                onChange={(e) => { handleChangeEnableAutoStart(e.target.checked) }}
                />
            )}
            />

          {import.meta.env.DEV && (
            <FormHelperText>開発ビルドではロックしています。</FormHelperText>
          )}
        </FormControl>
      </Stack>
    </Container>
  );
}
