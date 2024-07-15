import {
    Device,
    PortInfo,
    Recording,
    ReleaseList,
    SavedPrefrences,
    Stream,
    StreamEndpoint,
    StreamFormat,
    encodeType,
    optionType,
    recordingPing,
    videoData,
} from "../types/types";

const hostAddress: string = window.location.hostname;
export const DEVICE_API_URL = `http://${hostAddress}:8080`;
export const DEVICE_API_WS = `ws://${hostAddress}:9002`;
export const SYSTEM_API_URL = `http://${hostAddress}:5050`;
export const UPDATER_API_URL = `http://${hostAddress}:5000`;

/**
 * Retrieves a list of devices connected to the system
 * @returns {Promise<Device[]>} - A promise that resolves to an array of Device objects.
 * @throws {Error} - If the request to retrieve the device list fails.
 */
export async function getDevices(): Promise<Device[]> {
    const url = `${DEVICE_API_URL}/devices`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: Device[]) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to retrieve device list");
            console.error(error);
            return [];
        });
}

/**
 * Configures a device stream with the provided settings.
 * @param {number} usbInfo - The usb info of the connected camera.
 * @throws {Error} - If the request to configure the device fails.
 */
export async function unconfigureStream(bus_info: string) {
    const url = `${DEVICE_API_URL}/devices/unconfigure_stream`;
    const body = {
        bus_info,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(body),
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then(() => {
            return;
        })
        .catch((error: Error) => {
            console.log(`Failed to configure device ${bus_info}`);
            console.error(error);
            return;
        });
}

/**
 * Configures a device stream with the provided settings.
 * @param {number} usbInfo - The usb info of the connected camera.
 * @param {StreamFormat} format - The format of the stream.
 * @param {encodeType} encode_type - The encode type of the stream.
 * @throws {Error} - If the request to configure the device fails.
 */
export async function configureStream(
    bus_info: string,
    stream_format: StreamFormat,
    encode_type: encodeType,
    endpoints: StreamEndpoint[]
) {
    const url = `${DEVICE_API_URL}/devices/configure_stream`;
    const body = {
        bus_info,
        stream_format,
        encode_type,
        endpoints,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(body),
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: Stream) => {
            return data;
        })
        .catch((error: Error) => {
            console.log(`Failed to configure device ${bus_info}`);
            console.error(error);
            return undefined;
        });
}

/**
 * Set a device nickname
 * @param {string} usbInfo - The usb info of the connected camera.
 * @param {string} nickname
 * @throws {Error} - If the request to configure the device fails.
 */
export async function setDeviceNickname(bus_info: string, nickname: string) {
    const url = `${DEVICE_API_URL}/devices/set_nickname`;
    const body = {
        bus_info,
        nickname,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(body),
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: Stream) => {
            return data;
        })
        .catch((error: Error) => {
            console.log(`Failed to configure device ${bus_info}`);
            console.error(error);
            return undefined;
        });
}

/**
 * Add a stream endpoint to a device.
 * @param {number} index - The index of the connected camera.
 * @param {Endpoint} endpoint - The stream endpoint object.
 * @returns {Promise<void>} - A promise that resolves when the stream endpoint is successfully added.
 * @throws {Error} - If the index is invalid or the request fails.
 */
export async function addStreamEndpoint(
    index: number,
    endpoint: StreamEndpoint
): Promise<void> {
    const url = `${DEVICE_API_URL}/add_stream_endpoint`;
    const data = {
        index,
        endpoint,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(data),
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Error: Invalid index");
                }
                throw new Error("Failed to add stream endpoint");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to add stream endpoint");
            console.error(error);
        });
}

/**
 * Set a UVC control on a device.
 * @param {number} index - The index of the connected camera.
 * @param {Control} control - The control to set.
 * @param {number} value - The value to set the control to.
 * @returns {Promise<void>} - A promise that resolves when the control is successfully set.
 * @throws {Error} - If the index is invalid or the request fails.
 */
export async function setUVCControl(
    bus_info: string,
    value: number,
    control_id: number
): Promise<void> {
    const url = `${DEVICE_API_URL}/devices/set_uvc_control`;
    const data = {
        bus_info,
        value,
        control_id,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(data),
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Error: Invalid index");
                }
                throw new Error("Failed to set UVC control");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to set UVC control");
            console.error(error);
        });
}

/**
 * Configure exploreHD option on a device.
 * @param {number} usbInfo - The usb info of the connected camera.
 * @param {number} option - The option to set.
 * @param {number} value - The value to set the option to.
 * @returns {Promise<void>} - A promise that resolves when the option is successfully set.
 * @throws {Error} - If the index is invalid or the request fails.
 */
export async function setExploreHDOption(
    bus_info: string,
    option: optionType,
    value: number
): Promise<void> {
    const url = `${DEVICE_API_URL}/devices/set_option`;
    const data = {
        bus_info,
        option,
        value,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(data),
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Error: Invalid index");
                }
                throw new Error("Failed to set exploreHD option");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to set exploreHD option");
            console.error(error);
        });
}

/**
 * Restart a stream
 * @param {string} usbInfo - The usb info of the connected camera.
 * @returns {Promise<void>} - A promise that resolves when the option is successfully set.
 * @throws {Error} - If the index is invalid or the request fails.
 */
export async function restartStream(usbInfo: string): Promise<void> {
    const url = `${DEVICE_API_URL}/restart_stream`;
    const data = {
        usbInfo,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // credentials: "include",
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
        });
}

/**
 * Restore a device to factory settings.
 * @throws {Error} - If the request to reset the device fails.
 */
export async function resetSettings(): Promise<void> {
    const url = `${DEVICE_API_URL}/reset_settings`;
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to reset settings");
            }
            window.location.reload();
        })
        .catch((error: Error) => {
            console.log("Failed to reset settings");
            console.error(error);
            throw error;
        });
}

/**
 * Request to shut down the machine.
 * @throws {Error} - If the request to shut down the machine fails.
 */
export async function shutDownMachine(): Promise<null> {
    const url = `${SYSTEM_API_URL}/shutDownMachine`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    await fetch(url, config).catch((error: Error) => {
        console.log("Failed to restart device");
        console.error(error);
        throw error;
    });
    return null;
}

/**
 * Request to restart the machine.
 * @returns {Promise<null>} - A promise that resolves when the machine is successfully restarted.
 * @throws {Error} - If the request to restart the machine fails.
 */
export async function restartMachine(): Promise<null> {
    const url = `${SYSTEM_API_URL}/restartMachine`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    await fetch(url, config).catch((error: Error) => {
        console.log("Failed to restart device");
        console.error(error);
        throw error;
    });
    return null;
}
/**
 * Request server to update DWEOS
 * @param {string} tag_name - The identifier of the update to install 
 * @returns {Promise<null>} - A promise that will never resolve because it is unimplemented.
 * @throws {Error} - If the request to update DWEOS fails.
 */
export async function installUpdate(tag_name: string): Promise<null> {
    const url = `${UPDATER_API_URL}/install_update`; //Not implemented
    const data = {
        tag_name,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    };
    await fetch(url, config).catch((error: Error) => {
        console.log("Failed to restart device");
        console.error(error);
        throw error;
    });
    return null;
}
/**
 * Request server to see new releases of DWEOS
 * @returns {Promise<null>} - A promise that will never resolve because it is unimplemented.
 * @throws {Error} - If the request to get releases fails.
 */
export async function getReleases(): Promise<ReleaseList> {
    const url = `${UPDATER_API_URL}/releases`; //not implemented
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    return await fetch(url, config)
        .then((response: Response) => response.json())
        .then((data: ReleaseList) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to restart device");
            console.error(error);
            throw error;
        });
}
/**
 * Gewt next free port of a host
 * @param {string} host - The ip address of the host who will be checked for ports
 * @returns {Promise<null>} - A promise that will resolve when the server finds a free port
 * @throws {Error} - If the request to get a free port fails.
 */
export async function getNextPort(host: string): Promise<number> {
    const url = `${DEVICE_API_URL}/devices/get_next_port?${new URLSearchParams({
        host,
    })}`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    const res = await fetch(url, config);
    return ((await res.json()) as PortInfo).port;
}
/**
 * Request server to start a video recording
 * @param {string} usbInfo - The usb device that corresponds to the device that is being recorded
 * @param {Recording} streaming - Information about various gstreamer properties of the video stream including width, height, interval, encode type, and file name
 * @returns {Promise<null>} - A promise that will resolve when a recording has begun.
 */
export async function startVideoSaving(
    usbInfo: string,
    streaming: Recording
): Promise<videoData> {
    const url = `${DEVICE_API_URL}/devices/start_recording`;
    const adjusted = structuredClone(streaming) as any;
    adjusted.encode_type = adjusted.encode_type.replace("StreamEncodeTypeEnum.", "")
    const data = {
        ...adjusted,
        bus_info: usbInfo,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // credentials: "include",
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
            return response.json();
        })
        .then((data: videoData) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
            return { startTime: 0 } as videoData;
        });
}
/**
 * Request server to start a video recording
 * @param {string} usbInfo - A usb that has a video and needs to be stopped
 * @returns {Promise<null>} - A promise that will resolve when a recording has begun.
 * @ {Error} - If the request to start recording fails.
 */
export async function stopVideoSaving(usbInfo: string): Promise<void> {
    const url = `${DEVICE_API_URL}/devices/stop_recording`;
    const data = {
        bus_info: usbInfo,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // credentials: "include",
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
        });
}
/**
 * Tells if a device is currently recording, and if so for how long
 * @param {string} usbInfo - The usb camera who needs to be checked
 * @returns {Promise<recordingPing>} - A promise that will resolve when an update is recceived from the server.
 * @throws {Error} - If the request to start recording fails.
 */
export async function recording_state(usbInfo: string): Promise<recordingPing> {
    const url = `${DEVICE_API_URL}/devices/recording_state`;
    const data = {
        bus_info: usbInfo,
    };
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // credentials: "include",
    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
            return response.json();
        })
        .then((data: recordingPing) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
            return { recording: false, time: 0 } as recordingPing;
        });
}
export async function get_all_active_recording_states(): Promise<Array<recordingPing>> {
    const url = `${DEVICE_API_URL}/devices/all_recording`;
    const config: RequestInit = {
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },

    };

    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
            return response.json();
        })
        .then((data: Array<recordingPing>) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
            return [] as Array<recordingPing>;
        });
}
/**
 * Gets server prefrences
 * @returns {Promise<SavedPrefrences>} - A promise that will resolve when prefrences are reccived.
 * @throws {Error} - If the request fails.
 */
export async function getSettings(): Promise<SavedPrefrences> {
    const url = `${DEVICE_API_URL}/prefrences`;
    const config: RequestInit = {
        mode: "cors",
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to get prefrences");
            }
            return response.json();
        })
        .then((data: SavedPrefrences) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to get prefrences");
            console.error(error);
            throw error;
        });
}

/**
 * Sets a server prefrence
 * @param type - Weather to set a prefence for Recording or Stream
 * @param key - The setting to set
 * @param value - what to set the exact setting
 * @returns {Promise<void>} - A promise that resolves when the request to change settings is completed
 */
export async function setPrefrence(type: "defaultRecording" | "defaultStream" | "defaultProcesses", key: string, value: string | number) {
    const url = `${DEVICE_API_URL}/setprefrences`
    const data = {
        type: type,
        key: key,
        value: value
    }
    const config: RequestInit = {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // credentials: "include",
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Failed to restart stream");
            }
        })
        .catch((error: Error) => {
            console.log("Failed to restart stream");
            console.error(error);
        });


}