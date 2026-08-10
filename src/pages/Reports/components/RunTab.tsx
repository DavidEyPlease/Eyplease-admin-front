import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Panel, BtnPrimary } from "./ui"
import { useDispatchDownloadRun, useDispatchImport, useDownloadRuns, type DownloadRun } from "../useReports"
import { MESES } from "../reports.constants"
import Dropdown from "@/components/common/Inputs/Dropdown"
import useAuthStore from "@/store/auth"
import { NewsletterTypes } from "@/interfaces/common"
import { Checkbox } from "@/uishadcn/ui/checkbox"
import { Switch } from "@/uishadcn/ui/switch"
import { Separator } from "@/uishadcn/ui/separator"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/uishadcn/ui/field"

const EARLY_SECTION = { label: "Tempraneras", value: "early" }

// Estilo del chip de estado de cada corrida de descarga.
const RUN_STATUS_UI: Record<DownloadRun["status"], { label: string; className: string }> = {
    queued: { label: "En cola", className: "bg-slate-100 text-slate-500" },
    running: { label: "Corriendo", className: "bg-indigo-50 text-indigo-600" },
    completed: { label: "Completado", className: "bg-emerald-50 text-emerald-600" },
    failed: { label: "Fallido", className: "bg-rose-50 text-rose-600" },
    rejected: { label: "Rechazado", className: "bg-amber-50 text-amber-600" },
}

const RunTab = () => {
    const { dispatch, dispatching } = useDispatchImport()
    const { dispatch: dispatchDownload, dispatching: downloading } = useDispatchDownloadRun()
    const { runs } = useDownloadRuns()
    const { utilData } = useAuthStore((s) => s)

    const [type, setType] = useState<string>("")
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [sections, setSections] = useState<string[]>([])
    const [onlyNew, setOnlyNew] = useState(false)

    // Estado del panel de descarga (independiente del de importación).
    const [downloadType, setDownloadType] = useState<string>("")
    const [downloadSections, setDownloadSections] = useState<string[]>([])
    const [downloadReset, setDownloadReset] = useState(false)
    const [account, setAccount] = useState("")

    // Boletines y sus secciones importables — dinámico desde utilData (nada hardcodeado).
    // Tempraneras (early) solo aplica al boletín de Unidad.
    const newsletters = useMemo(
        () =>
            utilData.newsletters.map((n) => ({
                code: n.code,
                name: n.name,
                sections: [
                    ...n.sections.filter((s) => s.canImported).map((s) => ({ label: s.name, value: s.sectionKey })),
                    ...(n.code === NewsletterTypes.UNITY ? [EARLY_SECTION] : []),
                ],
            })),
        [utilData.newsletters]
    )
    const boletinOptions = newsletters.map((n) => ({ label: n.name, value: n.code }))
    const currentSections = newsletters.find((n) => n.code === type)?.sections ?? []

    // Solo mes anterior / actual / siguiente (lo que acepta el endpoint).
    const monthOptions = useMemo(() => {
        const now = new Date()
        return [-1, 0, 1].map((off) => {
            const d = new Date(now.getFullYear(), now.getMonth() + off, 1)
            const tag = off === 0 ? " (actual)" : off === -1 ? " (anterior)" : " (siguiente)"
            return { value: String(d.getMonth() + 1), label: `${MESES[d.getMonth()]} ${d.getFullYear()}${tag}` }
        })
    }, [])

    const toggleIn = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
        (value: string, checked: boolean) =>
            setter((prev) => (checked ? [...prev, value] : prev.filter((s) => s !== value)))
    const toggleSection = toggleIn(setSections)
    const toggleDownloadSection = toggleIn(setDownloadSections)

    const runDispatch = () => {
        if (!type) {
            toast.error("Selecciona un boletín")
            return
        }
        const name = newsletters.find((n) => n.code === type)?.name ?? "boletín"
        const scope = sections.length ? `${sections.length} sección(es)` : "todas las secciones"
        toast(`¿Procesar importación de ${name} (${MESES[month - 1]})?`, {
            description: `Se importarán ${scope}${onlyNew ? ", solo registros nuevos" : ""}.`,
            action: {
                label: "Sí, procesar",
                onClick: async () => {
                    try {
                        await dispatch({ type, month, sections, only_new: onlyNew })
                        toast.success("Importación encolada correctamente")
                    } catch {
                        toast.error("No se pudo encolar la importación")
                    }
                },
            },
        })
    }

    // Dispara la descarga en el worker. Sin secciones marcadas = todas las del boletín.
    const runScraper = (scope: "all" | "one") => {
        if (!downloadType) {
            toast.error("Selecciona un boletín")
            return
        }
        if (scope === "one" && !account.trim()) {
            toast.error("Escribe la cuenta del cliente")
            return
        }

        const available = newsletters.find((n) => n.code === downloadType)?.sections ?? []
        const sectionKeys = downloadSections.length ? downloadSections : available.map((s) => s.value)
        const target = scope === "one" ? `la cuenta ${account.trim()}` : "TODOS los clientes"

        toast(`¿Correr la descarga de ${sectionKeys.length} sección(es) para ${target}?`, {
            description: downloadReset
                ? "Con re-descarga forzada: se bajarán de nuevo aunque el reporte ya esté cargado y el archivo exista en S3."
                : "Solo se descargará lo que falte (reportes no cargados).",
            action: {
                label: "Sí, correr",
                onClick: async () => {
                    try {
                        await dispatchDownload({
                            sections: sectionKeys,
                            ...(scope === "one" ? { clients: [account.trim()] } : {}),
                            ...(downloadReset ? { reset: true } : {}),
                        })
                        toast.success("Descarga encolada correctamente")
                    } catch {
                        toast.error("No se pudo encolar la descarga")
                    }
                },
            },
        })
    }

    return (
        <div className="grid items-start gap-5 lg:grid-cols-2">
            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Procesar reportes hacia boletines</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Re-ejecuta la importación de los reportes ya descargados (S3) hacia la plataforma
                    </p>
                </div>
                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <Dropdown
                        label="Boletín"
                        placeholder="Selecciona un boletín"
                        value={type}
                        items={boletinOptions}
                        onChange={(v) => { setType(v); setSections([]); setOnlyNew(false) }}
                    />
                    <Dropdown
                        label="Mes"
                        placeholder="Selecciona un mes"
                        value={String(month)}
                        items={monthOptions}
                        onChange={(v) => setMonth(Number(v))}
                    />
                </div>

                {type && (
                    <div className="flex flex-col gap-4 px-5 pb-2">
                        <FieldSet>
                            <FieldDescription>
                                Solo se importarán las secciones seleccionadas; si no seleccionas ninguna se importarán todas las secciones del boletín.
                            </FieldDescription>
                            <FieldGroup className="gap-3">
                                {currentSections.map((s) => (
                                    <Field orientation="horizontal" key={s.value}>
                                        <Checkbox
                                            id={s.value}
                                            checked={sections.includes(s.value)}
                                            onCheckedChange={(checked) => toggleSection(s.value, checked === true)}
                                        />
                                        <FieldLabel htmlFor={s.value} className="font-normal">{s.label}</FieldLabel>
                                    </Field>
                                ))}
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldGroup className="w-full max-w-sm">
                            <FieldLabel htmlFor="only-new-import">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Importar solo nuevos</FieldTitle>
                                        <FieldDescription>
                                            Si activas esta opción, solo se importarán los registros que no existan en la base de datos. Los registros existentes no se actualizarán.
                                        </FieldDescription>
                                    </FieldContent>
                                    <Switch id="only-new-import" checked={onlyNew} onCheckedChange={setOnlyNew} />
                                </Field>
                            </FieldLabel>
                        </FieldGroup>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 px-5 pb-5 pt-2">
                    <BtnPrimary onClick={runDispatch} disabled={dispatching || !type}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {dispatching ? "Procesando…" : "Procesar importación"}
                    </BtnPrimary>
                    <span className="text-xs text-slate-400">Solo mes anterior / actual / siguiente.</span>
                </div>
            </Panel>

            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Correr descarga de reportes</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Descarga los reportes desde Mary Kay InTouch y los sube a S3 (worker bajo demanda)
                    </p>
                </div>
                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <Dropdown
                        label="Boletín"
                        placeholder="Selecciona un boletín"
                        value={downloadType}
                        items={boletinOptions}
                        onChange={(v) => { setDownloadType(v); setDownloadSections([]) }}
                    />
                </div>

                {downloadType && (
                    <div className="flex flex-col gap-4 px-5 pb-2">
                        <FieldSet>
                            <FieldDescription>
                                Solo se descargarán las secciones seleccionadas; si no seleccionas ninguna se descargarán todas las secciones del boletín.
                            </FieldDescription>
                            <FieldGroup className="gap-3">
                                {(newsletters.find((n) => n.code === downloadType)?.sections ?? []).map((s) => (
                                    <Field orientation="horizontal" key={`download-${s.value}`}>
                                        <Checkbox
                                            id={`download-${s.value}`}
                                            checked={downloadSections.includes(s.value)}
                                            onCheckedChange={(checked) => toggleDownloadSection(s.value, checked === true)}
                                        />
                                        <FieldLabel htmlFor={`download-${s.value}`} className="font-normal">{s.label}</FieldLabel>
                                    </Field>
                                ))}
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldGroup className="w-full max-w-sm">
                            <FieldLabel htmlFor="download-reset">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Forzar re-descarga (reset)</FieldTitle>
                                        <FieldDescription>
                                            Vuelve a descargar los archivos aunque el reporte ya esté cargado y el archivo exista en S3.
                                        </FieldDescription>
                                    </FieldContent>
                                    <Switch id="download-reset" checked={downloadReset} onCheckedChange={setDownloadReset} />
                                </Field>
                            </FieldLabel>
                        </FieldGroup>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 px-5 pb-4 pt-2">
                    <BtnPrimary onClick={() => runScraper("all")} disabled={downloading || !downloadType}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
                        {downloading ? "Encolando…" : "Correr para TODOS"}
                    </BtnPrimary>
                    <div className="flex items-center gap-2">
                        <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Cuenta del cliente (ej. WG3471)" className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#5B47E0]" />
                        <button onClick={() => runScraper("one")} disabled={downloading || !downloadType} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Correr para UNO</button>
                    </div>
                </div>

                {runs.length > 0 && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Últimas corridas</h4>
                        <ul className="mt-2 flex flex-col gap-2">
                            {runs.slice(0, 5).map((run) => (
                                <li key={run.run_id} className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${RUN_STATUS_UI[run.status]?.className ?? "bg-slate-100 text-slate-500"}`}>
                                        {RUN_STATUS_UI[run.status]?.label ?? run.status}
                                    </span>
                                    <span className="font-medium text-slate-600">{run.sections?.join(", ") || run.process}</span>
                                    {run.clients?.length ? <span>· {run.clients.join(", ")}</span> : null}
                                    {run.reset ? <span className="text-amber-600">· reset</span> : null}
                                    {run.result ? (
                                        <span>· {run.result.uploaded}/{run.result.total} subidos · {run.result.failed} fallidos · {run.result.skipped} saltados</span>
                                    ) : null}
                                    {run.error ? <span className="text-rose-500">· {run.error}</span> : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Panel>
        </div>
    )
}

export default RunTab
