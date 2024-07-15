import { Avatar, Card, IconButton, List, ListItem, ListItemAvatar, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { recordingPing } from "../../types/types";
import { get_all_active_recording_states } from "../../utils/api";
import { calculateAllRecordingSizes } from "../../utils/storage";
import { VideoFile } from "@mui/icons-material";
import { fBytes } from "../../utils/formatNumber";
import { useEffect, useState } from "react";


function getSizes(states: Array<recordingPing>) {
    return calculateAllRecordingSizes(states)

}

const RecordingUsageCard: React.FC = (props) => {
    const [recordingStates, setRecordingStates] = useState<Array<recordingPing>>([]);
    const [sizes, setSizes] = useState<{ id: string, size: number }[]>([]);
    useEffect(() => {
        const setRecordings = async () => {
            const states = await get_all_active_recording_states();
            setRecordingStates(() => states);
            setSizes(() => calculateAllRecordingSizes(states))
        }
        setInterval(
            () => setRecordings(), 1000
        )
        setRecordings();

    }, [])
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
                            <VideoFile sx={{ fontSize: 30, mx: 0.5 }} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Current Recording Usage" secondary={`Total ${fBytes(
                        sizes.map((e) => e.size).reduce((x, y) => x + y, 0)
                    )}`} />
                </ListItem>
                <ListItem>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Device
                                </TableCell>
                                <TableCell>
                                    Size
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                sizes.map((recording) => {
                                    return <TableRow key={recording.id}>
                                        <TableCell>
                                            {recording.id}
                                        </TableCell>
                                        <TableCell>
                                            {fBytes(recording.size)}
                                        </TableCell>
                                    </TableRow>
                                })
                            }
                        </TableBody>
                    </Table>

                </ListItem>
            </List>
        </Card>
    )
}

export default RecordingUsageCard
