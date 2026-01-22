import { Button as UIButton } from "@/uishadcn/ui/button"
import { clsx } from "clsx"
import Spinner from "./Spinner"

interface Props {
    text?: React.ReactNode
    type?: "button" | "submit" | "reset"
    loading?: boolean
    color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
    rounded?: boolean
    size?: 'sm' | 'lg' | 'icon'
    block?: boolean
    disabled?: boolean
    variant?: 'link' | 'outline' | 'ghost'
    className?: string
    onClick?: () => void
}

const Button = ({ text, type = 'button', loading, variant, size, disabled, rounded, className, block, color = 'primary', ...props }: Props) => {
    return (
        <UIButton
            type={type}
            variant={variant}
            disabled={loading || disabled}
            size={size}
            className={clsx(
                // 'w-max',
                variant && !['outline', 'ghost'].includes(variant) && `bg-${color}`,
                variant === 'outline' && `border border-primary`,
                rounded && 'rounded-full',
                block && 'w-full',
                className
            )}
            {...props}
        >
            <div className={clsx(variant && ['outline', 'ghost'].includes(variant.toString()) && 'text-primary dark:text-white', "flex items-center gap-2")}>
                {loading && <Spinner />}
                {text}
            </div>
        </UIButton>
    )
}

export default Button