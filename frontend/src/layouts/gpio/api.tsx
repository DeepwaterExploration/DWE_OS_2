import { getRequest, postRequest } from "../../utils/utils";
import { DeviceMapping, PWMPins } from "./types";

export async function getDeviceMapping(): Promise<DeviceMapping> {
    const response = await getRequest("/gpio/pwm_pin_mapping");
    return await response.json();
}

export async function getPins(): Promise<PWMPins> {
    const response = await getRequest("/gpio/pwm_pins");
    return await response.json();
}

export async function setPin(pin: string, frequency: number, duty_cycle: number) {
    const response = await postRequest("/gpio/set_pwm_pin", {
        pin, duty_cycle, frequency
    });
    return await response.json();
}
