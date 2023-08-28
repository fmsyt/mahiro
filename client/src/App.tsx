import { memo, useCallback, useContext, useState } from "react"
import Board from "./Board"

import { Route, Routes, useNavigate, MemoryRouter } from "react-router-dom";
import { Box, Button, ButtonGroup, CssBaseline, Drawer, Divider, List, ListItem, Toolbar, Typography, styled, ListItemButton, ListItemIcon, ListItemText, ListSubheader, useTheme, Container, Stack } from "@mui/material";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import AppsIcon from '@mui/icons-material/Apps';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import { AppContext, AppContextProvider } from "./AppContext";

import Connection from "./Connection";
import "./App.css";


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



const App = ({ enableDrawer = true }: { enableDrawer: boolean }) => {
  return (
    <MemoryRouter>
      <AppContextProvider>
        <CssBaseline />
        <Container>
          { enableDrawer ? (
            <AppDrawer>
              <Box height="calc(100vh - 64px - 48px)">
                <AppContent />
              </Box>
            </AppDrawer>
          ) : (
            <Stack padding={2} height="100vh">
              <AppContent />
            </Stack>
          )}
        </Container>
      </AppContextProvider>
    </MemoryRouter>
  )
}

const AppContent = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<Board />} />
      <Route path="/connection" element={<Connection />} />
    </Routes>
  )
})


const AppDrawer = memo(({ children } : { children: React.ReactNode }) => {

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
        { children }
      </Main>
    </Box>
  )
})


const DrawerItem = ({ handleDrawerClose = () => {} }) => {

  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useContext(AppContext);

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
          <ListItemButton onClick={() => { handleClickLink("/connection") }}>
            <ListItemIcon>
              <CastConnectedIcon />
            </ListItemIcon>
            <ListItemText primary="Connection" />
          </ListItemButton>
        </ListItem>
      </List>
      <List subheader={<ListSubheader component="div">Mode</ListSubheader>}>
        <ListItem disablePadding>
          <ButtonGroup fullWidth sx={{ paddingInline: 1 }}>
            <Button variant={themeMode === "system" ? "contained" : "outlined"} onClick={() => { setThemeMode("system") }}>
              <SettingsBrightnessIcon />
            </Button>
            <Button variant={themeMode === "light" ? "contained" : "outlined"} onClick={() => { setThemeMode("light") }}>
              <LightModeIcon />
            </Button>
            <Button variant={themeMode === "dark" ? "contained" : "outlined"} onClick={() => { setThemeMode("dark") }}>
              <DarkModeIcon />
            </Button>
          </ButtonGroup>
        </ListItem>
      </List>
    </>
  )
}

export default App;
