import { useState } from "react"
import dayjs from "dayjs"
import { CalendarIcon, XIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover"
import { Calendar } from "@/uishadcn/ui/calendar"
import { cn } from "@/lib/utils"

interface DateInputProps {
    value?: Date
    onChange: (date: Date | undefined) => void
    placeholder?: string
    className?: string
}

/** Single date picker (shadcn Calendar inside a Popover). */
const DateInput = ({ value, onChange, placeholder = "Fecha", className }: DateInputProps) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition focus:border-[#5B47E0]",
                        className
                    )}
                >
                    <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={cn("whitespace-nowrap", value ? "text-foreground" : "text-muted-foreground")}>
                        {value ? dayjs(value).format("DD/MM/YYYY") : placeholder}
                    </span>
                    {value && (
                        <span
                            role="button"
                            tabIndex={-1}
                            aria-label="Limpiar fecha"
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange(undefined)
                            }}
                            className="ml-1 text-muted-foreground/60 transition hover:text-foreground"
                        >
                            <XIcon className="h-3.5 w-3.5" />
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                    }}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    )
}

export default DateInput
