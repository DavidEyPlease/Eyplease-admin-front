import { cn } from "@/lib/utils";
import { Label } from "@/uishadcn/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/uishadcn/ui/select"

interface DropdownProps {
    value?: string;
    placeholder: string;
    label?: string;
    items: Array<{ label: string; value: string, color?: string }>;
    disabled?: boolean;
    className?: string;
    onChange?: (value: string) => void;
}

const Dropdown = ({ placeholder, label, items, disabled, value, className, onChange }: DropdownProps) => {
    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Select defaultValue={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={cn("w-full", className)}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.color && <div className={`size-3 rounded-full ${item.color}`} />}
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}

export default Dropdown;