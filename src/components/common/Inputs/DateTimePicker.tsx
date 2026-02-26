import { cn } from "@/lib/utils";
import { Button } from "@/uishadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "@formkit/tempo";
import CalendarInput from "./CalendarInput";
import { Separator } from "@/uishadcn/ui/separator";
import TimeInput from "./TimeInput";

interface DateTimePickerProps {
    disabled?: boolean;
    label?: string;
    buttonClassName?: string;
    withTime?: boolean;
    dateValue?: Date;
    onDateChange: (date: Date) => void;
    timeValue?: string;
    onTimeChange?: (time: string) => void;
}

const DateTimePicker = ({ disabled, label = 'Selecciona una fecha', withTime = true, dateValue, buttonClassName, onDateChange, timeValue, onTimeChange }: DateTimePickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                        "w-full pl-3 text-left font-normal dark:bg-input/30 py-5",
                        buttonClassName,
                        !dateValue && "text-muted-foreground"
                    )}
                >
                    {dateValue ? (
                        format(dateValue, { date: 'long' })
                    ) : (
                        <span>{label}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <CalendarInput
                    value={dateValue}
                    onChange={onDateChange}
                />
                {withTime && onTimeChange && (
                    <>
                        <Separator className="my-2" />
                        <div className="p-2">
                            <TimeInput
                                value={timeValue}
                                onChange={onTimeChange}
                            />
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    )
}

export default DateTimePicker;