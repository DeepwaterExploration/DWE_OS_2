/**
 * Represents a Device object. Same as the one defined in the backend
 */
export interface Device {
    cameras: Camera[];
    controls: Control[];
    bus_info: string;
    pid: number;
    vid: number;
    manufacturer: string;
    device_info: CameraInfo;
    nickname: string;
    options: StreamOptions;
    stream: Stream;
    recording: Recording;
}

export interface Camera {
    path: string;
    formats: { [index: string]: CameraFormatSize[] };
}

export interface CameraFormatSize {
    width: number;
    height: number;
    intervals: CameraInterval[];
}

/**
 * Represents a camera interval
 */
export interface CameraInterval {
    /* The stream interval numerator */
    numerator: number;
    /* The stream interval denominator */
    denominator: number;
}

/**
 * Represents a UVC control.
 */
export interface Control {
    flags: ControlFlags;
    /* The control ID */
    control_id: number;
    name: string;
    value: number;
}

export interface MenuItem {
    name: string;
    index: number;
}

export interface ControlFlags {
    default_value: number;
    disabled: boolean;
    grabbed: boolean;
    max_value: number;
    min_value: number;
    read_only: boolean;
    slider: number;
    step: number;
    control_type: controlType;
    update: number;
    volatility: number;
    write_only: boolean;
    menu?: MenuItem[];
}

export interface CameraInfo {
    /* Differentiator between cameras (device path) */
    device_name: string;
    bus_info: string;
    pid: number;
    vid: number;
    device_paths: string[];
}

export interface StreamOptions {
    bitrate: number;
    gop: number;
    mode: number;
}

export interface Stream {
    device_path: string;
    encode_type: encodeType;
    stream_type: streamType;
    endpoints: StreamEndpoint[];
    format: StreamFormat;
    configured: boolean;
}

export interface Recording {
    encode_type: encodeType;
    format: StreamFormat;
    name: string;
}

/* If we ever need to add more compression formats, just add them here */
export enum encodeType {
    MJPEG = "MJPEG",
    H264 = "H264",
}

export enum controlType {
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN",
    MENU = "MENU",
    BUTTON = "BUTTON",
    INTEGER64 = "INTEGER64",
    CTRL_CLASS = "CTRL_CLASS",
    STRING = "STRING",
    BITMASK = "BITMASK",
    INTEGER_MENU = "INTEGER_MENU",
}

export enum bitrateMode {
    VBR = 2,
    CBR = 1,
}

export enum optionType {
    BITRATE = "BITRATE",
    GOP = "GOP",
    MODE = "MODE",
}

/* If we ever need to support more stream protocols, just add them here */
export enum streamType {
    UDP = "UDP",
}

export interface PortInfo {
    port: number;
}

/**
 * Represents a stream format.
 */
export interface StreamFormat {
    /* The stream width */
    width: number;
    /* The stream height */
    height: number;
    /* The stream interval */
    interval: CameraInterval;
}

/**
 * Represents a stream endpoint.
 */
export interface StreamEndpoint {
    /* The stream endpoint host */
    host: string;
    /* The stream endpoint port */
    port: number;
}

/**
 * Represents a route in a navigation system.
 */
export interface RouteItem {
    /* The path for the route */
    route: string;
    /* The component rendered when the route is matched */
    component: React.ReactNode;
    /* (Optional) Whether matches to the route should be exact */
    exact?: boolean;
    /* The icon associated with this route */
    icon: React.ReactElement;
    /* The category the route belongs to */
    category: string;
    /* The type of route */
    type: routeType;
    /* A descriptive name for the route, used for display purposes */
    name: string;
    /* A unique key to identify the route, used when rendering dynamic routes */
    key: string;
    /* Whether the route is the default route */
    default: boolean;
}

/**
 * Represents the types of routes used in the navigation system
 */
export enum routeType {
    /* Collapsible group of routes */
    COLLAPSE = "collapse",
    /* A single route item */
    ITEM = "item",
}

/* Updater */

export interface Release {
    body: string;
    name: string;
    prerelease: boolean;
    published_at: string;
    tag_name: string;
    url: string;
    current: boolean;
    mostRecent: boolean;
}

export interface ReleaseList {
    releases: Release[];
}

export interface videoData {
    startTime: number;
}

export interface recordingPing {
    recording: boolean,
    time: number
}


export interface StreamConfig {
    defaultHost: string
    defaultPort: number
}

export interface RecordingConfig {
    defaultName: string
    defaultFormat: encodeType
    defaultResolution: string
    defaultFPS: number
}
export interface ProcessConfig {
    defaultNumber: number
}
export interface SavedPrefrences {
    defaultStream: StreamConfig
    defaultRecording: RecordingConfig
    defaultProcesses: ProcessConfig
}