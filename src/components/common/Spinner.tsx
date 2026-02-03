import { cn } from "@/lib/utils"

interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    color?: 'primary' | 'secondary',
    className?: string
    label?: string
}

const CLASSES_SIZE = {
    xs: 'size-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
}

const Spinner = ({ label, size = 'sm', color = 'secondary', className, }: Props) => {
    const getColorSpinnerClasses = () => {
        if (color === 'primary') return 'text-primary border-t-primary'
        if (color === 'secondary') return 'text-secondary border-t-secondary'
    }

    return (
        <div className={cn("flex items-center justify-center w-full gap-2", className)}>
            <div
                className={`flex items-center justify-center ${CLASSES_SIZE[size]} text-4xl ${getColorSpinnerClasses()} border-2 border-transparent rounded-full animate-spin`}
            >
                <div
                    className={`flex items-center justify-center ${CLASSES_SIZE[size]} text-2xl text-white border-2 border-transparent rounded-full animate-spin border-t-white`}
                ></div>
            </div>
            {label && (
                <span className={cn(
                    "text-xs font-medium text-gray-600 dark:text-gray-300",
                    {
                        'text-primary': color === 'primary',
                        'text-secondary': color === 'secondary',
                    }
                )}>
                    {label}
                </span>
            )}
        </div>
    )
}

export default Spinner