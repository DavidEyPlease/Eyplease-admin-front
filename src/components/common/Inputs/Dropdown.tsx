import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/uishadcn/ui/field";
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
    error?: string
    onChange?: (value: string) => void;
}

const Dropdown = ({ placeholder, label, items, disabled, value, className, error, onChange }: DropdownProps) => {
    return (
        <Field data-invalid={Boolean(error)} className="w-full gap-1">
            {label && <FieldLabel className="m-0">{label}</FieldLabel>}
            <Select defaultValue={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={cn("w-full", className)} aria-invalid={Boolean(error)}>
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
            <FieldError>{error}</FieldError>
        </Field>
    )
}

export default Dropdown;