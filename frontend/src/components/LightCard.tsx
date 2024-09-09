import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    MenuItem,
    Slider,
    TextField,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

import { LineBreak } from "./LineBreak";
import DeviceContext from "../contexts/DeviceContext";
import { useTheme } from "@emotion/react";
import { styles } from "../style";
import { LightDevice } from "../types/types";
import LightContext from "../contexts/LightContext";
import CloseIcon from "@mui/icons-material/Close";

interface LightCardProps {
    onClose: () => void;
}

const LightCard: React.FC<LightCardProps> = (props) => {
    const { light } = useContext(LightContext) as { light: LightDevice };

    return (
        <Card sx={{ ...styles.card, maxWidth: 400, position: "relative" }}>
            <CardHeader
                title={"Light"}
                subheader={
                    <TextField
                        sx={{ width: "100%", top: 10 }}
                        select
                        label='Type'
                        variant='standard'
                        defaultValue={"PWM"}
                        onChange={(selected) => {}}
                        size='small'
                    >
                        <MenuItem value='PWM'>PWM</MenuItem>
                    </TextField>
                }
            />
            <CardContent>
                <div style={{ paddingBottom: 20, width: "100%" }}>
                    <LineBreak />
                    <Grid container spacing={1} width={"100%"}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                sx={{}}
                                onChange={(e) => {
                                    light.nickname = e.target.value;
                                }}
                                helperText='Device Nickname'
                                placeholder='Device Nickname'
                                variant='standard'
                                defaultValue={light.nickname || ""}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                sx={{}}
                                label='GPIOPin'
                                variant='outlined'
                                size='small'
                                defaultValue={light.pin}
                                onChange={(e) => {
                                    light.pin = parseInt(e.target.value);
                                }}
                                type='number'
                                inputProps={{ min: 1, max: 65535 }} // Specify minimum and maximum values
                            />
                        </Grid>
                    </Grid>
                    <div style={{ marginTop: 10 }}>
                        <span
                            style={{
                                marginRight: "8px",
                            }}
                        >
                            Intensity:
                        </span>
                        <Slider
                            onChangeCommitted={(_, value) =>
                                (light.intensity = value as number)
                            }
                            style={{
                                marginLeft: "20px",
                                width: "calc(100% - 25px)",
                            }}
                            defaultValue={light.intensity}
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </div>
                </div>
                <IconButton
                    sx={{
                        position: "absolute",
                        top: 5,
                        right: 15,
                        color: "white",
                    }}
                    edge='end'
                    aria-label='icon'
                    onClick={() => {
                        props.onClose();
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </CardContent>
        </Card>
    );
};

export default LightCard;
