import TableRowsIcon from "@mui/icons-material/TableRows";
import {
    Avatar,
    Card,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import React from "react";

import { fNumber } from "../../utils/formatNumber";
import { processInfo } from "./types";

interface CPUCardProps {
    processes: processInfo[];
    rowLimit: number;
}

const DWE_RELATED_PROCESSES = [
    "gst-launch-1.0", //video streaming
    "system_api", //The name of the go backend

];

const ProcessesCard: React.FC<CPUCardProps> = (props) => {
    return (
        <Card
            sx={{
                width: "30%",
                boxShadow: 3,
                textAlign: "left",
                margin: "20px",
                padding: "15px",
            }}
        >
            <List dense={true}>
                <ListItem
                    secondaryAction={
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => console.log("delete", `sasa`)}
                        ></IconButton>
                    }
                >
                    <ListItemAvatar>
                        <Avatar>
                            <TableRowsIcon sx={{ fontSize: 30, mx: 0.5 }} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Processes" secondary={""} />
                </ListItem>
                <ListItem>
                    <Table
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "auto auto auto auto auto  ",
                            width: "100%",
                        }}
                    >
                        <TableHead
                            sx={{
                                display: "contents", // ensures the header cells use the grid layout
                            }}
                        >
                            <TableRow sx={{ display: "contents" }}>
                                <TableCell sx={{ padding: "4px" }}>
                                    PID
                                </TableCell>
                                <TableCell sx={{ padding: "4px" }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ padding: "4px" }}>
                                    Name
                                </TableCell>
                                <TableCell sx={{ padding: "4px" }}>
                                    CPU
                                </TableCell>
                                <TableCell sx={{ padding: "4px" }}>
                                    Memory
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody
                            sx={{
                                display: "contents", // ensures the body cells use the grid layout
                            }}
                        >
                            {props.processes &&
                                props.processes
                                    .sort(
                                        (a, b) =>
                                            (b.cpu + + b.memory) -
                                            (a.cpu + b.memory)
                                    )
                                    .filter((a) => a.cpu > 0)
                                    .slice(0, props.rowLimit)
                                    .map((stat, rowIndex) => (
                                        <TableRow key={rowIndex} sx={{ display: "contents" }}>
                                            <TableCell sx={{ padding: "4px" }}>
                                                {stat.pid}
                                            </TableCell>
                                            <TableCell sx={{ padding: "4px" }}>
                                                {stat.status}
                                            </TableCell>
                                            <TableCell sx={{ padding: "4px" }}>
                                                <Typography
                                                    variant="body1"
                                                    color={
                                                        DWE_RELATED_PROCESSES.includes(stat.name)
                                                            ? "rgb(70, 186, 231)"
                                                            : "text.primary"
                                                    }
                                                >
                                                    {stat.name} {stat.cmd !== "" && stat.cmd !== stat.name
                                                        ? `(${stat.cmd})`
                                                        : ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ padding: "4px" }}>
                                                {fNumber(stat.cpu)}%
                                            </TableCell>
                                            <TableCell sx={{ padding: "4px" }}>
                                                {fNumber(stat.memory)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                        </TableBody>
                    </Table>

                </ListItem>
            </List>

        </Card>
    );
};

export default ProcessesCard;
