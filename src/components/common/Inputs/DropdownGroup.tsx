import { cn } from "@/lib/utils";
import { Label } from "@/uishadcn/ui/label";
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/uishadcn/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/uishadcn/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/uishadcn/ui/popover"
import { useState } from "react";

interface DropdownGroupProps {
    value?: string;
    placeholder?: string;
    label?: string;
    groups: Array<{ groupName: string, items: Array<{ label: string; value: string, color?: string }> }>;
    disabled?: boolean;
    className?: string;
    onChange?: (value: string) => void;
}

const DropdownGroup = ({ placeholder = 'Seleccionar', label, groups, disabled, value, className, onChange }: DropdownGroupProps) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-11 dark:bg-input/30"
                    >
                        {value ? groups.flatMap(g => g.items).find(i => i.value === value)?.label : placeholder}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                            <CommandEmpty>No hay resultados.</CommandEmpty>
                            {groups.map((group) => (
                                <CommandGroup heading={group.groupName} key={group.groupName}>
                                    {group.items.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={item.value}
                                            onSelect={() => {
                                                onChange?.(item.value);
                                                setOpen(false)
                                            }}
                                        >
                                            {item.label}
                                            <Check
                                                className={cn(
                                                    "ml-auto",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>

    )
}

export default DropdownGroup;