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

import Spinner from "@/components/common/Spinner"
import { FinanceBalance, FinanceSummary } from "@/interfaces/finance"
import { breakEvenClients, formatMoney, formatPct, projectForward } from "@/utils/finance"
import { useFinanceSummary } from "../useFinanceSummary"
import { useFinanceBalance } from "../useFinanceBalance"
import { HeroTile, KpiTile, Panel, PanelHeader } from "./ui"

const VIOLET = "#5B47E0"
const SLATE = "#94A3B8"
const PROJECTION_MONTHS = 6
const axis = { tick: { fill: "#94A3B8", fontSize: 12 }, axisLine: false, tickLine: false }
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const ProjectionTab = ({ period }: { period: { year: number; month: number } }) => {
    const { summary, loading: loadingSummary } = useFinanceSummary(period.year, period.month)
    const { balance, loading: loadingBalance } = useFinanceBalance(period.year)

    if (loadingSummary || loadingBalance || !summary || !balance) {
        return <Panel className="p-12"><Spinner size="md" color="primary" /></Panel>
    }

    return <ProjectionView summary={summary} balance={balance} startMonth={period.month} year={period.year} />
}

interface ProjectionViewProps {
    summary: FinanceSummary
    balance: FinanceBalance
    startMonth: number
    year: number
}

const ProjectionView = ({ summary, balance, startMonth, year }: ProjectionViewProps) => {
    const currentClients = summary.active_clients
    // Expected monthly billing = sum of agreed amounts across active clients.
    const expectedMonthly = summary.plan_distribution.reduce((acc, p) => acc + p.revenue, 0)
    const expectedTicket = currentClients > 0 ? Math.round(expectedMonthly / currentClients) : 0
    // Revenue actually collected per client this month (0 until payments exist).
    const realizedArpu = currentClients > 0 ? Math.round(summary.month_summary.income / currentClients) : 0
    // Representative fixed monthly cost = average over months that have expenses.
    const monthsWithExpense = balance.months.filter((m) => m.expense > 0).length
    const monthlyExpenses = monthsWithExpense > 0 ? Math.round(balance.year_expense / monthsWithExpense) : 0

    const defaultTicket = realizedArpu || expectedTicket
    const [churn, setChurn] = useState(0) // in %, no history yet → starts at 0
    const [ticket, setTicket] = useState(defaultTicket)

    const projection = useMemo(
        () => projectForward({ startClients: currentClients, startMonth, monthlyChurn: churn / 100, avgTicket: ticket, monthlyExpenses, months: PROJECTION_MONTHS }),
        [currentClients, startMonth, churn, ticket, monthlyExpenses]
    )

    const beSim = breakEvenClients(monthlyExpenses, ticket)
    const beExpected = breakEvenClients(monthlyExpenses, expectedTicket)
    const gap = currentClients - beSim
    const month6 = projection[projection.length - 1]
    const planRevenue = summary.plan_distribution
    const maxPlanRev = Math.max(...planRevenue.map((p) => p.revenue), 1)
    const ticketMax = Math.max(expectedTicket + 200, 600)
    const hasCollections = realizedArpu > 0

    const resetSim = () => {
        setChurn(0)
        setTicket(defaultTicket)
    }
    const dirty = churn !== 0 || ticket !== defaultTicket

    return (
        <div className="grid gap-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <HeroTile
                    label="Punto de equilibrio"
                    value={`${beSim} clientes`}
                    sub={`Cobrando ${formatMoney(ticket)}/cliente para cubrir ${formatMoney(monthlyExpenses)}/mes`}
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
                    value={formatPct(churn)}
                    accent="amber"
                    icon={<TrendingDownIcon className="h-5 w-5" />}
                    sub="Sin histórico aún (se calculará con snapshots)"
                />
                <KpiTile
                    label={`Resultado proyectado (${PROJECTION_MONTHS}m)`}
                    value={formatMoney(month6?.result ?? 0)}
                    accent={(month6?.result ?? 0) < 0 ? "rose" : "emerald"}
                    icon={<TargetIcon className="h-5 w-5" />}
                    sub={`Con ${month6?.clients ?? 0} clientes en ${month6?.label}`}
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
                        <input type="range" min={300} max={ticketMax} step={10} value={ticket} onChange={(e) => setTicket(Number(e.target.value))}
                            className="w-full accent-[#5DD9D2]" />
                        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                            <span>{formatMoney(300)}</span>
                            <span>Ticket esperado: {formatMoney(expectedTicket)}</span>
                        </div>
                    </div>
                </div>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel>
                    <PanelHeader title={`Proyección a ${PROJECTION_MONTHS} meses`} desc="La distancia entre la línea morada (ingreso) y la gris (gasto fijo) es tu pérdida o ganancia mensual." />
                    <div className="p-4 pt-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={projection}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
                                <XAxis dataKey="label" {...axis} />
                                <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                <ReferenceLine y={monthlyExpenses} stroke={SLATE} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="income" name="Ingreso proyectado" stroke={VIOLET} strokeWidth={3} dot={{ r: 3, fill: VIOLET }} />
                                <Line type="monotone" dataKey="expense" name="Gasto fijo" stroke={SLATE} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <Panel className="p-5">
                    <h3 className="text-sm font-semibold text-slate-800">Ingreso por plan</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Cuánto aporta cada plan al ingreso mensual esperado.</p>
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
                        {hasCollections ? (
                            <>
                                Hoy cobras <b className="text-slate-800">{formatMoney(realizedArpu)}</b> por cliente (el acordado es {formatMoney(expectedTicket)} —
                                la diferencia es lo que pierdes por cobranza). A ese ingreso real necesitas <b className="text-slate-800">{breakEvenClients(monthlyExpenses, realizedArpu)} clientes</b> para
                                no perder y tienes {currentClients}. Si cobraras el total acordado, el equilibrio bajaría a {beExpected} clientes.
                            </>
                        ) : (
                            <>
                                Aún no hay pagos cobrados en {year}, así que el ingreso real por cliente es <b className="text-slate-800">{formatMoney(0)}</b>. Por
                                ticket esperado (<b className="text-slate-800">{formatMoney(expectedTicket)}</b>) tu equilibrio está en <b className="text-slate-800">{beExpected} clientes</b> y
                                tienes {currentClients}. Registra los pagos del periodo para ver el ingreso real.
                            </>
                        )}
                    </div>
                </Panel>
            </div>
        </div>
    )
}

export default ProjectionTab
