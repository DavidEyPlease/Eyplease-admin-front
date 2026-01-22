import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    // DialogTrigger,
} from "@/uishadcn/ui/dialog"

type ModalSize = 'xs' | 'sm' | 'lg' | 'xl' | 'xxl' | 'full' | '6xl' | '7xl'

const sizeClasses: Record<ModalSize, string> = {
    xs: 'sm:max-w-xs',
    sm: 'sm:max-w-sm',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    xxl: 'sm:max-w-4xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl',
    full: 'sm:w-full max-w-none',
}

interface Props {
    title: string;
    description?: string;
    footer?: React.ReactNode;
    size?: ModalSize
    children: React.ReactNode;
    open: boolean;
    className?: string
    onOpenChange(open: boolean): void;
}

const Modal = ({ title, description, children, size = 'lg', className, footer, ...props }: Props) => {
    return (
        <Dialog {...props}>
            {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={cn(sizeClasses[size], className)}>
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description &&
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    }
                </DialogHeader>
                {children}
                {footer &&
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                }
            </DialogContent>
        </Dialog>
    )
}

export default Modal;