import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/system/Box";
import NavigationItems from "./getNavigationItems";
import NavigationRoutes from "./getRoutes";
import DWELogo_white from "../svg/DWELogo_white.svg";
import { Grid, Typography, Divider } from "@mui/material";
// import WifiMenu from './WifiMenu'
import ListSubheader from "@mui/material/ListSubheader";
import { darkTheme, lightTheme } from "../utils/Themes";
// import { lightTheme, darkTheme } from '../utils/themes'
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

export default function NavigationBar() {
  const [open, setOpen] = useState(true);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") == "dark" ? darkTheme : lightTheme
  );
  const toggleTheme = () => {
    const newTheme = theme.palette.mode === "dark" ? lightTheme : darkTheme;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme.palette.mode);
  };
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const resetSettings = () => {
    // makePostRequest('/resetSettings', {}, () => window.location.reload())
  };
  return (
    <Router>
      <React.Fragment>
        <AppBar position='absolute' open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge='start'
              color='inherit'
              aria-label='open drawer'
              onClick={toggleDrawer}
              sx={{
                marginRight: "20px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component='div'
              display='flex'
              flexDirection='row'
              alignItems='center'
              sx={{ width: "100%", gap: 2 }}
            >
              <Box style={{ marginTop: "5px" }} sx={{ pr: 3 }}>
                <img
                  src={DWELogo_white}
                  style={{ height: 30 }}
                  alt='DWE Logo'
                />
              </Box>
              <Typography component='h1' variant='h6' color='inherit' noWrap>
                Home
              </Typography>
              <Divider
                orientation='vertical'
                sx={{ mx: 3 }}
                style={{ backgroundColor: "white", height: 40, width: 3 }}
              />
              <Typography
                component='h1'
                variant='h6'
                color='inherit'
                noWrap
              ></Typography>
              <Typography
                component='h1'
                variant='h6'
                color='inherit'
                noWrap
              ></Typography>
              <Typography component='h1' variant='h6' color='inherit' noWrap>
                Stereo
              </Typography>
              <Divider
                orientation='vertical'
                sx={{ mx: 3 }}
                style={{ backgroundColor: "white", height: 40, width: 3 }}
              />
              <Typography component='h1' variant='h6' color='inherit' noWrap>
                ML/AI
              </Typography>
              <Divider
                orientation='vertical'
                sx={{ mx: 3 }}
                style={{ backgroundColor: "white", height: 40, width: 3 }}
              />
              <Typography component='h1' variant='h6' color='inherit' noWrap>
                Simulation
              </Typography>
            </Box>
            <Grid justifyContent='flex-end'>{/* <WifiMenu /> */}</Grid>
            <PowerSettingsNewIcon />
            {/* {props.children} */}
          </Toolbar>
        </AppBar>
        <Drawer variant='permanent' open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <ListItemText
              style={{
                textAlign: "center",
                padding: "auto",
              }}
              primary={"DWE OS Pre-Alpha"}
              // secondary={'Version: ' + packageBackend.version}
            />
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component='nav'>
            <NavigationItems />
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
              <ListSubheader component='div' inset>
                <Typography variant='inherit' fontWeight='bold'>
                  Options
                </Typography>
              </ListSubheader>
              <ListItemButton onClick={toggleTheme}>
                <ListItemIcon>
                  {theme.palette.mode === "dark" ? (
                    <Brightness7Icon />
                  ) : (
                    <Brightness4Icon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    theme.palette.mode === "dark" ? "Light Theme" : "Dark Theme"
                  }
                />
              </ListItemButton>
              <ListItemButton onClick={resetSettings}>
                <ListItemIcon>
                  <RestartAltIcon />
                </ListItemIcon>
                <ListItemText primary='Reset Settings' />
              </ListItemButton>
            </React.Fragment>
          </List>
        </Drawer>
        <NavigationRoutes />
      </React.Fragment>
    </Router>
  );
}
