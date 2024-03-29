import MemoryIcon from "@mui/icons-material/Memory";
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

import { fPercent } from "../../utils/formatNumber";

interface DiskCardProps {
    currentDiskUsagePercent: number;
    deviceName: string;
    deviceStats: number[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chunkArray<T extends any[]>(arr: T, size: number): T[] {
    return arr.reduce(
        (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
        []
    );
}

const DiskCard: React.FC<DiskCardProps> = (props) => {
    const rowLimit = 4;
    return (
        <Card
            sx={{
                width: "512px",
                boxShadow: 3,
                textAlign: "left",
                margin: "20px",
                padding: "15px",
            }}
        >
            <List dense={true}>
                <ListItem
                    key={`sasa`}
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
                            <MemoryIcon sx={{ fontSize: 30, mx: 0.5 }} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary='Current Disk Usage'
                        secondary={fPercent(props.currentDiskUsagePercent)}
                    />
                </ListItem>
                <ListItem>
                    <Typography variant='h5' color='text.primary'>
                        {props.deviceName}
                    </Typography>
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
                        {props.deviceStats &&
                            chunkArray(props.deviceStats, rowLimit).map(
                                (row, rowIndex) => (
                                    <Grid
                                        key={rowIndex}
                                        container
                                        item
                                        xs={12}
                                        spacing={3}
                                        justifyContent='space-evenly'
                                        alignItems='center'
                                    >
                                        {row.map((stat, index) => (
                                            <Grid
                                                key={`${rowIndex}:${index}`}
                                                item
                                                xs={12}
                                                sm={6}
                                                md={3}
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
                                                        {`Core ${
                                                            rowLimit *
                                                                rowIndex +
                                                            index
                                                        }`}
                                                    </Typography>
                                                    <Typography
                                                        variant='body1'
                                                        color='text.primary'
                                                    >
                                                        {fPercent(stat)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        ))}
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

export default DiskCard;
