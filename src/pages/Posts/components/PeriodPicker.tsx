import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/uishadcn/ui/button'
import { cn } from '@/lib/utils'
import { formatPeriodLabel, shiftPeriod } from '../page-utils'

interface Props {
    period: string
    /** Variante clara para usar sobre el degradado del hero */
    onDark?: boolean
    onChange: (period: string) => void
}

const PeriodPicker = ({ period, onDark, onChange }: Props) => {
    const buttonClasses = cn(
        'size-7 rounded-md',
        onDark ? 'text-white hover:bg-card/20 hover:text-white' : 'text-muted-foreground',
    )

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 rounded-lg border p-1',
                onDark ? 'border-white/25 bg-card/15 backdrop-blur' : 'border-border bg-card',
            )}
        >
            <Button variant="ghost" size="icon" className={buttonClasses} aria-label="Mes anterior" onClick={() => onChange(shiftPeriod(period, -1))}>
                <ChevronLeftIcon />
            </Button>
            <span className={cn('px-1.5 text-sm font-semibold', onDark ? 'text-white' : 'text-foreground')}>
                {formatPeriodLabel(period)}
            </span>
            <Button variant="ghost" size="icon" className={buttonClasses} aria-label="Mes siguiente" onClick={() => onChange(shiftPeriod(period, 1))}>
                <ChevronRightIcon />
            </Button>
        </div>
    )
}

export default PeriodPicker
