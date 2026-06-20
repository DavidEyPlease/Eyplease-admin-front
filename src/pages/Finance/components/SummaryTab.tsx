import { AlertTriangleIcon, CalendarIcon, ClockIcon, DollarSignIcon, TicketIcon, UsersIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import Spinner from "@/components/common/Spinner"
import { MONTH_LABELS, formatMoney } from "@/utils/finance"
import { useFinanceSummary } from "../useFinanceSummary"
import { HeroTile, KpiTile, Panel } from "./ui"

const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const SummaryTab = ({ period }: { period: { year: number; month: number } }) => {
    const { summary, loading } = useFinanceSummary(period.year, period.month)
    const monthLabel = MONTH_LABELS[period.month - 1] ?? String(period.month)

    if (loading || !summary) {
        return <Panel className="p-12"><Spinner size="md" color="primary" /></Panel>
    }

    const month = summary.month_summary
    const yearIncome = summary.months.reduce((acc, m) => acc + m.income, 0)
    const planDist = summary.plan_distribution
    const maxPlanCount = Math.max(...planDist.map((p) => p.count), 1)
    const incomeHistory = summary.months.map((m) => ({
        label: (MONTH_LABELS[m.month - 1] ?? String(m.month)).slice(0, 3),
        monthNumber: m.month,
        total: m.income,
    }))
    const hasIncome = month.income > 0

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            {!hasIncome && (
                <Panel className="p-4 text-sm text-slate-500">
                    Sin ingresos cobrados en <b className="text-slate-700">{monthLabel} {period.year}</b>. Cuando se registren los pagos del periodo aparecerán aquí.
                </Panel>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <HeroTile label={`Ingreso total ${period.year}`} value={formatMoney(yearIncome)} sub="Acumulado del año" icon={<DollarSignIcon className="h-5 w-5" />} />
                <KpiTile label={`Ingreso de ${monthLabel}`} value={formatMoney(month.income)} accent="cyan" icon={<CalendarIcon className="h-5 w-5" />} sub="Mes seleccionado" />
                <KpiTile label="Pendiente por pagar" value={formatMoney(month.pending_total)} accent="amber" icon={<ClockIcon className="h-5 w-5" />} sub={`Falta cobrar de ${monthLabel}`} />
                <KpiTile label="Retrasos totales" value={formatMoney(month.overdue_total)} accent="rose" icon={<AlertTriangleIcon className="h-5 w-5" />} sub="Deuda vencida del mes" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <KpiTile label="Ticket promedio" value={formatMoney(month.avg_ticket)} accent="violet" icon={<TicketIcon className="h-5 w-5" />} sub="Por pago cobrado" />
                <KpiTile label="Clientes con retraso" value={month.overdue_clients} accent="rose" icon={<AlertTriangleIcon className="h-5 w-5" />} sub={`De ${summary.active_clients} activos`} />
                <KpiTile label="Clientes activos" value={summary.active_clients} accent="violet" icon={<UsersIcon className="h-5 w-5" />} sub="En la cartera" />
            </div>

            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Historial mensual de ingresos {period.year}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Ingreso por mes. El mes seleccionado está resaltado.</p>
                </div>
                <div className="p-4 pt-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={incomeHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={false}>
                                {incomeHistory.map((h) => (
                                    <Cell key={h.monthNumber} fill={h.monthNumber === period.month ? "#16B8C4" : "#C7EFEB"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            <Panel className="p-5">
                <h3 className="text-sm font-semibold text-slate-800">Clientes por plan</h3>
                <p className="mt-0.5 text-xs text-slate-400">Distribución actual de la cartera.</p>
                <div className="mt-4 space-y-3.5">
                    {planDist.map((p) => (
                        <div key={p.plan}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="text-slate-600">{p.plan}</span>
                                <span className="font-semibold text-slate-800">{p.count}</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full" style={{ width: `${(p.count / maxPlanCount) * 100}%`, backgroundImage: "linear-gradient(90deg,#5B47E0,#5DD9D2)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    )
}

export default SummaryTab
