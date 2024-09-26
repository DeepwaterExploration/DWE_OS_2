import React, { useEffect, useState } from "react";
import { Grid, Typography, TextField, Box, Button } from "@mui/material";
import { getSettings, savePreferences } from "../../utils/api";
import { styles } from "../../style";
import { IP_REGEX } from "../../utils/utils";
import SettingsCard from "../../components/SettingsCard";
import TextFieldButton from "../../components/TextFieldButton";
import { useSnackbar } from "notistack";

const PreferencesLayout = () => {
    const [host, setHost] = useState("192.168.2.1");
    const [port, setPort] = useState(5600);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        getSettings().then((settings) => {
            if (settings) {
                setHost(settings.default_stream.host);
                setPort(settings.default_stream.port);
            }
        });
    }, []);

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
            <SettingsCard cardTitle='Stream'>
                <TextField
                    sx={styles.settingsButton.textInput}
                    label='Default Stream Host'
                    onChange={(e) => {
                        setHost(e.target.value);
                    }}
                    value={host}
                    variant='outlined'
                    size='small'
                />
                <TextField
                    sx={styles.settingsButton.textInput}
                    label='Default Stream Port'
                    onChange={(e) => setPort(parseInt(e.target.value))}
                    value={port}
                    variant='outlined'
                    size='small'
                    type='number'
                    inputProps={{ min: 1024, max: 65535 }}
                />
                <Button
                    sx={styles.settingsButton.button}
                    variant='contained'
                    onClick={() => {
                        if (IP_REGEX.test(host))
                            savePreferences({ default_stream: { host, port } });
                        else
                            enqueueSnackbar("Invalid IP Address", {
                                variant: "error",
                            });
                    }}
                >
                    Save
                </Button>
            </SettingsCard>
        </Grid>
    );
};

export default PreferencesLayout;