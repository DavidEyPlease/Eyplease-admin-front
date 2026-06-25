import { useMemo, useState } from "react"

import { Panel } from "./ui"
import { useReportGrid } from "../useReports"
import { SECTION_CATALOG, BOLETIN_PLANS, statusMeta } from "../reports.constants"

const PLAN_OPTIONS = [
    { label: "Todos los planes", value: "all" },
    { label: "Solo Básico", value: "Plan Básico" },
    { label: "Solo Ejecutivo", value: "Plan Ejecutivo" },
    { label: "Solo Elite", value: "Plan Elite" },
    { label: "Solo Nacional", value: "Plan Nacional" },
]

const LEGEND = [
    { c: "bg-emerald-500", t: "Subido" },
    { c: "bg-rose-500", t: "Rechazado" },
    { c: "bg-amber-400", t: "Procesando" },
    { c: "bg-slate-200", t: "Falta" },
    { c: "border border-slate-200 bg-white", t: "No aplica a su plan" },
]

const MatrixTab = ({ period }: { period: string }) => {
    const { rows, loading } = useReportGrid(period)
    const [plan, setPlan] = useState("all")
    const [q, setQ] = useState("")
    const [onlyIssues, setOnlyIssues] = useState(false)

    // Columnas: en "Todos" solo los reportes de Unidad COMUNES a todos los planes
    // (omite Aniversarios y las Nacional). Por plan, las de su derecho.
    const sections = useMemo(
        () =>
            SECTION_CATALOG.filter((s) =>
                plan === "all" ? s.nl === "unit" && BOLETIN_PLANS.every((p) => s.plans.includes(p)) : s.plans.includes(plan)
            ),
        [plan]
    )

    const visibleRows = useMemo(() => {
        const needle = q.trim().toLowerCase()
        return rows.filter(
            (c) =>
                (plan === "all" || c.plan === plan) &&
                (!needle || c.name.toLowerCase().includes(needle) || c.account.toLowerCase().includes(needle)) &&
                (!onlyIssues || sections.some((s) => ["missing", "failed", "processing"].includes(c.cells[s.key])))
        )
    }, [rows, plan, q, onlyIssues, sections])

    const groups = useMemo(
        () =>
            ([
                ["unit", "Unidad", "#5B47E0"],
                ["national", "Nacional", "#0E9E97"],
            ] as const)
                .map(([nl, label, color]) => ({ nl, label, color, cols: sections.filter((s) => s.nl === nl) }))
                .filter((g) => g.cols.length),
        [sections]
    )
    const divider = (i: number) => (i > 0 && sections[i - 1].nl !== sections[i].nl ? " border-l-2 border-slate-300" : "")

    return (
        <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Estado por cliente y reporte</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Una celda por sección a la que su plan da derecho. Pasa el cursor para el detalle.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-[#5B47E0]"
                    >
                        {PLAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar cliente o cuenta…"
                        className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#5B47E0]"
                    />
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} className="accent-[#5B47E0]" /> Solo con pendientes
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-5 pt-3 text-[11px] text-slate-500">
                {LEGEND.map((l) => (
                    <span key={l.t} className="flex items-center gap-1"><i className={`inline-block h-3 w-3 rounded-sm ${l.c}`} /> {l.t}</span>
                ))}
            </div>

            <div className="overflow-auto px-5 py-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-slate-400">Cargando…</div>
                ) : !visibleRows.length ? (
                    <div className="py-10 text-center text-sm text-slate-400">Sin clientes para mostrar.</div>
                ) : (
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="sticky left-0 z-10 bg-white px-3 py-2 text-left align-bottom text-xs font-semibold text-slate-500">
                                    Cliente ({visibleRows.length})
                                </th>
                                {groups.map((g, gi) => (
                                    <th
                                        key={g.nl}
                                        colSpan={g.cols.length}
                                        className={`px-1.5 pb-1 pt-2 text-center${gi > 0 ? " border-l-2 border-slate-300" : ""}`}
                                    >
                                        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: g.color }}>
                                            {g.label}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {sections.map((s, i) => (
                                    <th key={s.key} className={`px-1.5 py-2 text-center align-bottom${divider(i)}`}>
                                        <div className="mx-auto h-24 whitespace-nowrap text-[11px] font-medium text-slate-500" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} title={s.name}>
                                            {s.name}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((c) => (
                                <tr key={c.uid} className="border-t border-slate-50 hover:bg-slate-50/60">
                                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5">
                                        <div className="text-sm font-medium text-slate-700">{c.name}</div>
                                        <div className="text-[11px] text-slate-400">{c.account} · {c.plan.replace("Plan ", "")}</div>
                                    </td>
                                    {sections.map((s, i) => {
                                        const m = statusMeta(c.cells[s.key])
                                        return (
                                            <td key={s.key} className={`px-1.5 py-1.5 text-center${divider(i)}`}>
                                                <span className={`mx-auto inline-block h-5 w-5 rounded ${m.dot}`} title={`${s.name}: ${m.label}`} />
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Panel>
    )
}

export default MatrixTab
