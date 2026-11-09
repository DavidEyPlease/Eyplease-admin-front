import { Link } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'
import { dailyDone, dailyEmptyLabel, dailyReceived } from '@/utils/dailyReports'
import { DailyReport } from '../usePulse'
import { clock, isToday } from '../lib'
import { afterImport, baseAccount, Explanation, namesByLabel } from '../problems'

/** A quién le falta ese reporte hoy y por qué: de la lista de la API y de lo que dijo el robot. */
const whoIsMissing = (report: DailyReport, explained: Explanation[]): Explanation[] => {
    if (!report.missing) return explained
    return report.missing.map(item => {
        const account = baseAccount(item.account)
        return explained.find(entry => entry.account === account)
            ?? { account, name: item.name, label: item.rejected ? 'el import rechazó su archivo' : item.first_time ? 'hace días que no se le baja' : 'sin motivo registrado' }
    })
}

/**
 * Los reportes que el robot baja cada día: cuántas clientas ya lo tienen contra cuántas deben tenerlo, y a quién le
 * falta y por qué. El 4-nov-2026 los seis decían «falta 1» y no se sabía que era la misma clienta en todos.
 */
const ReportsCard = ({ reports, explained = {}, importAt }: { reports: DailyReport[], explained?: Record<string, Explanation[]>, importAt?: Record<string, string> }) => {
    const complete = reports.filter(dailyDone).length
    const allDone = reports.length > 0 && complete === reports.length
    /* Sólo después de su hora de carga: antes, faltar es lo normal (ver afterImport) */
    const pending = reports.filter(report => !dailyDone(report) && isToday(report.last_at) && afterImport(importAt, report.section_key))
    const missingBy = new Map(pending.map(report => [report.section_key, whoIsMissing(report, explained[report.section_key] ?? [])]))
    /* Si lo que falta en varios reportes es de las mismas 1 o 2 clientas, se dice una vez arriba */
    const people = [...new Map([...missingBy.values()].flat().map(entry => [entry.account, entry])).values()]
    const sameFew = pending.length > 1 && people.length > 0 && people.length <= 2 && [...missingBy.values()].every(list => list.length > 0)

    return (
        <section className="shell-glass pulse-rise rounded-3xl p-[18px]">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-[14.5px] font-extrabold tracking-tight">Reportes del día</h2>
                <span className={cn('pulse-tag', allDone ? 'ok' : 'warn')}>{complete} de {reports.length}</span>
            </div>
            {sameFew && (
                <p className="mt-2 rounded-xl bg-foreground/[.04] px-3 py-2 text-[11.5px] leading-snug text-muted-foreground">
                    Todo lo que falta hoy es de <b className="font-bold text-foreground">{people.map(entry => entry.name).join(' y ')}</b>
                    {people.length === 1 ? ` (${people[0].label})` : ''}.
                </p>
            )}

            <div className="mt-2 divide-y divide-border">
                {reports.map(report => {
                    const done = dailyDone(report)
                    /* Antes de su hora de carga no falta nada: se dice cuándo entra, sin barra de aviso */
                    const waiting = !done && !afterImport(importAt, report.section_key) && !!importAt?.[report.section_key]
                    const pct = report.usual ? Math.min(100, (dailyReceived(report) / report.usual) * 100) : 0
                    return (
                        <div key={report.section_key} className="flex items-end gap-3 py-3">
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13px] font-bold">{report.name}</b>
                                <span className={cn('pulse-bar mt-2 block', !done && !waiting && 'warn')}><i style={{ width: `${pct}%` }} /></span>
                                <small className="mt-1.5 block text-[11px] text-muted-foreground">
                                    {waiting
                                        ? `Se carga a las ${importAt![report.section_key]}${report.loaded && isToday(report.last_at) ? ` · ${report.loaded} ya ${report.loaded === 1 ? 'está' : 'están'}` : ''}`
                                        : report.last_at ? `${done ? 'Cargadas' : 'Última carga'} · ${isToday(report.last_at) ? clock(report.last_at) : 'ayer o antes'}` : 'Todavía no baja hoy'}
                                    {dailyEmptyLabel(report) ? ` · ${dailyEmptyLabel(report)}` : ''}
                                    {report.rejected > 0 ? ` · ${report.rejected} rechazados` : ''}
                                </small>
                                {!done && !sameFew && !!missingBy.get(report.section_key)?.length && (
                                    <small className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                                        Falta: {namesByLabel(missingBy.get(report.section_key)!)}
                                    </small>
                                )}
                            </span>
                            <span className="pb-4 text-[17px] font-extrabold tracking-tight tabular-nums">{report.loaded}<span className="text-[12px] font-semibold text-muted-foreground"> / {report.usual}</span></span>
                        </div>
                    )
                })}
                {!reports.length && <p className="py-5 text-center text-[12px] text-muted-foreground">Sin reportes diarios registrados.</p>}
            </div>

            <Link to={APP_ROUTES.REPORTS.DASHBOARD} className="mt-1 inline-block text-[12px] font-bold text-primary hover:underline">Ver el robot y sus corridas</Link>
        </section>
    )
}

export default ReportsCard
