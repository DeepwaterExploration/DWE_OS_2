import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import FormGroup from "@mui/material/FormGroup";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import DialogContent from "@mui/material/DialogContent";

import React, { useContext, useState } from "react";
import { Control, controlType, Device } from "../../types";
import { LineBreak } from "../../../../components/LineBreak";
import DeviceContext from "../../../../contexts/DeviceContext";
import { setUVCControl } from "../../api";
import { subscribe } from "valtio";
import IntegerControl from "./IntegerControl";
import BooleanControl from "./BooleanControl";
import MenuControl from "./MenuControl";

export const CameraControls: React.FC = () => {
    const { device } = useContext(DeviceContext) as { device: Device };

    const [dialogOpen, setDialogOpen] = useState(false);

    const controls = device.controls;
    const bus_info = device.bus_info;

    const renderControl = (control: Control, index: number) => {
        // Convert auto exposure to a menu type
        if (
            control.name.includes("Auto Exposure") &&
            control.flags.control_type === controlType.MENU
        ) {
            control.flags.control_type = controlType.BOOLEAN;
        }

        subscribe(control, () => {
            setUVCControl(bus_info, control.value, control.control_id);
        });

        switch (control.flags.control_type) {
            case controlType.INTEGER:
                return (
                    <IntegerControl
                        key={index}
                        control={control}
                        index={index}
                    />
                );
            case controlType.BOOLEAN:
                return (
                    <BooleanControl
                        key={index}
                        control={control}
                        index={index}
                    />
                );
            case controlType.MENU:
                return (
                    <MenuControl key={index} control={control} index={index} />
                );
            default:
                return undefined;
        }
    };

    const resetControls = () => {
        for (let control of controls) {
            control.value = control.flags.default_value;
            setUVCControl(bus_info, control.value, control.control_id);
        }
    };

    return (
        <Box>
            <Button
                sx={{ width: "100%", marginTop: "10px" }}
                variant='outlined'
                onClick={() => setDialogOpen(true)}
            >
                Open Controls
            </Button>
            <Dialog
                fullWidth
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                sx={{
                    overflow: "hidden",
                }}
            >
                <DialogTitle>Camera Controls</DialogTitle>
                <Divider />
                <DialogContent
                    sx={{
                        overflowY: "auto",
                        maxHeight: "80%",
                    }}
                >
                    <FormGroup>{controls.map(renderControl)}</FormGroup>
                    <LineBreak />
                    <Button
                        variant='contained'
                        fullWidth
                        onClick={resetControls}
                    >
                        Reset Controls
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};
