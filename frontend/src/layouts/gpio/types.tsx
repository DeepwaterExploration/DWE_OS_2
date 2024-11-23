export interface PWMPin {
    chip_id: number;
    channel_id: number;
}

export interface PWMPinValue {
    frequency: number;
    duty_cycle: number;
    chip_id?: number;
    channel_id?: number;
}

export interface PWMPinCard {
    value: PWMPinValue;
    pin_name: string;
}

export type PWMPins = Record<string, PWMPinValue>;

export enum DeviceFamily {
    RASPBERRY_PI = "RASPBERRY_PI",
    JETSON = "JETSON",
    UNKNOWN = "UNKNOWN",
}

export interface DeviceMapping {
    device_family: DeviceFamily;
    model: string;
    pin_mappings: Record<string, PWMPin>;
}
