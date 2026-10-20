import createClient from "openapi-fetch";
import type { paths } from "@/schemas/dweos";

export const hostAddress: string = window.location.hostname;

export const API_CLIENT = createClient<paths>({ baseUrl: `http://${import.meta.env.DEV ? hostAddress + ":5000" : window.location.host}` });

export const TTYD_TOKEN_URL = `http://${window.location.hostname}:7681/token`;

export const TTYD_WS = `ws://${window.location.hostname}:7681/ws`;
