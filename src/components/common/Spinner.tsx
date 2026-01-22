import { cn } from "@/lib/utils"

interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    color?: 'primary' | 'secondary',
    className?: string
}

const CLASSES_SIZE = {
    xs: 'size-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
}

const Spinner = ({ size = 'sm', color = 'secondary', className, }: Props) => {
    const getColorSpinnerClasses = () => {
        if (color === 'primary') return 'text-primary border-t-primary'
        if (color === 'secondary') return 'text-secondary border-t-secondary'
    }

    return (
        <div className={cn("flex flex-col items-center justify-center w-full gap-4", className)}>
            <div
                className={`flex items-center justify-center ${CLASSES_SIZE[size]} text-4xl ${getColorSpinnerClasses()} border-2 border-transparent rounded-full animate-spin`}
            >
                <div
                    className={`flex items-center justify-center ${CLASSES_SIZE[size]} text-2xl text-white border-2 border-transparent rounded-full animate-spin border-t-white`}
                ></div>
            </div>
        </div>
    )
}

export default Spinner