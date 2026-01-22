import { Tabs, TabsList, TabsTrigger } from "@/uishadcn/ui/tabs"

interface DynamicTabsProps {
    items: { value: string; label: string, disabled?: boolean, icon?: React.ReactNode }[];
    value?: string;
    className?: string;
    onValueChange?: (value: string) => void;
}

const DynamicTabs = ({ items, value, className, onValueChange }: DynamicTabsProps) => {
    return (
        <Tabs defaultValue={value} onValueChange={(e) => onValueChange?.(e)}>
            <TabsList className={className}>
                {items.map(item => (
                    <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
                        {item.icon}
                        {item.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}

export default DynamicTabs;
