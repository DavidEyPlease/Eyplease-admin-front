import { Button } from "@/uishadcn/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/uishadcn/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"

interface MultiSelectProps {
    value?: string[];
    placeholder: string;
    label?: string;
    items: Array<{ label: string; value: string, color?: string }>;
    disabled?: boolean;
    className?: string;
    onChange?: (value: string[]) => void;
}

export function MultiSelect({ items, placeholder, value, onChange }: MultiSelectProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex justify-between text-muted-foreground">
                    {placeholder}
                    <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {items.map(item => {
                    const checked = value?.includes(item.value) ? true : false
                    return (
                        <DropdownMenuCheckboxItem
                            key={item.value}
                            checked={checked}
                            onCheckedChange={v => onChange?.(v ? [...(value || []), item.value] : (value || []).filter(i => i !== item.value))}
                            onSelect={(e) => e.preventDefault()}
                        >
                            {item.label}
                        </DropdownMenuCheckboxItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
