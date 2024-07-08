import { Button, Card, CardContent, Grid, MenuItem, Select, TextField, Typography } from "@mui/material"
import TextFieldButton from "./textFieldButton";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { getSettings, setPrefrence } from "../../utils/api";
import SettingsCard from "./SettingsCard";
import { encodeType, SavedPrefrences } from "../../types/types";



const Settings: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [defaultName, setDefaultName] = useState("");
    const [defaultHost, setDefaultHost] = useState("");
    const [defaultPort, setDefaultPort] = useState(0);
    const [defaultFormat, setDefaultFormat] = useState<encodeType>(encodeType.MJPEG);
    const ENCODERS = ["MJPEG", "H264"]
    const [defaultResolution, setDefaultResolution] = useState("");
    const RESOLUTIONS = [
        "1920x1080",
        "1280x720",
        "800x600",
        "640x480",
        "640x360",
        "352x288",
        "320x420",
    ];
    const [defaultFPS, setDefaultFPS] = useState(30);
    const INTERVALS = ["30", "25", "20", "15", "10"];
    const [defaultProcessesNumber, setDefaultProcessesNumber] = useState(10);
    const fetchSettings = async () => {
        try {
            const settings: SavedPrefrences = await getSettings();
            setDefaultName(settings.defaultRecording.defaultName);
            setDefaultHost(settings.defaultStream.defaultHost);
            setDefaultPort(settings.defaultStream.defaultPort);
            setDefaultFormat(settings.defaultRecording.defaultFormat);
            setDefaultResolution(settings.defaultRecording.defaultResolution);
            setDefaultFPS(settings.defaultRecording.defaultFPS);
            setDefaultProcessesNumber(settings.defaultProcesses.defaultNumber);
        } catch (error) {
            console.log(error)
            enqueueSnackbar(`Failed to load settings`, { variant: "error" });
        }
    };

    useEffect(() => {

        fetchSettings();
    }, [enqueueSnackbar]);

    const save = async (type: "defaultRecording" | "defaultStream" | "defaultProcesses", key: string, value: string | number) => {
        await setPrefrence(type, key, value);
        console.log(`setting ${type} ${key} to ${value}`)
        enqueueSnackbar(`Set ${key} to ${value}`, { variant: "info" })
        await fetchSettings();

    }

    return (
        <Grid
            container
            spacing={4}
            alignItems='baseline'
            flexWrap='wrap'
            style={{
                justifyContent: "left",
                padding: "0 3em",
            }}
        >
            <SettingsCard cardTitle="Stream">
                <TextFieldButton
                    textInputLabel={"Default Stream Host"}
                    textInputValue={defaultHost}
                    buttonLabel={"Save"}
                    buttonOnClick={() => { save("defaultStream", "defaultHost", defaultHost); }}
                    textFieldOnChange={(e) => { setDefaultHost(e) }}
                />
                <TextFieldButton
                    textInputLabel={"Default Stream Port"}
                    textInputValue={defaultPort.toString()}
                    buttonLabel={"Save"}
                    buttonOnClick={() => { save("defaultStream", "defaultPort", defaultPort); }}
                    textFieldOnChange={(e) => {
                        if (Number.isNaN(parseInt(e.replace(/[^\d]/, "")))) {
                            setDefaultPort(0);
                            return;
                        }
                        setDefaultPort(
                            parseInt(e.replace(/[^\d]/, ""))
                        )
                    }}
                />
            </SettingsCard>

            <SettingsCard cardTitle="Recording">
                <TextFieldButton
                    textInputLabel={"Default Video Filename"}
                    textInputValue={defaultName}
                    buttonLabel={"Save"}
                    buttonOnClick={() => { save("defaultRecording", "defaultName", defaultName); }}
                    textFieldOnChange={(e) => { setDefaultName(e) }}
                    tooltip="Available keys: $NICKNAME, $CAMERA, $DATE, $TIME, $EPOCH"
                />
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    <TextField
                        sx={{ width: "100%" }}
                        select
                        label='Default Format'
                        variant='outlined'
                        value={
                            (defaultFormat === encodeType.MJPEG) ? "MJPEG" : "H264"
                        }
                        onChange={(selected) =>
                            setDefaultFormat(
                                () => selected.target.value as encodeType
                            )
                        }
                        size='small'
                    >
                        <br />
                        {ENCODERS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button sx={{
                        width: "90px",
                        height: "40px",
                        color: "white",
                        fontWeight: "bold",
                    }} variant='contained' onClick={() => { save("defaultRecording", "defaultFormat", defaultFormat); }}>
                        Save
                    </Button>
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    <TextField
                        sx={{ width: "100%" }}
                        select
                        label='Default Resolution'
                        variant='outlined'
                        value={defaultResolution}
                        onChange={(selected) =>
                            setDefaultResolution(
                                () => selected.target.value
                            )
                        }
                        size='small'
                    >
                        <br />
                        {RESOLUTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button sx={{
                        width: "90px",
                        height: "40px",
                        color: "white",
                        fontWeight: "bold",
                    }} variant='contained' onClick={() => { save("defaultRecording", "defaultResolution", defaultResolution); }}>
                        Save
                    </Button>
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    <TextField
                        sx={{ width: "100%" }}
                        select
                        label='Default FPS'
                        variant='outlined'
                        value={defaultFPS}
                        onChange={(selected) =>
                            setDefaultFPS(
                                () => parseInt(selected.target.value)
                            )
                        }
                        size='small'
                    >
                        <br />
                        {INTERVALS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button sx={{
                        width: "90px",
                        height: "40px",
                        color: "white",
                        fontWeight: "bold",
                    }} variant='contained' onClick={() => { save("defaultRecording", "defaultFPS", defaultFPS); }}>
                        Save
                    </Button>
                </div>
            </SettingsCard>
            <SettingsCard cardTitle="Task Manager">
                <TextFieldButton
                    textInputLabel={"Default Number of Processes to Show"}
                    textInputValue={defaultProcessesNumber.toString()}
                    buttonLabel={"Save"}
                    buttonOnClick={() => { save("defaultProcesses", "defaultNumber", defaultProcessesNumber); }}
                    textFieldOnChange={(e) => {
                        if (Number.isNaN(parseInt(e.replace(/[^\d]/, "")))) {
                            setDefaultProcessesNumber(0);
                            return;
                        }
                        setDefaultProcessesNumber(
                            parseInt(e.replace(/[^\d]/, ""))
                        )
                    }}
                />
            </SettingsCard>
        </Grid>
    );
}

export default Settings;