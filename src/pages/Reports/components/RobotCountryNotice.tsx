import { CloudDownloadIcon, DatabaseZapIcon, InfoIcon } from "lucide-react"
import { toast } from "sonner"

import { COUNTRY_OPTIONS, MESES, fmtDateTime, type ReportsCountry } from "../reports.constants"
import { useDispatchDownloadRun, useDispatchImport, useDownloadRuns, type DownloadRun } from "../useReports"

/**
 * Lo que el robot baja en Colombia cada mes: sólo los reportes que se comprobaron en su portal. Ventas
 * en puntos e Iniciación (iguales a los de México) y Ventas en PESOS, de donde sale su Círculo Rosa.
 * Los Cumpleaños van aparte, en la corrida de boletines de fin de mes.
 */
const COLOMBIA_REPORTS = ["unity_monthly_personal_sales", "initiators", "pink_circle_constancy"]

/** Una corrida de Colombia se reconoce por el reporte en pesos, que en México no existe. */
const isColombiaRun = (run: DownloadRun) => !!run.sections?.includes("pink_circle_constancy")

const RUN_LABEL: Record<DownloadRun["status"], string> = {
    queued: "En cola",
    running: "Bajando",
    completed: "Terminó",
    failed: "Falló",
    rejected: "Rechazada",
}

/**
 * El robot fuera de México. En Colombia entra a su portal los días 1 a 5 de cada mes, después de
 * México, y aquí se puede bajar e importar a mano sin esperar al día 1. Otro país: todavía nada.
 */
const RobotCountryNotice = ({ country }: { country: ReportsCountry }) => {
    const name = COUNTRY_OPTIONS.find(option => option.value === country)?.label ?? country
    const { runs } = useDownloadRuns()
    const { dispatch: download, dispatching } = useDispatchDownloadRun()
    const { dispatch: runImport, dispatching: importing } = useDispatchImport()

    if (country !== "COL") {
        return (
            <section className="shell-glass flex items-start gap-3 rounded-3xl p-5">
                <InfoIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="min-w-0">
                    <h2 className="text-[15px] font-extrabold tracking-tight">El robot todavía no entra al portal de {name}</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        Los reportes de {name} se suben a mano: en «Resumen del mes», abre el reporte que falta y súbelo desde ahí.
                    </p>
                </div>
            </section>
        )
    }

    // Los reportes de cierre son del mes anterior: es la carpeta donde el robot los deja.
    const now = new Date()
    const closed = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const closedLabel = `${MESES[closed.getMonth()]} ${closed.getFullYear()}`
    const last = (Array.isArray(runs) ? runs : []).find(isColombiaRun)

    const downloadNow = () => {
        toast(`¿Bajar ahora los reportes de ${name}?`, {
            description: "El robot entra al portal de Colombia y vuelve a bajar Ventas en puntos, Iniciación y Ventas en pesos.",
            action: {
                label: "Sí, bajar",
                onClick: async () => {
                    try {
                        await download({ sections: COLOMBIA_REPORTS, reset: true, country: "COL" })
                        toast.success("Descarga encolada: su avance sale aquí abajo")
                    } catch {
                        toast.error("No se pudo encolar la descarga")
                    }
                },
            },
        })
    }

    const importNow = () => {
        toast(`¿Importar los reportes de ${name} de ${closedLabel}?`, {
            description: "Sólo los que todavía no están cargados. Hazlo cuando la descarga diga «Terminó».",
            action: {
                label: "Sí, importar",
                onClick: async () => {
                    try {
                        await runImport({ type: "unit_newsletter", month: closed.getMonth() + 1, sections: COLOMBIA_REPORTS, only_new: true })
                        toast.success("Importación encolada: en unos minutos se ven en el resumen")
                    } catch {
                        toast.error("No se pudo encolar la importación")
                    }
                },
            },
        })
    }

    return (
        <section className="shell-glass rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 max-w-[640px] items-start gap-3">
                    <InfoIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                        <h2 className="text-[15px] font-extrabold tracking-tight">El robot entra al portal de {name} del 1 al 5 de cada mes</h2>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                            Después de México baja sus <b className="text-foreground">Ventas en puntos</b>, su <b className="text-foreground">Iniciación</b> y
                            sus <b className="text-foreground">Ventas en pesos</b> (de ahí sale su Círculo Rosa). Luego se importan con el botón de siempre.
                            Y los 2 últimos días de cada mes baja sus <b className="text-foreground">Cumpleaños</b> del mes siguiente, igual que en México.
                            Los demás reportes de México no se le piden a Colombia mientras allá no se usen.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" disabled={dispatching} onClick={downloadNow} className="shell-grad inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(108,71,255,.9)] transition hover:brightness-105 disabled:opacity-60">
                        <CloudDownloadIcon className="size-4" /> Bajar ahora
                    </button>
                    <button type="button" disabled={importing} onClick={importNow} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/60 px-4 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60">
                        <DatabaseZapIcon className="size-4" /> Importar {closedLabel}
                    </button>
                </div>
            </div>

            {last && (
                <p className="mt-4 border-t border-border pt-3 text-[12.5px] text-muted-foreground">
                    Última descarga de {name}: <b className="text-foreground">{RUN_LABEL[last.status]}</b>
                    {last.result ? ` · ${last.result.uploaded} bajados, ${last.result.failed} con error` : ""}
                    {last.error ? ` · ${last.error}` : ""}
                    {` · ${fmtDateTime(last.finished_at ?? last.queued_at)}`}
                </p>
            )}
        </section>
    )
}

export default RobotCountryNotice
