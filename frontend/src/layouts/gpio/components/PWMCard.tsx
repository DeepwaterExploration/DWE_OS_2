import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";

import React, { useContext, useEffect, useState } from "react";

import { LineBreak } from "../../../components/LineBreak";
import { styles } from "../../../style";
import { PWMPinCard } from "../types";
import LightContext from "../../../contexts/LightContext";
import CloseIcon from "@mui/icons-material/Close";
import { setPin } from "../api";

interface PWMCardProps {
    pwmCard: PWMPinCard;
}

const PWMCard: React.FC<PWMCardProps> = ({ pwmCard }) => {
    const [pwmValue, setPWMValue] = useState(pwmCard.value);

    useEffect(() => {
        setPin(pwmCard.pin_name, pwmValue.frequency, pwmValue.duty_cycle);
    }, [pwmValue]);

    return (
        <Card
            sx={{
                ...styles.card,
                maxWidth: 360,
                position: "relative",
            }}
        >
            <CardHeader
                title={"PWM"}
                subheader={
                    <>
                        <span>Pin: {pwmCard.pin_name}</span>
                        <LineBreak />
                        <span>Chip: {pwmCard.value.chip_id}, </span>
                        <span>Channel: {pwmCard.value.channel_id}</span>
                    </>
                }
            />
            <CardContent>
                <TextField
                    sx={{ marginTop: -2 }}
                    label='Frequency (Hz)'
                    type='number'
                    variant='standard'
                    fullWidth
                    value={pwmValue.frequency}
                    onChange={(e) => {
                        const newValue = parseFloat(e.target.value); // Parse as float instead of integer
                        if (!isNaN(newValue) && newValue >= 0.1) {
                            // Ensure it is a valid number and >= 0.1
                            setPWMValue({
                                ...pwmValue,
                                frequency: newValue,
                            });
                        }
                    }}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    margin='normal'
                />
                <Paper
                    elevation={1}
                    sx={{
                        marginTop: 2,
                        padding: 3,
                    }}
                >
                    <Typography
                        variant='body2'
                        sx={{
                            fontWeight: "bold",
                            marginBottom: 0.5,
                        }}
                    >
                        Duty Cycle: {pwmValue.duty_cycle}%
                    </Typography>
                    <Slider
                        value={pwmValue.duty_cycle}
                        onChange={(e, value) =>
                            setPWMValue({
                                ...pwmValue,
                                duty_cycle: value as number,
                            })
                        }
                        aria-labelledby='duty-cycle-slider'
                        min={0}
                        max={100}
                        step={0.1}
                        valueLabelDisplay='auto'
                    />
                </Paper>
            </CardContent>
        </Card>
    );
};

export default PWMCard;
