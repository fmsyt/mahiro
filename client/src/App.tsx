import React, { useMemo, useState } from "react"
import Board from "./Board"

import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import { Box, CssBaseline, Drawer, Divider, List, ListItem, ThemeProvider, Toolbar, Typography, createTheme, styled, useMediaQuery, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import CastConnectedIcon from '@mui/icons-material/CastConnected';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


import Settings from "./Settings";

import { AppContextProvider } from "./AppContext";

const defaultWebSocketUri = process.env.NODE_ENV === "production"
  ? `ws://${window.location.host}/ws`
  : `ws://${window.location.hostname}:8000/ws`
  ;




const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));



const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);

  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };



  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>

        <AppContextProvider uri={defaultWebSocketUri}>

          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{ mr: 2, ...(open && { display: 'none' }) }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  Mahiro
                </Typography>
              </Toolbar>
            </AppBar>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              }}
              variant="persistent"
              anchor="left"
              open={open}
            >
              <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              </DrawerHeader>
              <Divider />

              <DrawerItem />
            </Drawer>
            <Main open={open}>
              <DrawerHeader />

              <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Main>
          </Box>


        </AppContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}


const DrawerItem = () => {

  const navigate = useNavigate();

  return (
    <>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { navigate("/settings") }}>
            <ListItemIcon>
              <CastConnectedIcon />
            </ListItemIcon>
            <ListItemText primary="Connection" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )
}

export default App;
