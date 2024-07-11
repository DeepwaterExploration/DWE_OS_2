import numeral from "numeral";

// ----------------------------------------------------------------------

export function fNumber(number: number) {
    return numeral(number).format();
}

export function fCurrency(number: number) {
    const format = number ? numeral(number).format("$0,0.00") : "";

    return result(format, ".00");
}

export function fPercent(number: number) {
    const format =
        number !== null ? numeral(Number(number) / 100).format("0.0%") : "0.0%";

    return format;
}

export function fShortenNumber(number: number) {
    const format = number ? numeral(number).format("0.00a") : "";

    return result(format, ".00");
}

export function fData(number: number) {
    const format = number ? numeral(number).format("0.0 b") : "";

    return result(format, ".0");
}

export function result(format: string, key = ".00") {
    const isInteger = format.includes(key);

    return isInteger ? format.replace(key, "") : format;
}

export function fBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}