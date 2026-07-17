import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { Panel, HeroTile, KpiTile } from "./ui"
import { useReportSummary, useEarlyDaily, useSectionMissing, SummarySection, MissingClient } from "../useReports"
import { periodLabel, fmtDateTime } from "../reports.constants"
import useReportUpload from "@/hooks/useReportUpload"
import UploadErrorFeedback from "@/pages/NewsletterReports/components/UploadErrorFeedback"
import { queryKeys } from "@/utils/queryKeys"

const UNIT_COLOR = "#5B47E0"
const NATIONAL_COLOR = "#0E9E97"

const TypeRow = ({ section, color, onVer }: { section: SummarySection; color: string; onVer: (s: SummarySection) => void }) => {
    const { expected, done } = section
    const pct = expected ? Math.min(100, Math.round((done / expected) * 100)) : 0
    const complete = expected > 0 && done >= expected
    const barColor = complete ? "#10b981" : done === 0 ? "#e2e8f0" : color
    const numClass = complete ? "text-emerald-600" : done === 0 ? "text-slate-400" : "text-slate-700"

    const eye = (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    )

    return (
        <div className="flex items-center gap-3">
            <div className="w-36 shrink-0 truncate text-sm text-slate-600" title={section.name}>{section.name}</div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <div className={`w-16 shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums ${numClass}`}>
                {expected === 0 ? "—" : `${done} / ${expected}`}
            </div>
            <div className="w-24 shrink-0 text-left">
                {expected === 0 ? (
                    <span className="text-[11px] text-slate-300">sin clientes</span>
                ) : complete ? (
                    <span className="text-[11px] font-semibold text-emerald-500">✓ completo</span>
                ) : (
                    <button
                        onClick={() => onVer(section)}
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition hover:brightness-95 ${done === 0 ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}
                        title="Ver quiénes faltan"
                    >
                        {done === 0 ? "pendiente" : `faltan ${expected - done}`} {eye}
                    </button>
                )}
            </div>
        </div>
    )
}

const Group = ({ title, color, sections, onVer }: { title: string; color: string; sections: SummarySection[]; onVer: (s: SummarySection) => void }) => (
    <div>
        <div className="mb-2">
            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: color }}>{title}</span>
        </div>
        <div className="space-y-2">
            {sections.map((s) => <TypeRow key={s.section_key} section={s} color={color} onVer={onVer} />)}
        </div>
    </div>
)

const SummaryTab = ({ period }: { period: string }) => {
    const queryClient = useQueryClient()
    const { summary, loading } = useReportSummary(period)
    const { early, loading: loadingEarly } = useEarlyDaily()
    const [verSection, setVerSection] = useState<SummarySection | null>(null)
    const { data: missing, loading: loadingMissing } = useSectionMissing(period, verSection?.section_key ?? null)
    const { upload, uploadError, setUploadError } = useReportUpload()
    const [uploadingUserId, setUploadingUserId] = useState<string | null>(null)

    const missingList = missing?.clients ?? []

    // Carga el reporte de un cliente faltante desde el propio modal (mismo (sección, mes)
    // que el drill-down). Al terminar, refresca resumen y lista para que la fila desaparezca.
    const handleUpload = async (client: MissingClient, file: File) => {
        if (!missing) return
        setUploadingUserId(client.user_id)
        try {
            await upload({ userId: client.user_id, yearMonth: missing.year_month, sectionId: missing.section_id, file })
            queryClient.invalidateQueries({ queryKey: queryKeys.list("report-summary-missing", { period, sectionKey: missing.section_key }) })
            queryClient.invalidateQueries({ queryKey: queryKeys.generic("report-summary", { period }) })
        } catch {
            // Feedback (toast + modal de error) lo maneja useReportUpload.
        } finally {
            setUploadingUserId(null)
        }
    }

    const kpis = summary?.kpis
    const sections = summary?.sections ?? []
    const unitSections = sections.filter((s) => s.group === "unit")
    const nationalSections = sections.filter((s) => s.group === "national")

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <HeroTile label="Avance del mes" value={kpis ? `${kpis.avance_pct}%` : "—"} sub="Reportes cargados correctamente" />
                <KpiTile label="Clientes con boletín" value={loading ? "…" : kpis?.entitled_clients ?? "—"} sub="Básico, Ejecutivo, Elite y Nacional" accent="violet" />
                <KpiTile label="Faltantes" value={loading ? "…" : kpis?.missing ?? "—"} sub={`reportes sin cargar en ${periodLabel(period)}`} accent="rose" />
                <KpiTile label="Rechazados" value={loading ? "…" : kpis?.rejected ?? "—"} sub={`subidas con error en ${periodLabel(period)}`} accent="rose" />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Panel className="lg:col-span-2">
                    <div className="px-5 pt-5">
                        <h3 className="text-sm font-semibold text-slate-800">Reportes por tipo — ¿están todos cargados?</h3>
                        <p className="mt-0.5 text-xs text-slate-400">Cargados / esperados según el plan de cada cliente. Toca "faltan…" para ver quiénes.</p>
                    </div>
                    <div className="space-y-5 px-5 py-4">
                        {loading ? (
                            <div className="py-10 text-center text-sm text-slate-400">Cargando…</div>
                        ) : (
                            <>
                                {unitSections.length > 0 && <Group title="Unidad" color={UNIT_COLOR} sections={unitSections} onVer={setVerSection} />}
                                {nationalSections.length > 0 && <Group title="Nacional" color={NATIONAL_COLOR} sections={nationalSections} onVer={setVerSection} />}
                            </>
                        )}
                    </div>
                </Panel>

                <Panel>
                    <div className="px-5 pt-5">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Tempraneras <span className="ml-1 rounded-full bg-[#EEEBFC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5B47E0]">Diario</span>
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">Ventas personales del día (ordenantes). Se cargan cada mañana.</p>
                    </div>
                    <div className="px-5 py-4">
                        <div className="flex gap-8">
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-emerald-600">{loadingEarly ? "…" : early?.loaded ?? 0}</div>
                                <div className="mt-0.5 text-xs text-slate-400">Cargadas hoy</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-bold tracking-tight ${early?.rejected ? "text-rose-600" : "text-slate-400"}`}>{loadingEarly ? "…" : early?.rejected ?? 0}</div>
                                <div className="mt-0.5 text-xs text-slate-400">Rechazadas hoy</div>
                            </div>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-400">
                            Última carga <b className="font-medium text-slate-500">{fmtDateTime(early?.last_at ?? null)}</b>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* Modal: cuentas que faltan en el reporte seleccionado */}
            {verSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setVerSection(null)}>
                    <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Faltan: {verSection.name}</h3>
                                <p className="mt-0.5 text-xs text-slate-400">{missingList.length} cliente(s) sin cargar · {periodLabel(period)}</p>
                            </div>
                            <button onClick={() => setVerSection(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto px-5 py-3">
                            {loadingMissing ? (
                                <div className="py-8 text-center text-sm text-slate-400">Cargando…</div>
                            ) : missingList.length ? (
                                <ul className="divide-y divide-slate-50">
                                    {missingList.map((m) => {
                                        const uploading = uploadingUserId === m.user_id
                                        const busy = uploadingUserId !== null
                                        return (
                                            <li key={m.user_id} className="flex items-center justify-between gap-3 py-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium text-slate-700">{m.name}</div>
                                                    <div className="text-[11px] text-slate-400">{m.account}</div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.status === "failed" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
                                                        {m.status === "failed" ? "Rechazado" : "Falta"}
                                                    </span>
                                                    <label
                                                        className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white transition ${busy ? "cursor-not-allowed opacity-50" : "hover:brightness-95"}`}
                                                        style={{ backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" }}
                                                    >
                                                        {uploading ? "Subiendo…" : "Subir"}
                                                        <input
                                                            type="file"
                                                            accept=".xlsx,.xls"
                                                            className="hidden"
                                                            disabled={busy}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                e.target.value = ""
                                                                if (file) handleUpload(m, file)
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <div className="py-8 text-center text-sm text-slate-400">Nadie pendiente — todos lo cargaron.</div>
                            )}
                        </div>
                        <div className="border-t border-slate-100 px-5 py-3 text-right">
                            <button
                                onClick={() => navigator.clipboard?.writeText(missingList.map((m) => m.account).join(", "))}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Copiar cuentas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {uploadError && (
                <UploadErrorFeedback open={!!uploadError} onClose={() => setUploadError(null)} uploadError={uploadError} />
            )}
        </div>
    )
}

export default SummaryTab
