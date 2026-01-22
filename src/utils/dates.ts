import { Format, format } from "@formkit/tempo";

export const formatDate = (date: Date, formatStyle: Format = { date: "medium", time: "short" }) => {
    return format(date, formatStyle)
}