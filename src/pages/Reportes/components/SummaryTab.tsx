import { useMemo, useState } from "react"

import { Panel, HeroTile, KpiTile } from "./ui"
import { useReportMetrics, useReportGrid, SectionStat, GridRow } from "../useReports"
import { SECTION_CATALOG, SectionDef, periodLabel, fmtDateTime } from "../reports.constants"

const TypeRow = ({ section, st, color, onVer }: { section: SectionDef; st: SectionStat; color: string; onVer: (s: SectionDef) => void }) => {
    const { Y, done } = st
    const pct = Y ? Math.min(100, Math.round((done / Y) * 100)) : 0
    const complete = Y > 0 && done >= Y
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
                {Y === 0 ? "—" : `${done} / ${Y}`}
            </div>
            <div className="w-24 shrink-0 text-left">
                {Y === 0 ? (
                    <span className="text-[11px] text-slate-300">sin clientes</span>
                ) : complete ? (
                    <span className="text-[11px] font-semibold text-emerald-500">✓ completo</span>
                ) : (
                    <button
                        onClick={() => onVer(section)}
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition hover:brightness-95 ${done === 0 ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}
                        title="Ver quiénes faltan"
                    >
                        {done === 0 ? "pendiente" : `faltan ${Y - done}`} {eye}
                    </button>
                )}
            </div>
        </div>
    )
}

const Group = ({ title, color, keys, stats, onVer }: { title: string; color: string; keys: SectionDef[]; stats: Record<string, SectionStat>; onVer: (s: SectionDef) => void }) => (
    <div>
        <div className="mb-2">
            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: color }}>{title}</span>
        </div>
        <div className="space-y-2">
            {keys.map((s) => <TypeRow key={s.key} section={s} st={stats[s.key]} color={color} onVer={onVer} />)}
        </div>
    </div>
)

const SummaryTab = ({ period }: { period: string }) => {
    const { metrics } = useReportMetrics()
    const { rows, stats, daily, loading } = useReportGrid(period)
    const [verSection, setVerSection] = useState<SectionDef | null>(null)

    const totFailed = SECTION_CATALOG.reduce((a, s) => a + (stats[s.key]?.failed ?? 0), 0)
    const pct = metrics ? Math.round((metrics.upload_percentage || 0) * 10) / 10 : null

    // Clientes que NO tienen cargado el reporte seleccionado (falta o rechazado).
    const missingList = useMemo(() => {
        if (!verSection) return [] as { name: string; account: string; status: string }[]
        return rows
            .filter((r: GridRow) => r.cells[verSection.key] === "missing" || r.cells[verSection.key] === "failed")
            .map((r) => ({ name: r.name, account: r.account, status: r.cells[verSection.key] }))
            .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "failed" ? -1 : 1))
    }, [verSection, rows])

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <HeroTile label="Avance del mes" value={pct === null ? "—" : `${pct}%`} sub="Reportes cargados correctamente" />
                <KpiTile label="Clientes activos" value={metrics?.active_clients ?? "—"} sub={`${metrics?.inactive ?? 0} inactivos`} accent="violet" />
                <KpiTile label="Faltantes" value={metrics?.missing_reports ?? "—"} sub="según la plataforma" accent="rose" />
                <KpiTile label="Rechazados" value={loading ? "…" : totFailed} sub={`subidas con error en ${periodLabel(period)}`} accent="rose" />
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
                                <Group title="Unidad" color="#5B47E0" keys={SECTION_CATALOG.filter((s) => s.nl === "unit")} stats={stats} onVer={setVerSection} />
                                <Group title="Nacional" color="#0E9E97" keys={SECTION_CATALOG.filter((s) => s.nl === "national")} stats={stats} onVer={setVerSection} />
                            </>
                        )}
                    </div>
                </Panel>

                <Panel>
                    <div className="px-5 pt-5">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Tempraneras <span className="ml-1 rounded-full bg-[#EEEBFC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5B47E0]">Diario</span>
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">Ventas personales del día (ordenantes). Revísalo a diario.</p>
                    </div>
                    <div className="px-5 py-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight text-[#5B47E0]">{loading ? "…" : daily.done}</span>
                            <span className="text-xs text-slate-400">subidas en {periodLabel(period)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className="text-slate-500">Rechazadas <b className={daily.failed ? "text-rose-600" : "text-slate-700"}>{daily.failed}</b></span>
                            <span className="text-slate-500">Última <b className="text-slate-600">{fmtDateTime(daily.last)}</b></span>
                        </div>
                        <div className="mt-2.5 text-[11px] leading-snug text-slate-400">
                            El "esperado del día" sale del log del scraper (pendiente API).
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
                            {missingList.length ? (
                                <ul className="divide-y divide-slate-50">
                                    {missingList.map((m, i) => (
                                        <li key={i} className="flex items-center justify-between gap-3 py-2">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-slate-700">{m.name}</div>
                                                <div className="text-[11px] text-slate-400">{m.account}</div>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.status === "failed" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
                                                {m.status === "failed" ? "Rechazado" : "Falta"}
                                            </span>
                                        </li>
                                    ))}
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
        </div>
    )
}

export default SummaryTab
