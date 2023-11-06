import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';

import Application from './config/Application';
import ApplicationEdit from './config/application/Edit';
import Security from './config/security/Connection';
import ThemeContextProvider from './ThemeContextProvider';
import Path from './config/debug/Path';

import i18n from './i18n/config';

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
                {i18n.t("window.config.application")}
              </ListSubheader>
            }
          >
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentTab("application")} selected={currentTab === "application"}>
                <ListItemText primary={i18n.t("window.config.page.general.title")} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentTab("application.edit")} selected={currentTab === "application.edit"}>
                <ListItemText primary={i18n.t("window.config.page.edit_panels.title")} />
              </ListItemButton>
            </ListItem>

          </List>
          <List
            component="nav"
            dense
            subheader={
              <ListSubheader component="div">
                {i18n.t("window.config.security")}
              </ListSubheader>
            }
          >
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentTab("security")} selected={currentTab === "security"}>
                <ListItemText primary={i18n.t("window.config.page.connection.title")} />
              </ListItemButton>
            </ListItem>
          </List>

          {import.meta.env.MODE === "development" && (
            <List
              component="nav"
              dense
              subheader={
                <ListSubheader component="div">
                  {i18n.t("window.config.debug")}
                </ListSubheader>
              }
            >
              <ListItem disablePadding>
                <ListItemButton onClick={() => setCurrentTab("path")} selected={currentTab === "path"}>
                  <ListItemText primary="Path" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
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
          <CustomTabPanel value={currentTab} index="path">
            <Path />
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
