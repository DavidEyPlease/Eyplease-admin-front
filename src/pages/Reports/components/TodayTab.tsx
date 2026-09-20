import { toast } from "sonner"
import { CloudDownloadIcon, SlidersHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDailyReports, useDispatchDownloadRun, useDownloadRuns, type DownloadRun } from "../useReports"

/** Los tres reportes que el robot baja a diario; es lo que relanza «Descargar lo que falta». */
const DAILY_SECTIONS = ["early", "pink_circle_hearts", "pink_circle_vip_plus"]
const SECTION_NAME: Record<string, string> = { early: "Ventas Mensuales Personales", pink_circle_hearts: "Corazones de Círculo Rosa", pink_circle_vip_plus: "Círculo Rosa VIP Plus" }

const pad = (n: number) => String(n).padStart(2, "0")
const sameDay = (iso: string | null) => !!iso && new Date(iso).toDateString() === new Date().toDateString()
const whenOf = (iso: string | null) => {
    if (!iso) return "—"
    const d = new Date(iso)
    const hour = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    return sameDay(iso) ? hour : `${d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · ${hour}`
}

const resultOf = (run: DownloadRun): { label: string, tone: string } => {
    if (run.status === "queued") return { label: "En cola", tone: "plain" }
    if (run.status === "running") return { label: "Corriendo…", tone: "plain" }
    if (run.status === "failed") return { label: "Falló", tone: "bad" }
    if (run.status === "rejected") return { label: "Rechazada", tone: "warn" }
    const result = run.result
    if (!result) return { label: "Terminó", tone: "ok" }
    return { label: `${result.uploaded} de ${result.total}`, tone: result.failed > 0 ? "warn" : "ok" }
}

/**
 * La vista de HOY del monitor: qué bajó el robot, a qué hora y qué hubo que reintentar. Lo del mes
 * (resumen, estado por clienta, rechazos) sigue en sus pestañas.
 */
const TodayTab = ({ onOpenOptions }: { onOpenOptions: () => void }) => {
    const { dailyReports: reports } = useDailyReports()
    const { runs } = useDownloadRuns()
    const { dispatch, dispatching } = useDispatchDownloadRun()

    const list = Array.isArray(reports) ? reports : []
    const rejected = list.reduce((sum, report) => sum + (report.rejected ?? 0), 0)
    const missing = list.reduce((sum, report) => sum + Math.max(report.usual - report.loaded, 0), 0)

    const downloadMissing = () => {
        toast("¿Bajar ahora lo que falta de los reportes diarios?", {
            description: "Sólo se descarga lo que todavía no está cargado, para todas las clientas. Lo que ya bajó no se toca.",
            action: {
                label: "Sí, bajar",
                onClick: async () => {
                    try {
                        await dispatch({ sections: DAILY_SECTIONS })
                        toast.success("Descarga encolada: aparece abajo en las corridas")
                    } catch {
                        toast.error("No se pudo encolar la descarga")
                    }
                },
            },
        })
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
                <button type="button" onClick={onOpenOptions} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/60 px-4 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground">
                    <SlidersHorizontalIcon className="size-4" /> Elegir qué y para quién
                </button>
                <button type="button" disabled={dispatching} onClick={downloadMissing} className="shell-grad inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(108,71,255,.9)] transition hover:brightness-105 disabled:opacity-60">
                    <CloudDownloadIcon className="size-4" /> {missing > 0 ? `Descargar lo que falta (${missing})` : "Descargar ahora"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {list.map(report => {
                    const done = report.loaded >= report.usual
                    return (
                        <div key={report.section_key} className="shell-glass rounded-[20px] p-4">
                            <small className="block truncate text-[10.5px] font-bold tracking-[.08em] text-muted-foreground uppercase">{report.name}</small>
                            <b className={cn("mt-2 block text-[28px] leading-none font-extrabold tracking-[-.03em] tabular-nums", !done && "text-amber-500")}>{report.loaded}<span className="text-[15px] font-bold text-muted-foreground"> / {report.usual}</span></b>
                            <p className="mt-1.5 text-[11.5px] text-muted-foreground">{report.last_at ? `${whenOf(report.last_at)} · ` : ""}{done ? "completo" : `faltan ${report.usual - report.loaded}`}</p>
                        </div>
                    )
                })}
                <div className="shell-glass rounded-[20px] p-4">
                    <small className="block text-[10.5px] font-bold tracking-[.08em] text-muted-foreground uppercase">Rechazadas hoy</small>
                    <b className={cn("mt-2 block text-[28px] leading-none font-extrabold tracking-[-.03em] tabular-nums", rejected > 0 && "text-rose-500")}>{rejected}</b>
                    <p className="mt-1.5 text-[11.5px] text-muted-foreground">{rejected ? "archivos que no correspondían" : "ningún archivo de otra red"}</p>
                </div>
            </div>

            <section className="shell-glass overflow-hidden rounded-3xl">
                <div className="flex items-center justify-between gap-3 px-5 pt-[18px] pb-2">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Corridas del robot</h2>
                    <span className="text-[11.5px] text-muted-foreground">las últimas 20</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-border text-[10.5px] font-bold tracking-[.08em] text-muted-foreground uppercase">
                                <th className="px-5 py-2.5 font-bold">Hora</th><th className="px-3 py-2.5 font-bold">Qué pidió</th><th className="px-3 py-2.5 font-bold">Cuentas</th><th className="px-3 py-2.5 font-bold">Resultado</th><th className="px-5 py-2.5 font-bold">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {runs.map(run => {
                                const result = resultOf(run)
                                const retry = !!run.clients?.length
                                const names = (run.sections ?? []).map(section => SECTION_NAME[section] ?? section).join(" + ") || run.process
                                return (
                                    <tr key={run.run_id} className="transition-colors hover:bg-foreground/[.03]">
                                        <td className="px-5 py-3 font-semibold whitespace-nowrap text-muted-foreground tabular-nums">{whenOf(run.queued_at ?? run.finished_at)}</td>
                                        <td className="px-3 py-3"><b className="font-bold">{retry ? "Reintento · " : ""}{names}</b>{run.reset && <span className="ml-2 text-[11px] text-muted-foreground">re-descarga forzada</span>}</td>
                                        <td className="px-3 py-3 text-muted-foreground">{retry ? (run.clients!.length <= 3 ? run.clients!.join(", ") : `${run.clients!.length} cuentas`) : "todas las clientas"}</td>
                                        <td className="px-3 py-3"><span className={cn("pulse-tag", result.tone)}>{result.label}</span></td>
                                        <td className="px-5 py-3 text-[12px] text-muted-foreground">{run.error ?? (run.result ? [run.result.failed ? `${run.result.failed} sin bajar` : "", run.result.skipped ? `${run.result.skipped} ya estaban` : ""].filter(Boolean).join(" · ") || "sin pendientes" : "")}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {!runs.length && <p className="px-5 py-9 text-center text-[13px] text-muted-foreground">Todavía no hay corridas registradas.</p>}
            </section>
        </div>
    )
}

export default TodayTab
