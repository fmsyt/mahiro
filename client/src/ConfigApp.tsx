import React from 'react';

import General from './config/General';
import Controls from './config/Controls';
import Sheets from './config/Sheets';
import { Box, Container, Tab, Tabs } from '@mui/material';


export default function ConfigApp() {

  const [currentTab, setCurrentTab] = React.useState(0);
  const handleChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container>
      <Tabs value={currentTab} onChange={handleChange}>
        <Tab label="General" { ...a11yProps(0) } />
        <Tab label="Controls" { ...a11yProps(1) } />
        <Tab label="Sheets" { ...a11yProps(2) } />
      </Tabs>

      <CustomTabPanel value={currentTab} index={0}>
        <General />
      </CustomTabPanel>
      <CustomTabPanel value={currentTab} index={1}>
        <Controls />
      </CustomTabPanel>
      <CustomTabPanel value={currentTab} index={2}>
        <Sheets />
      </CustomTabPanel>
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
        <Box sx={{ p: 3 }}>
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
