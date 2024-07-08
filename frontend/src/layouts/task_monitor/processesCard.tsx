import TableRowsIcon from '@mui/icons-material/TableRows';
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
    Typography,
} from "@mui/material";
import React from "react";

import { fNumber } from "../../utils/formatNumber";
import { processInfo } from "./types";

interface CPUCardProps {
    processes: processInfo[]
    rowLimit: number
}


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
                            edge='end'
                            aria-label='delete'
                            onClick={() => console.log("delete", `sasa`)}
                        ></IconButton>
                    }
                >
                    <ListItemAvatar>
                        <Avatar>
                            <TableRowsIcon
                                sx={{ fontSize: 30, mx: 0.5 }}
                            />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary='Processes'
                        secondary={''}
                    />
                </ListItem>
                <ListItem>
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            flexWrap: "wrap",
                            flexDirection: "row",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: 3,
                        }}
                    >
                        {props.processes &&
                            props.processes.filter((a) => a.cpu > 0).sort((a, b) => b.cpu - a.cpu).slice(0, props.rowLimit).map(
                                (stat, rowIndex) => (
                                    <Grid
                                        key={rowIndex}
                                        container
                                        item
                                        xs={12}
                                        spacing={3}
                                        justifyContent='space-evenly'
                                        alignItems='center'
                                    >
                                        {
                                            <Grid
                                                key={`${stat.cmd}${stat.name}${stat.pid}`}
                                                item
                                                xs={12}
                                                sm={12}
                                                md={12}
                                                justifyContent='space-evenly'
                                            >
                                                {/* Render your item component here */}
                                                <Grid
                                                    flexDirection={"column"}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                >
                                                    <Typography
                                                        variant='body1'
                                                        color='text.primary'
                                                    >
                                                        {stat.name} {(stat.cmd !== "" && stat.cmd !== stat.name) ? `(${stat.cmd})` : ""}
                                                    </Typography>
                                                    <Typography
                                                        variant='body1'
                                                        color='text.primary'
                                                    >
                                                        {fNumber(stat.cpu)}% cpu {fNumber(stat.memory)}% memory
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        }
                                    </Grid>
                                )
                            )}
                    </Grid>
                </ListItem>
            </List>
            <Divider
                variant='middle'
                sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    borderBottomWidth: 3,
                }}
            />
        </Card>
    );
};

export default ProcessesCard;
