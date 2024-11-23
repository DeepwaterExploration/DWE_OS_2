import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React, { useContext, useEffect, useState } from "react";
import LightCard from "./components/PWMCard";
import { DeviceMapping, PWMPinCard, PWMPinValue } from "./types";
import LightContext from "../../contexts/LightContext";
import { proxy, subscribe } from "valtio";
import { useSnackbar } from "notistack";
import { getDeviceMapping, getPins, setPin } from "./api";
import { styles } from "../../style";
import WebsocketContext from "../../contexts/WebsocketContext";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import PWMCard from "./components/PWMCard";

const GPIOLayout = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [deviceMapping, setDeviceMapping] = useState(
        undefined as DeviceMapping | undefined
    );

    const [pins, setPins] = useState([] as PWMPinCard[]);

    const [hasRequestedPins, setHasRequestedPins] = useState(false);

    let { connected } = useContext(WebsocketContext) as { connected: boolean };

    useEffect(() => {
        if (connected) {
            getPins().then((pins) => {
                setHasRequestedPins(true);
                setPins(
                    Object.keys(pins).map(
                        (pin_info) =>
                            ({
                                value: pins[pin_info],
                                pin_name: pin_info,
                            }) as PWMPinCard
                    )
                );
            });
        } else {
            setPins([]);
        }
    }, [connected]);

    return (
        <>
            <Grid
                container
                spacing={4}
                alignItems='baseline'
                flexWrap='wrap'
                style={{
                    justifyContent: "space-evenly",
                }}
            >
                {pins.map((pin) => (
                    <PWMCard pwmCard={pin} />
                ))}
            </Grid>
        </>
    );
};

export default GPIOLayout;
