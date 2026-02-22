import { Calendar } from "@/uishadcn/ui/calendar";

interface CalendarInputProps {
    value?: Date;
    onChange: (date: Date) => void;
}

const CalendarInput = ({ value, onChange }: CalendarInputProps) => {
    return (
        <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            // disabled={(date) =>
            //     date < new Date() || date < new Date("1900-01-01")
            // }
            required
            captionLayout="dropdown"
        />
    )
}

export default CalendarInput;