import { Link } from "react-router"
import { ArrowRightIcon, CircleCheckIcon, DownloadCloudIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { useDailyReports } from "@/pages/Reports/useReports"
import { fmtDateTime } from "@/pages/Reports/reports.constants"

/**
 * Los reportes que el robot baja cada mañana del portal de Mary Kay.
 *
 * Va ANTES de Publicaciones a propósito: son la materia prima. Si un reporte no
 * bajó, las piezas de ese día salen con datos viejos o no salen, y verlo debajo
 * de las publicaciones obliga a deducir la causa desde el efecto.
 *
 * El denominador son las clientas con derecho a ese reporte según su plan, que
 * son a las que el robot entra. Por eso «0 de 98» dice algo y un número suelto
 * no: sin contra qué compararlo, un cero se confunde con «todavía no le toca».
 */
const DailyReportsCard = () => {
    const { dailyReports, loading } = useDailyReports()

    if (loading && !dailyReports.length) return null
    if (!dailyReports.length) return null

    const completos = dailyReports.filter((r) => r.usual > 0 && r.loaded >= r.usual).length
    const rechazadas = dailyReports.reduce((total, r) => total + r.rejected, 0)
    const todoBien = completos === dailyReports.length && !rechazadas

    return (
        <div className="min-w-0 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <DownloadCloudIcon className="size-4 text-muted-foreground" />
                    Reportes del día
                </h3>
                {todoBien ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                        <CircleCheckIcon className="size-3.5" />
                        Los {dailyReports.length} bajaron completos
                    </span>
                ) : (
                    <span className="text-xs tabular-nums text-muted-foreground">
                        <strong className="text-foreground">{completos}</strong> de {dailyReports.length} completos
                        {rechazadas > 0 && (
                            <span className="text-red-700 dark:text-red-300"> · {rechazadas} rechazadas</span>
                        )}
                    </span>
                )}
            </div>

            <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
                {dailyReports.map((r) => {
                    const completo = r.usual > 0 && r.loaded >= r.usual
                    const pct = r.usual > 0 ? Math.min(100, Math.round((r.loaded / r.usual) * 100)) : 0

                    return (
                        <li key={r.section_key} className="grid gap-1 rounded-lg bg-muted/40 px-2.5 py-2">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="truncate text-sm text-foreground">{r.name}</span>
                                <span
                                    className={
                                        "shrink-0 text-sm font-semibold tabular-nums " +
                                        (completo
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : "text-amber-700 dark:text-amber-300")
                                    }
                                >
                                    {r.loaded}
                                    {r.usual > 0 && (
                                        <span className="font-normal text-muted-foreground"> / {r.usual}</span>
                                    )}
                                </span>
                            </div>

                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full transition-[width] duration-500"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundImage: completo
                                            ? "linear-gradient(90deg,#10b981,#5DD9D2)"
                                            : "linear-gradient(90deg,#f59e0b,#fbbf24)",
                                    }}
                                />
                            </div>

                            <div className="flex items-baseline justify-between gap-3 text-[11px] text-muted-foreground">
                                {/* La hora dice mas que el porcentaje: un reporte al que
                                    todavia no le toca su descarga esta en cero y no pasa nada. */}
                                <span>Última carga {fmtDateTime(r.last_at)}</span>
                                {r.rejected > 0 && (
                                    <span className="shrink-0 text-red-700 dark:text-red-300">
                                        {r.rejected} rechazadas
                                    </span>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>

            <Link
                to={APP_ROUTES.REPORTS.DASHBOARD}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 transition hover:gap-2 hover:underline"
            >
                Ir a Reportes
                <ArrowRightIcon className="size-3.5" />
            </Link>
        </div>
    )
}

export default DailyReportsCard
