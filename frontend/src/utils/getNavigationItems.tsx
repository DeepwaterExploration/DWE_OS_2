import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

// routes to different pages
import { RouteType, routes } from "../routes";

interface GetRoutesProps {
  routes: RouteType[];
  open: boolean;
}

// NavigationItems

const GetRoutes: React.FC<GetRoutesProps> = ({ routes, open }) => {
  console.log("Is it open? ", open);
  const devicesRoutes = routes.filter((route) => route.category === "Devices");
  const communicationsRoutes = routes.filter(
    (route) => route.category === "Communications"
  );
  return (
    <React.Fragment>
      <ListSubheader component='div' inset>
        <Typography
          variant='inherit'
          fontWeight='bold'
          sx={{ opacity: open ? 1 : 0 }}
        >
          Devices
        </Typography>
      </ListSubheader>
      {devicesRoutes.map((route) => {
        if (route.route && route.component) {
          return (
            <ListItem
              disablePadding
              key={route.key}
              component={Link}
              to={route.route}
              sx={{ display: "block" }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {route.icon}
                </ListItemIcon>
                <ListItemText
                  primary={route.name}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        }
      })}
      <Divider sx={{ my: 1 }} />
      <ListSubheader component='div' inset>
        <Typography
          variant='inherit'
          fontWeight='bold'
          sx={{ opacity: open ? 1 : 0 }}
        >
          Communications
        </Typography>
      </ListSubheader>
      {communicationsRoutes.map((route) => {
        if (route.route && route.component) {
          return (
            <ListItem
              disablePadding
              key={route.key}
              component={Link}
              to={route.route}
              sx={{ display: "block" }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {route.icon}
                </ListItemIcon>
                <ListItemText
                  primary={route.name}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        }
      })}
    </React.Fragment>
  );
};

interface NavigationItemsProps {
  open: boolean;
}

const NavigationItems: React.FC<NavigationItemsProps> = (): JSX.Element => {
  return <GetRoutes routes={routes} open={open} />;
};

export default NavigationItems;
