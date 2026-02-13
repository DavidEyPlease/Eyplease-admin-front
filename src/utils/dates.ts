import { Format, format } from "@formkit/tempo";

export const formatDate = (date: Date, formatStyle: Format = { date: "medium", time: "short" }) => {
    return format(date, formatStyle)
}

export const toLocalDateFromUtc = (value: Date | string) => {
    const date = new Date(value);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}