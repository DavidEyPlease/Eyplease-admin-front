import { cn } from "@/lib/utils";

interface TypographyProps {
    text: string | React.ReactNode;
    className?: string;
}

export function TypographyH3({ text }: TypographyProps) {
    return (
        <h3 className="text-foreground scroll-m-20 text-2xl font-semibold tracking-tight">
            {text}
        </h3>
    )
}

export function TypographyH4({ text }: TypographyProps) {
    return (
        <h4 className="text-foreground scroll-m-20 text-xl font-semibold tracking-tight">
            {text}
        </h4>
    )
}

export function TypographyP({ text }: TypographyProps) {
    return (
        <p className="text-foreground leading-7 [&:not(:first-child)]:mt-6">
            {text}
        </p>
    )
}

export function TypographySmall({ text, className }: TypographyProps) {
    return (
        <small className={cn("text-foreground text-sm leading-none font-medium", className)}>{text}</small>
    )
}


