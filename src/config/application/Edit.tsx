import { SyntheticEvent, useCallback, useState } from "react";
import { Box, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import Controls from "./Controls";
import Sheets from "./Sheets";

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
export default function Edit(): JSX.Element {

  const [currentTab, setCurrentTab] = useState(0);
  const handleChange = useCallback((event: SyntheticEvent, newValue: number) => setCurrentTab(newValue), []);

  return (
    <Container>
      <Stack gap={2}>
        <Typography variant="h5">画面編集</Typography>

        <Tabs value={currentTab} onChange={handleChange}>
          <Tab label="Controls" { ...a11yProps(0) } />
          <Tab label="Sheets" { ...a11yProps(1) } />
        </Tabs>

        <CustomTabPanel value={currentTab} index={0}>
          <Controls />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={1}>
          <Sheets />
        </CustomTabPanel>
      </Stack>
    </Container>
  );
}


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingTop: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}
