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
            <SheetContent className={`${SHEET_SIZES[size]}`} onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="px-4">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default SideModal