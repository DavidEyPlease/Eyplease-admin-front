import { ClosingDelivery, ClosingReports } from '@/interfaces/deliveries'
import { cn } from '@/lib/utils'
import { dayOf, monthName, shortDate, statusPill } from '../../deliveries.utils'
import { formatNumber } from '../../page-utils'

interface Props {
    closingOf: string
    days: string[]
    reports: ClosingReports
    entries: ClosingDelivery[]
    publishing: boolean
    onLaunch: (entry: ClosingDelivery) => void
}

/** Las piezas de cada día del mes, en barritas; el punto violeta marca el día en que se lanzó a mano. */
const DayStrip = ({ entry, days }: { entry: ClosingDelivery, days: string[] }) => {
    const max = Math.max(1, ...Object.values(entry.by_day))
    const launched = new Set(entry.launches.map(launch => launch.date))

    return (
        <span className="ent-strip" aria-hidden>
            {days.map(date => {
                const pieces = entry.by_day[date] ?? 0
                return (
                    <span key={date} title={`${shortDate(date)}: ${formatNumber(pieces)} piezas${launched.has(date) ? ' · se lanzó' : ''}`}>
                        <i style={{ height: `${pieces ? Math.max(14, (pieces / max) * 100) : 0}%` }} />
                        <b className={cn(launched.has(date) && 'on')}>{dayOf(date)}</b>
                    </span>
                )
            })}
        </span>
    )
}

const ClosingCard = ({ closingOf, days, reports, entries, publishing, onLaunch }: Props) => {
    const sales = reports.sections[0]

    return (
        <section className="shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-[18px] py-4">
                <h2 className="text-[15px] font-extrabold tracking-tight">Cierre de {monthName(closingOf)}</h2>
                {sales && (
                    <span className="ml-auto text-[12px] text-muted-foreground" title={reports.missing.map(item => `${item.name}: ${item.reports.join(', ')}`).join('\n')}>
                        Reportes {sales.done} de {sales.expected}
                        {reports.ready_on && ` · listos el ${shortDate(reports.ready_on)}`}
                        {reports.missing.length > 0 && <b className="ent-miss"> · faltan {reports.missing.length}</b>}
                    </span>
                )}
            </header>

            <div className="ent-row hd">
                <span>Entrega</span>
                <span>Días del mes</span>
                <span>Salieron</span>
                <span>Estado</span>
                <span />
            </div>

            {entries.map(entry => {
                const canLaunch = entry.mode === 'manual' && entry.pending > 0 && entry.status.code !== 'running'
                return (
                    <div key={entry.key} className="ent-row">
                        <span className="pub-name">
                            <b>{entry.name}</b>
                            <small>{entry.mode === 'auto' ? entry.when : entry.ready_since ? `A mano · lista desde el ${shortDate(entry.ready_since)}` : 'A mano'}</small>
                        </span>
                        <DayStrip entry={entry} days={days} />
                        <span className="pub-fmt">
                            <span><b>{formatNumber(entry.pieces)}</b> · {formatNumber(entry.clients)} clientas</span>
                            {/* Lo que el estado ya dice no se repite aquí */}
                            {entry.pending_no_design > 0 && entry.status.code !== 'no_design' && <span className="ent-miss">{formatNumber(entry.pending_no_design)} sin diseño</span>}
                        </span>
                        <span className={`pub-pill ${statusPill(entry.status)}`}>{entry.status.label}</span>
                        <span className="flex justify-end">
                            {canLaunch && (
                                <button type="button" disabled={publishing} className="vta-btn gro-primary !h-8 !text-[12px]" onClick={() => onLaunch(entry)}>
                                    Lanzar
                                </button>
                            )}
                        </span>
                    </div>
                )
            })}
        </section>
    )
}

export default ClosingCard
