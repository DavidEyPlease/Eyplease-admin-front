import { useState } from 'react'
import { useNavigate } from 'react-router'

import { cn } from '@/lib/utils'
import { PulseEvent, PulseGroup } from '../usePulse'

const FILTERS: Array<{ key: 'all' | PulseGroup, label: string }> = [
    { key: 'all', label: 'Todo' },
    { key: 'live', label: 'En vivo' },
    { key: 'publishing', label: 'Publicaciones' },
    { key: 'reports', label: 'Reportes' },
    { key: 'requests', label: 'Solicitudes' },
]

const Event = ({ event, first, index }: { event: PulseEvent, first: boolean, index: number }) => {
    const navigate = useNavigate()

    return (
        <article className={cn('pulse-ev shell-glass pulse-rise', event.tone, first && 'first')} style={{ '--i': Math.min(index, 8) + 3 } as React.CSSProperties}>
            <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-bold text-muted-foreground tabular-nums">{event.time}</span>
                <span className={cn('pulse-tag', event.tone)}>{event.tag}</span>
            </div>
            <h3 className="mt-2 text-[15px] leading-snug font-extrabold tracking-tight">{event.title}</h3>
            {event.text && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{event.text}</p>}

            {!!event.thumbs?.length && (
                <div className="pulse-thumbs">{event.thumbs.map(url => <img key={url} src={url} alt="" loading="lazy" />)}</div>
            )}

            {!!event.actions?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {event.actions.map((action, position) => (
                        <button
                            key={action.label}
                            type="button"
                            onClick={() => navigate(action.to)}
                            className={cn('h-8 cursor-pointer rounded-xl px-3.5 text-[12.5px] font-bold transition-colors', position === 0 ? 'bg-primary/12 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground')}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </article>
    )
}

/** El pulso de hoy: los hechos del día en orden, con filtro por tipo. */
const PulseFeed = ({ events }: { events: PulseEvent[] }) => {
    const [filter, setFilter] = useState<'all' | PulseGroup>('all')

    const counts = (key: 'all' | PulseGroup) => key === 'all' ? events.length : events.filter(event => event.group === key).length
    const shown = filter === 'all' ? events : events.filter(event => event.group === filter)
    const today = shown.filter(event => !event.carried)
    const carried = shown.filter(event => event.carried)

    return (
        <section className="grid gap-3.5">
            <div className="pulse-rise flex flex-wrap items-center justify-between gap-2.5" style={{ '--i': 3 } as React.CSSProperties}>
                <h2 className="text-[15.5px] font-extrabold tracking-tight">El pulso de hoy</h2>
                <div className="flex flex-wrap gap-1.5">
                    {FILTERS.filter(item => item.key === 'all' || counts(item.key) > 0).map(item => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilter(item.key)}
                            className={cn('inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', filter === item.key ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')}
                        >
                            {item.label} <b className="text-[11px] font-extrabold opacity-70">{counts(item.key)}</b>
                        </button>
                    ))}
                </div>
            </div>

            {today.length > 0 && <div className="pulse">{today.map((event, index) => <Event key={event.id} event={event} first={index === 0} index={index} />)}</div>}

            {!today.length && (
                <p className="shell-glass pulse-rise rounded-3xl px-5 py-9 text-center text-[13px] text-muted-foreground" style={{ '--i': 4 } as React.CSSProperties}>
                    Todavía no hay nada registrado hoy{filter !== 'all' ? ' en este filtro' : ''}. En cuanto corra el primer carril, aparece aquí.
                </p>
            )}

            {carried.length > 0 && (
                <>
                    <div className="mt-1 flex items-center gap-3 px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                        <span className="h-px flex-1 bg-border" />Sigue pendiente de días anteriores · {carried.length}<span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="pulse">{carried.map((event, index) => <Event key={event.id} event={event} first={false} index={index} />)}</div>
                </>
            )}
        </section>
    )
}

export default PulseFeed
