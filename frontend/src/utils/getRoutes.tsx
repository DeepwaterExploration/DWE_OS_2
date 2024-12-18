import Box from "@mui/material/Box";

import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

// routes to different pages
import { RouteItem } from "../types/types";
import React from "react";

interface GetRoutesProps {
    routes: RouteItem[];
}

const GetRoutes: React.FC<GetRoutesProps> = (props): ReactNode => {
    return (
        <Routes>
            <Route
                path='/'
                element={props.routes.find((route) => route.default)?.component}
            />
            {props.routes.map((route) => {
                if (route.route && route.component) {
                    return (
                        <Route
                            path={route.route}
                            element={route.component}
                            key={route.key}
                        />
                    );
                }
                return null; // Add a default return value if the if condition is not met
            })}
        </Routes>
    );
};

interface NavigationRoutesProps {
    theme: string;
    routes: RouteItem[];
}

const NavigationRoutes: React.FC<NavigationRoutesProps> = ({ routes }) => {
    return (
        <Box
            component='main'
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                flexGrow: 1,
                height: "100vh",
                overflow: "auto",
                paddingTop: "7em",
            }}
        >
            {/* <Toolbar /> */}
            {/* DeviceCards */}
            <div style={{ height: "calc(100vh - 7.5em)" }}>
                <GetRoutes routes={routes} />
            </div>
        </Box>
    );
};

export default NavigationRoutes;
