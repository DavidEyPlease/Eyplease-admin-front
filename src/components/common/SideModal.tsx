import { cn } from "@/lib/utils";
import { ScrollArea } from "@/uishadcn/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/uishadcn/ui/sheet"

const SHEET_SIZES = {
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    'full': 'sm:max-w-full',
}

interface SideModalProps {
    open: boolean;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: keyof typeof SHEET_SIZES;
    onOpenChange: (open: boolean) => void;
}

const SideModal = ({ open, onOpenChange, title, description, children, size = 'sm' }: SideModalProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={cn(SHEET_SIZES[size], 'flex flex-col h-full')} onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader className="sticky top-0">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-4 pb-4">
                        {children}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

export default SideModal