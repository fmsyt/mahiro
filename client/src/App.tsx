import React, { memo, useCallback, useContext, useMemo, useState } from "react"
import Board from "./Board"

import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import { Box, CssBaseline, Drawer, Divider, List, ListItem, ThemeProvider, Toolbar, Typography, createTheme, styled, useMediaQuery, ListItemButton, ListItemIcon, ListItemText, useTheme } from "@mui/material";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import AppsIcon from '@mui/icons-material/Apps';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import Settings from "./Settings";

import { AppContext, AppContextProvider } from "./AppContext";

import "./App.css";

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

const defaultWebSocketUri = process.env.NODE_ENV === "production"
  ? `${protocol}//${window.location.host}/ws`
  : `${protocol}//${window.location.hostname}:8000/ws`
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





  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppContextProvider uri={defaultWebSocketUri}>
          <AppContent />
        </AppContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const AppContent = memo(() => {

  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const { hostname } = useContext(AppContext);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
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
          <Typography variant="h6" noWrap component="div">{hostname}</Typography>
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

        <DrawerItem handleDrawerClose={handleDrawerClose} />
      </Drawer>
      <Main open={open}>
        <DrawerHeader />

        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Main>
    </Box>
  )
})


const DrawerItem = ({ handleDrawerClose }: { handleDrawerClose: Function }) => {

  const navigate = useNavigate();

  const handleClickLink = useCallback((path: string) => {
    handleDrawerClose();
    navigate(path);
  }, [handleDrawerClose, navigate]);


  return (
    <>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { handleClickLink("/") }}>
            <ListItemIcon>
              <AppsIcon />
            </ListItemIcon>
            <ListItemText primary="App" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { handleClickLink("/settings") }}>
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
