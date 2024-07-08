import { SYSTEM_API_URL } from "../../../utils/api";
import { CPUInfo, processInfo, TemperatureInfo } from "../types";

/**
 * Retrieves information about the CPU and its usage from the system.
 * @returns {Promise<CPUInfo>} - A promise that resolves to an array of Device objects.
 * @throws {Error} - If the request to retrieve the cpu info fails.
 */
export async function getCPUInfo(): Promise<CPUInfo> {
    const url = `${SYSTEM_API_URL}/getCPU`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: CPUInfo) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to retrieve device processor information");
            console.error(error);
            return {} as CPUInfo;
        });
}

/**
 * Retrieves information about the temperature from the system.
 * @returns {Promise<TemperatureInfo>} - A promise that resolves to a TemperatureInfo object.
 * @throws {Error} - If the request to retrieve the temperature info fails.
 */
export async function getTemperatureInfo(): Promise<TemperatureInfo> {
    const url = `${SYSTEM_API_URL}/getTemperature`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: TemperatureInfo) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to retrieve device temperature");
            console.error(error);
            return {} as TemperatureInfo;
        });
}

/**
 * Gets a list of running system processes 
 * @returns {Promise<processInfo[]>} - A promise that resolves to a process info object
 * @throws {Error} - If the request to get the process info fails
 */
export async function getProcesses(): Promise<processInfo[]> {
    const url = `${SYSTEM_API_URL}/processes`;
    const config: RequestInit = {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    return await fetch(url, config)
        // Process the response data
        .then((response: Response) => response.json())
        .then((data: processInfo[]) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to retrieve device temperature");
            console.error(error);
            return [] as processInfo[];
        });
}