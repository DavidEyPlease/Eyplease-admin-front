import { Link } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'
import { DailyReport } from '../usePulse'
import { clock, isToday } from '../lib'

/** Los reportes que el robot baja cada día: cuántas clientas ya lo tienen contra cuántas deben tenerlo. */
const ReportsCard = ({ reports }: { reports: DailyReport[] }) => {
    const complete = reports.filter(report => report.loaded >= report.usual).length
    const allDone = reports.length > 0 && complete === reports.length

    return (
        <section className="shell-glass pulse-rise rounded-3xl p-[18px]">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-[14.5px] font-extrabold tracking-tight">Reportes del día</h2>
                <span className={cn('pulse-tag', allDone ? 'ok' : 'warn')}>{complete} de {reports.length}</span>
            </div>

            <div className="mt-2 divide-y divide-border">
                {reports.map(report => {
                    const done = report.loaded >= report.usual
                    const pct = report.usual ? Math.min(100, (report.loaded / report.usual) * 100) : 0
                    return (
                        <div key={report.section_key} className="flex items-end gap-3 py-3">
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13px] font-bold">{report.name}</b>
                                <span className={cn('pulse-bar mt-2 block', !done && 'warn')}><i style={{ width: `${pct}%` }} /></span>
                                <small className="mt-1.5 block text-[11px] text-muted-foreground">
                                    {report.last_at ? `${done ? 'Cargadas' : 'Última carga'} · ${isToday(report.last_at) ? clock(report.last_at) : 'ayer o antes'}` : 'Todavía no baja hoy'}
                                    {report.rejected > 0 ? ` · ${report.rejected} rechazados` : ''}
                                </small>
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
