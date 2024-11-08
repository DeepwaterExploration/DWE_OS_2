import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { Control } from "../../types";
import { subscribe } from "valtio";

interface ControlProps {
    control: Control;
    index: number;
}

const IntegerControl: React.FC<ControlProps> = ({ control, index }) => {
    const { name, control_id, value } = control;
    const { min_value, max_value, step } = control.flags;
    const [controlValueSlider, setControlValueSlider] = useState<number>(
        value as number
    );

    subscribe(control, () => {
        setControlValueSlider(control.value);
    });

    return (
        <React.Fragment key={index}>
            <Box
                key={index}
                display='flex'
                flexDirection='column'
                alignItems='center'
                width='100%'
            >
                <TextField
                    label={name}
                    value={controlValueSlider}
                    type='number'
                    inputProps={{
                        min: min_value,
                        max: max_value,
                        step: step,
                    }}
                    onChange={(e) => {
                        const newValue = Number(e.target.value);
                        if (newValue >= min_value && newValue <= max_value) {
                            setControlValueSlider(newValue);
                            control.value = newValue;
                        }
                    }}
                    variant='standard'
                    size='small'
                    style={{
                        marginBottom: "10px",
                        width: "100%",
                    }}
                />
                <Slider
                    onChangeCommitted={(_, newValue) =>
                        (control.value = newValue as number)
                    }
                    onChange={(_, newValue) =>
                        setControlValueSlider(newValue as number)
                    }
                    name={`control-${control_id}`}
                    min={min_value}
                    max={max_value}
                    step={step}
                    value={controlValueSlider}
                    size='medium'
                    defaultValue={value as number}
                    style={{
                        marginBottom: "10px",
                        width: "90%",
                    }}
                    key={"slider" + index}
                />
            </Box>
        </React.Fragment>
    );
};

export default IntegerControl;
