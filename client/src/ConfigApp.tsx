import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';

import Application from './config/Application';
import ApplicationEdit from './config/application/Edit';
import Security from './config/security/Connection';
import ThemeContextProvider from './ThemeContextProvider';

const drawerWidth = 180;

export default function ConfigApp() {

  const [currentTab, setCurrentTab] = React.useState("application");

  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>

        <Drawer
          anchor="left"
          variant="permanent"
          sx={{
            flexShrink: 0,
            width: drawerWidth,
          }}
        >
          <List
            component="nav"
            dense
            sx={{ width: drawerWidth }}
            subheader={
              <ListSubheader component="div">
                アプリケーション
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemButton onClick={() => setCurrentTab("application")} selected={currentTab === "application"}>
                <ListItemText primary="全般" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={() => setCurrentTab("application.edit")} selected={currentTab === "application.edit"}>
                <ListItemText primary="画面編集" />
              </ListItemButton>
            </ListItem>

          </List>
          <List
            component="nav"
            dense
            subheader={
              <ListSubheader component="div">
                セキュリティ
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemButton onClick={() => setCurrentTab("security")} selected={currentTab === "security"}>
                <ListItemText primary="接続" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1 }}>
          <CustomTabPanel value={currentTab} index="application">
            <Application />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index="application.edit">
            <ApplicationEdit />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index="security">
            <Security />
          </CustomTabPanel>
        </Box>

      </Box>
    </ThemeContextProvider>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
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
