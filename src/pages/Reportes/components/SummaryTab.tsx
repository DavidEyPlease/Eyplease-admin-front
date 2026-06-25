import { Panel, HeroTile, KpiTile } from "./ui"
import { useReportMetrics, useReportGrid, SectionStat } from "../useReports"
import { SECTION_CATALOG, periodLabel, fmtDateTime } from "../reports.constants"

const TypeRow = ({ name, st, color }: { name: string; st: SectionStat; color: string }) => {
    const { Y, done } = st
    const pct = Y ? Math.min(100, Math.round((done / Y) * 100)) : 0
    const complete = Y > 0 && done >= Y
    const barColor = complete ? "#10b981" : done === 0 ? "#e2e8f0" : color
    const numClass = complete ? "text-emerald-600" : done === 0 ? "text-slate-400" : "text-slate-700"
    return (
        <div className="flex items-center gap-3">
            <div className="w-36 shrink-0 truncate text-sm text-slate-600" title={name}>{name}</div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <div className={`w-16 shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums ${numClass}`}>
                {Y === 0 ? "—" : `${done} / ${Y}`}
            </div>
            <div className="w-20 shrink-0 text-left">
                {Y === 0 ? (
                    <span className="text-[11px] text-slate-300">sin clientes</span>
                ) : complete ? (
                    <span className="text-[11px] font-semibold text-emerald-500">✓ completo</span>
                ) : done === 0 ? (
                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-400">pendiente</span>
                ) : (
                    <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">faltan {Y - done}</span>
                )}
            </div>
        </div>
    )
}

const Group = ({ title, color, keys, stats }: { title: string; color: string; keys: typeof SECTION_CATALOG; stats: Record<string, SectionStat> }) => (
    <div>
        <div className="mb-2">
            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: color }}>{title}</span>
        </div>
        <div className="space-y-2">
            {keys.map((s) => <TypeRow key={s.key} name={s.name} st={stats[s.key]} color={color} />)}
        </div>
    </div>
)

const SummaryTab = ({ period }: { period: string }) => {
    const { metrics } = useReportMetrics()
    const { stats, daily, loading } = useReportGrid(period)

    const totFailed = SECTION_CATALOG.reduce((a, s) => a + (stats[s.key]?.failed ?? 0), 0)
    const pct = metrics ? Math.round((metrics.upload_percentage || 0) * 10) / 10 : null

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
                        <p className="mt-0.5 text-xs text-slate-400">Cargados / esperados según el plan de cada cliente. Verde = completo.</p>
                    </div>
                    <div className="space-y-5 px-5 py-4">
                        {loading ? (
                            <div className="py-10 text-center text-sm text-slate-400">Cargando…</div>
                        ) : (
                            <>
                                <Group title="Unidad" color="#5B47E0" keys={SECTION_CATALOG.filter((s) => s.nl === "unit")} stats={stats} />
                                <Group title="Nacional" color="#0E9E97" keys={SECTION_CATALOG.filter((s) => s.nl === "national")} stats={stats} />
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
        </div>
    )
}

export default SummaryTab
