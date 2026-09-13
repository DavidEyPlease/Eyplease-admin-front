import { CheckIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { DailySection, DailyTodayStatus } from "@/interfaces/overview"

/**
 * Las secciones que deben salir todos los días.
 *
 * Cada una trae el calendario del mes: un cuadro por día, para ver de un
 * vistazo si el hueco es de ayer o viene de arrastre. El promedio o un "7 de
 * 13" suelto no dice dónde está el problema; el calendario sí.
 */

const STATUS_DOT: Record<DailyTodayStatus, string> = {
    ok: "bg-emerald-500",
    scheduled: "bg-slate-300",
    missing: "bg-red-500",
}

const STATUS_LABEL: Record<DailyTodayStatus, string> = {
    ok: "Publicado hoy",
    scheduled: "Programado",
    missing: "No corrió hoy",
}

const StatusIcon = ({ status }: { status: DailyTodayStatus }) => {
    if (status === "ok") return <CheckIcon className="size-3.5 text-emerald-600" />
    if (status === "scheduled") return <ClockIcon className="size-3.5 text-slate-400" />
    return <TriangleAlertIcon className="size-3.5 text-red-600" />
}

interface Props {
    sections: DailySection[]
    daysInMonth: number
    daysElapsed: number
}

const DailyRail = ({ sections, daysInMonth, daysElapsed }: Props) => {
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
        <div className="grid min-w-0 gap-2.5">
            {sections.map((section) => {
                const covered = new Set(section.covered_days)
                const pct = section.days_expected
                    ? Math.round((section.days_covered / section.days_expected) * 100)
                    : 100

                return (
                    <div
                        key={section.key}
                        className="rounded-xl border border-slate-200/80 bg-white p-3.5 transition hover:border-slate-300"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="relative flex size-2.5 shrink-0">
                                {section.today_status === "ok" && (
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                )}
                                <span
                                    className={cn(
                                        "relative inline-flex size-2.5 rounded-full",
                                        STATUS_DOT[section.today_status]
                                    )}
                                />
                            </span>

                            <span className="text-sm font-semibold text-slate-900">{section.name}</span>

                            <span className="font-mono text-[11px] tabular-nums text-slate-400">
                                {section.scheduled_at}
                            </span>

                            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium">
                                <StatusIcon status={section.today_status} />
                                <span
                                    className={cn(
                                        section.today_status === "ok" && "text-emerald-700",
                                        section.today_status === "scheduled" && "text-slate-500",
                                        section.today_status === "missing" && "text-red-700"
                                    )}
                                >
                                    {STATUS_LABEL[section.today_status]}
                                </span>
                            </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {/* Calendario del mes: un cuadro por día. */}
                            <div className="flex flex-1 flex-wrap gap-[3px]">
                                {days.map((day) => {
                                    const isToday = day === daysElapsed
                                    const isFuture = day > daysElapsed
                                    const done = covered.has(day)

                                    // Hoy, mientras no llegue su hora, no es un
                                    // hueco: pintarlo en rojo contradice el
                                    // "Programado" que dice la línea de arriba.
                                    const pending = isToday && section.today_status === "scheduled"

                                    const tone =
                                        isFuture || pending
                                            ? "bg-slate-100"
                                            : done
                                              ? "bg-emerald-500"
                                              : "bg-red-200"

                                    const label = isFuture
                                        ? "aún no llega"
                                        : done
                                          ? "publicado"
                                          : pending
                                            ? `programado para las ${section.scheduled_at}`
                                            : "sin publicar"

                                    return (
                                        <span
                                            key={day}
                                            title={`Día ${day}: ${label}`}
                                            className={cn(
                                                "size-[13px] rounded-[3px] transition",
                                                tone,
                                                isToday && "ring-2 ring-slate-900/20 ring-offset-1"
                                            )}
                                        />
                                    )
                                })}
                            </div>

                            <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                <strong className="text-slate-900">{section.days_covered}</strong>/
                                {section.days_expected} días
                                {section.days_missing > 0 && (
                                    <span className="ml-1 text-red-600">· faltan {section.days_missing}</span>
                                )}
                                <span className="ml-1.5 text-slate-400">({pct}%)</span>
                            </span>
                        </div>

                        {section.failed_jobs > 0 && (
                            <p className="mt-2 text-xs text-amber-700">
                                {section.failed_jobs} piezas fallaron al generarse este mes
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default DailyRail
