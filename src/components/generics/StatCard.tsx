import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"

interface Props {
    title: string
    stat: string | number
    icon: React.ReactNode
    children?: React.ReactNode
    color: keyof typeof COLOR_TO_CLASS
}

const COLOR_TO_CLASS = {
    primary: {
        text: 'text-primary',
        border: 'border-l-primary'
    },
    secondary: {
        text: 'text-secondary',
        border: 'border-l-secondary'
    },
    success: {
        text: 'text-emerald-500',
        border: 'border-l-emerald-500'
    },
    danger: {
        text: 'text-red-500',
        border: 'border-l-red-500'
    },
    warning: {
        text: 'text-yellow-500',
        border: 'border-l-yellow-500'
    },
    gray: {
        text: 'text-gray-500',
        border: 'border-l-gray-500'
    },
    purple: {
        text: 'text-purple-500',
        border: 'border-l-purple-500'
    },
    blue: {
        text: 'text-blue-500',
        border: 'border-l-blue-500'
    },
    orange: {
        text: 'text-orange-500',
        border: 'border-l-orange-500'
    },
    cyan: {
        text: 'text-cyan-500',
        border: 'border-l-cyan-500'
    },
}

const StatSimpleCard = ({ title, stat, icon, children, color = 'primary' }: Props) => {
    return (
        <Card className={cn('border-l-4', COLOR_TO_CLASS[color]?.border)}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={cn('text-2xl font-bold', COLOR_TO_CLASS[color]?.text)}>{stat}</div>
                {children}
            </CardContent>
        </Card>
    )
}

interface StatCardProps {
    title: string
    description?: string
    startContent?: React.ReactNode
    endContent?: React.ReactNode
    children?: React.ReactNode
    color: keyof typeof COLOR_TO_CLASS
}

export const StatCard = ({ title, description, startContent, color, endContent, children }: StatCardProps) => {
    return (
        <Card className={cn('border-l-4', COLOR_TO_CLASS[color]?.border)}>
            <CardContent className="p-4">
                <div className={cn("flex items-start justify-between", children && 'mb-3')}>
                    <div className="flex items-center space-x-2">
                        {startContent}
                        <div>
                            <h4 className="text-sm font-medium text-foreground">
                                {title}
                            </h4>
                            {description && (
                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {endContent}
                </div>

                {children}
            </CardContent>
        </Card>
    )
}

export default StatSimpleCard