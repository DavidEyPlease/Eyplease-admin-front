import { useMemo, useState } from "react"
import { TargetIcon, TrendingDownIcon, UsersIcon } from "lucide-react"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { MonthlySummary } from "@/interfaces/finanzas"
import useFinanzasStore from "@/store/finanzas"
import {
    breakEvenClients,
    computeMonthlyChurn,
    formatMoney,
    formatPct,
    lastSummary,
    projectForward,
    revenueByPlan,
} from "@/utils/finanzas"
import { HeroTile, KpiTile, Panel, PanelHeader } from "./ui"

const VIOLET = "#5B47E0"
const SLATE = "#94A3B8"
const axis = { tick: { fill: "#94A3B8", fontSize: 12 }, axisLine: false, tickLine: false }
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const ProyeccionTab = ({ summary }: { summary: MonthlySummary[] }) => {
    const { clients } = useFinanzasStore()
    const last = lastSummary(summary)

    const baseChurn = useMemo(() => computeMonthlyChurn(summary), [summary])
    const listTicket = Math.round(last?.["Ticket promedio"] ?? 0)
    const expenses = Math.round(last?.["Gastos Totales"] ?? 0)
    const currentClients = last?.["Clientes totales"] ?? 0
    // Ingreso realmente cobrado por cliente (≠ ticket de lista por la cobranza pendiente).
    const realizedArpu = currentClients > 0 ? Math.round((last?.["Ingreso"] ?? 0) / currentClients) : 0

    const [churn, setChurn] = useState(Math.round(baseChurn * 1000) / 10) // en %
    const [ticket, setTicket] = useState(realizedArpu)

    const projection = useMemo(
        () => projectForward({ summary, monthlyChurn: churn / 100, avgTicket: ticket, monthlyExpenses: expenses, months: 6 }),
        [summary, churn, ticket, expenses]
    )

    const beNow = breakEvenClients(expenses, realizedArpu)
    const beSim = breakEvenClients(expenses, ticket)
    const gap = currentClients - beSim
    const month6 = projection[projection.length - 1]
    const planRevenue = useMemo(() => revenueByPlan(clients), [clients])
    const maxPlanRev = Math.max(...planRevenue.map((p) => p.revenue), 1)

    const resetSim = () => {
        setChurn(Math.round(baseChurn * 1000) / 10)
        setTicket(realizedArpu)
    }
    const dirty = churn !== Math.round(baseChurn * 1000) / 10 || ticket !== realizedArpu

    return (
        <div className="grid gap-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <HeroTile
                    label="Punto de equilibrio"
                    value={`${beSim} clientes`}
                    sub={`Cobrando ${formatMoney(ticket)}/cliente para cubrir ${formatMoney(expenses)}/mes`}
                    icon={<TargetIcon className="h-5 w-5" />}
                />
                <KpiTile
                    label="Clientes actuales"
                    value={currentClients}
                    accent={gap >= 0 ? "emerald" : "rose"}
                    icon={<UsersIcon className="h-5 w-5" />}
                    sub={gap >= 0 ? `${gap} por encima del equilibrio` : `Te faltan ${Math.abs(gap)} para equilibrar`}
                />
                <KpiTile
                    label="Churn mensual"
                    value={formatPct(baseChurn * 100)}
                    accent="amber"
                    icon={<TrendingDownIcon className="h-5 w-5" />}
                    sub="Promedio histórico ene–may"
                />
                <KpiTile
                    label="Resultado proyectado (6m)"
                    value={formatMoney(month6?.resultado ?? 0)}
                    accent={(month6?.resultado ?? 0) < 0 ? "rose" : "emerald"}
                    icon={<TargetIcon className="h-5 w-5" />}
                    sub={`Con ${month6?.clientes ?? 0} clientes en ${month6?.label}`}
                />
            </div>

            <Panel className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Simulador de escenarios</h3>
                        <p className="mt-0.5 text-xs text-slate-400">Mueve las palancas y mira el efecto en la proyección.</p>
                    </div>
                    {dirty && (
                        <button onClick={resetSim} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
                            Volver al actual
                        </button>
                    )}
                </div>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Churn mensual</span>
                            <span className="font-semibold text-[#5B47E0]">{churn.toFixed(1)}%</span>
                        </div>
                        <input type="range" min={0} max={15} step={0.5} value={churn} onChange={(e) => setChurn(Number(e.target.value))}
                            className="w-full accent-[#5B47E0]" />
                        <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>0%</span><span>15%</span></div>
                    </div>
                    <div>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Ingreso cobrado por cliente</span>
                            <span className="font-semibold text-[#0E9E97]">{formatMoney(ticket)}</span>
                        </div>
                        <input type="range" min={300} max={listTicket + 200} step={10} value={ticket} onChange={(e) => setTicket(Number(e.target.value))}
                            className="w-full accent-[#5DD9D2]" />
                        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                            <span>{formatMoney(300)}</span>
                            <span>Ticket de lista: {formatMoney(listTicket)}</span>
                        </div>
                    </div>
                </div>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel>
                    <PanelHeader title="Proyección a 6 meses" desc="La distancia entre la línea morada (ingreso) y la gris (gasto fijo) es tu pérdida o ganancia mensual." />
                    <div className="p-4 pt-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={projection}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
                                <XAxis dataKey="label" {...axis} />
                                <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                <ReferenceLine y={expenses} stroke={SLATE} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="ingreso" name="Ingreso proyectado" stroke={VIOLET} strokeWidth={3} dot={{ r: 3, fill: VIOLET }} />
                                <Line type="monotone" dataKey="gasto" name="Gasto fijo" stroke={SLATE} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <Panel className="p-5">
                    <h3 className="text-sm font-semibold text-slate-800">Ingreso por plan</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Cuánto aporta cada plan al ingreso mensual teórico.</p>
                    <div className="mt-4 space-y-3">
                        {planRevenue.map((p) => (
                            <div key={p.plan}>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{p.plan} <span className="text-slate-400">· {p.count}</span></span>
                                    <span className="font-medium text-slate-700">{formatMoney(p.revenue)}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full" style={{ width: `${(p.revenue / maxPlanRev) * 100}%`, backgroundImage: "linear-gradient(90deg,#5B47E0,#5DD9D2)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 rounded-xl bg-rose-50/60 p-3 text-xs text-slate-600">
                        Hoy cobras <b className="text-slate-800">{formatMoney(realizedArpu)}</b> por cliente (tu ticket de lista es {formatMoney(listTicket)} —
                        la diferencia es lo que pierdes por cobranza). A ese ingreso real necesitas <b className="text-slate-800">{beNow} clientes</b> para no perder
                        y tienes {currentClients}: <b className="text-rose-600">te faltan {Math.max(0, beNow - currentClients)}</b>. Si cobraras tu ticket completo,
                        el equilibrio bajaría a {breakEvenClients(expenses, listTicket)} clientes.
                    </div>
                </Panel>
            </div>
        </div>
    )
}

export default ProyeccionTab
