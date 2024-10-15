import { getRequest } from "../../utils/utils";

export async function getStatus() {
    const response = await getRequest("/wifi/status");
    return (await response.json()) as { status: string };
}
