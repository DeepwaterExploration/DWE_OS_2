import { SYSTEM_API_URL } from "../../../utils/api";
import { FilesJson } from "../types";

export async function getVideos(): Promise<FilesJson> {
    const url = `${SYSTEM_API_URL}/videos`;
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
        .then((data: FilesJson) => {
            return data;
        })
        .catch((error: Error) => {
            console.log("Failed to get wifi capability status");
            console.error(error);
            return [] as FilesJson;
        });
}
export function videoProxy(path: string) {
    return `${SYSTEM_API_URL}/servevideo?path=${path}`;
}


