// Material Dashboard 2 React layouts
// import Lights from './layouts/lights'
// import Misc from './layouts/misc'
// import WiFi from './layouts/wifi'

// Import Material-UI components and icons
import {
    Lightbulb as LightbulbIcon,
    AssessmentOutlined as AssesmentOutlinedIcon,
    SettingsOutlined as SettingsOutlinedIcon,
    SignalWifi0BarOutlined as SignalWifi0BarOutlinedIcon,
    StorageOutlined as StorageOutlinedIcon,
    SystemUpdateAlt as SystemUpdateAltIcon,
    VideoCameraBackOutlined as VideoCameraBackOutlinedIcon,
    VideoFileOutlined as VideoFileOutlinedIcon,
} from "@mui/icons-material";
import { Box } from "@mui/material";

import CamerasPage from "./layouts/cameras";
import Files from "./layouts/flies";
import TaskMonitor from "./layouts/task_monitor";
import Updater from "./layouts/updater";
import WifiPage from "./layouts/wifi";
import Settings from "./layouts/settings";
import { RouteItem, routeType } from "./types/types";

export const routes: RouteItem[] = [
    {
        route: "/devices/cameras",
        component: <CamerasPage />,
        exact: true,
        icon: <VideoCameraBackOutlinedIcon />,
        category: "Devices",
        type: routeType.COLLAPSE,
        name: "Cameras",
        key: "cameras",
        default: true,
    }, //list cameras
    {
        route: "/devices/lights",
        component: <Box />,
        // <Lights />,
        exact: true,
        icon: <LightbulbIcon />,
        category: "Devices",
        type: routeType.COLLAPSE,
        name: "Lights",
        key: "lights",
        default: false,
    }, //list light (Currently none)
    {
        route: "/devices/task_monitor",
        component: <TaskMonitor />,
        exact: true,
        icon: <AssesmentOutlinedIcon />,
        category: "Devices",
        type: routeType.COLLAPSE,
        name: "Task Monitor",
        key: "task_monitor",
        default: false,
    }, // monitor system processes (CPU, temp)
    {
        route: "/communications/wifi",
        component: <WifiPage />,
        //  <WiFi />,
        exact: true,
        icon: <SignalWifi0BarOutlinedIcon />,
        category: "Communications",
        type: routeType.COLLAPSE,
        name: "WiFi",
        key: "wifi",
        default: false,
    }, //monitor wireless processes and join other networks
    {
        route: "/communications/wired",
        component: <Box />,
        exact: true,
        icon: <StorageOutlinedIcon />,
        category: "Communications",
        type: routeType.COLLAPSE,
        name: "Wired",
        key: "wired",
        default: false,
    }, // view wired connections (Not implemented)
    {
        route: "/files/",
        component: <Files />,
        exact: true,
        icon: <VideoFileOutlinedIcon />,
        category: "Files",
        type: routeType.COLLAPSE,
        name: "Files",
        key: "Files",
        default: false,
    }, //list saved videos from cameras
    {
        route: "/options/updater",
        component: <Updater />,
        exact: true,
        icon: <SystemUpdateAltIcon />,
        category: "Options",
        type: routeType.COLLAPSE,
        name: "Updater",
        key: "updater",
        default: false,
    }, //allows user to update dweos
    {
        route: "/options/settings",
        component: <Settings />,
        exact: true,
        icon: <SettingsOutlinedIcon />,
        category: "Options",
        type: routeType.COLLAPSE,
        name: "Settings",
        key: "settings",
        default: false
    } //allows user to change global settings/defaults
];
