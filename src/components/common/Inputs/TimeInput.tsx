import { Input } from "@/uishadcn/ui/input";

interface TimeInputProps {
    value?: string;
    onChange: (time: string) => void;
}

const TimeInput = ({ value, onChange }: TimeInputProps) => {
    return (
        <Input
            type="time"
            id="time-picker"
            step="1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}

export default TimeInput;