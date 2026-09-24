import { Trash2Icon } from "lucide-react"

import DeleteReportDialog from "./DeleteReportDialog"
import { useMemo, useState } from "react"

import { Panel } from "./ui"
import { useClientsStatus, ClientStatus } from "../useReports"
import { statusMeta, STATUS_LOADED, type ReportsCountry } from "../reports.constants"

const LEGEND = [
    { c: "bg-emerald-500", t: "Subido" },
    { c: "bg-sky-400", t: "Sin datos" },
    { c: "bg-rose-500", t: "Rechazado" },
    { c: "bg-amber-400", t: "Procesando" },
    { c: "bg-foreground/[.10]", t: "Falta" },
    { c: "border border-border bg-card", t: "No aplica a su plan" },
]

const GROUPS = [
    ["unit", "Unidad", "#5B47E0"],
    ["national", "Nacional", "#0E9E97"],
] as const

const MatrixTab = ({ period, country }: { period: string; country: ReportsCountry }) => {
    const { sections, clients, loading } = useClientsStatus(period, country)
    const [toDelete, setToDelete] = useState<ClientStatus | null>(null)
    const [plan, setPlan] = useState("all")
    const [q, setQ] = useState("")
    const [view, setView] = useState<"all" | "pending" | "complete">("all")

    // Planes disponibles = los que realmente tienen los clientes (sin hardcode).
    const boletinPlans = useMemo(() => [...new Set(clients.map((c) => c.plan))].sort((a, b) => a.localeCompare(b)), [clients])
    const planOptions = useMemo(
        () => [{ label: "Todos los planes", value: "all" }, ...boletinPlans.map((p) => ({ label: `Solo ${p.replace("Plan ", "")}`, value: p }))],
        [boletinPlans]
    )

    // Columnas: en "Todos" solo los reportes de Unidad comunes a TODOS los planes con clientes
    // (omite Aniversarios y las Nacional). Por plan, las de su derecho.
    const cols = useMemo(
        () =>
            sections.filter((s) =>
                plan === "all" ? s.group === "unit" && boletinPlans.every((p) => s.plans.includes(p)) : s.plans.includes(plan)
            ),
        [sections, plan, boletinPlans]
    )

    const visibleRows = useMemo(() => {
        const needle = q.trim().toLowerCase()
        const matchesView = (c: ClientStatus) => {
            if (view === "all") return true
            const entitled = cols.filter((s) => c.cells[s.section_key] !== undefined)
            // Solo "completed" cuenta como cargado: vacío, rechazado, procesando y falta son pendientes.
            const hasPending = entitled.some((s) => c.cells[s.section_key] !== STATUS_LOADED)
            return view === "pending" ? hasPending : entitled.length > 0 && !hasPending
        }
        return clients.filter(
            (c) =>
                (plan === "all" || c.plan === plan) &&
                (!needle || c.name.toLowerCase().includes(needle) || c.account.toLowerCase().includes(needle)) &&
                matchesView(c)
        )
    }, [clients, plan, q, view, cols])

    const groups = useMemo(
        () =>
            GROUPS.map(([group, label, color]) => ({ group, label, color, list: cols.filter((s) => s.group === group) })).filter((g) => g.list.length),
        [cols]
    )
    const divider = (i: number) => (i > 0 && cols[i - 1].group !== cols[i].group ? " border-l-2 border-border" : "")

    return (
        <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Estado por cliente y reporte</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Una celda por sección a la que su plan da derecho. Pasa el cursor para el detalle.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground outline-none focus:border-[#5B47E0]"
                    >
                        {planOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar cliente o cuenta…"
                        className="w-48 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[#5B47E0]"
                    />
                    <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
                        {([["all", "Todos"], ["pending", "Les falta"], ["complete", "Completos"]] as const).map(([v, label]) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`rounded-md px-2.5 py-1 transition ${view === v ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                                style={view === v ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-5 pt-3 text-[11px] text-muted-foreground">
                {LEGEND.map((l) => (
                    <span key={l.t} className="flex items-center gap-1"><i className={`inline-block h-3 w-3 rounded-sm ${l.c}`} /> {l.t}</span>
                ))}
            </div>

            <div className="overflow-auto px-5 py-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">Cargando…</div>
                ) : !visibleRows.length ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">Sin clientes para mostrar.</div>
                ) : (
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="sticky left-0 z-10 bg-card px-3 py-2 text-left align-bottom text-xs font-semibold text-muted-foreground">
                                    Cliente ({visibleRows.length})
                                </th>
                                {groups.map((g, gi) => (
                                    <th
                                        key={g.group}
                                        colSpan={g.list.length}
                                        className={`px-1.5 pb-1 pt-2 text-center${gi > 0 ? " border-l-2 border-border" : ""}`}
                                    >
                                        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: g.color }}>
                                            {g.label}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {cols.map((s, i) => (
                                    <th key={s.section_key} className={`px-1.5 py-2 text-center align-bottom${divider(i)}`}>
                                        <div className="mx-auto h-24 whitespace-nowrap text-[11px] font-medium text-muted-foreground" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} title={s.name}>
                                            {s.name}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((c) => (
                                <tr key={c.id} className="group/row border-t border-border hover:bg-foreground/[.04]">
                                    <td className="sticky left-0 z-10 bg-card px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-foreground">{c.name}</div>
                                                <div className="truncate text-[11px] text-muted-foreground">{c.account} · {c.plan.replace("Plan ", "")}</div>
                                            </div>
                                            {/* Borrar sus reportes del periodo. Pide confirmación
                                                con el detalle de lo que se va a llevar. */}
                                            <button
                                                type="button"
                                                onClick={() => setToDelete(c)}
                                                title={`Eliminar reportes de ${c.name} en ${period}`}
                                                aria-label={`Eliminar reportes de ${c.name}`}
                                                className="shrink-0 rounded-md p-1 text-muted-foreground/60 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover/row:opacity-100"
                                            >
                                                <Trash2Icon className="size-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    {cols.map((s, i) => {
                                        const m = statusMeta(c.cells[s.section_key] ?? "na")
                                        return (
                                            <td key={s.section_key} className={`px-1.5 py-1.5 text-center${divider(i)}`}>
                                                <span className={`mx-auto inline-block h-5 w-5 rounded ${m.dot}`} title={`${s.name}: ${m.label}`} />
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <DeleteReportDialog
                client={toDelete}
                period={period}
                onClose={() => setToDelete(null)}
            />
        </div>
        </Panel>
    )
}

export default MatrixTab
