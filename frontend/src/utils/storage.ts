import { encodeType, recordingPing } from "../types/types";

export const calculateVideoFileSize = (seconds: number, fps: number, numpixels: number, encode_type: encodeType) => {
    const size1920 = 1920 * 1080;
    const defFPS = 30;
    const sizeProp = size1920 / numpixels;
    const fpsProp = defFPS / fps;

    let bitrateEST = 25418; // Approximate values that were used for all calculations (Still based on encode type)

    if (encode_type == encodeType.H264) {
        bitrateEST = 5000;
    }

    const formula = 1.4957659506 + (0.0838012581 * Math.log(seconds / sizeProp / fpsProp)) // r^2 = .641


    const size = (bitrateEST / 8) * seconds * 1024 * formula

    return size
}

export const calculateAllRecordingSizes = (recordings: Array<recordingPing>) => {
    const epoch_secs = Date.now() / 1000
    return recordings.map((recording) => {
        return {
            id: recording.camera.id,
            size: calculateVideoFileSize(
                epoch_secs - recording.time,
                recording.config.fps,
                recording.config.resolution
                    .split("x")
                    .map(parseFloat)
                    .reduce((x, y) => x * y, 1),
                recording.config.format,
            )
        }
    })
}