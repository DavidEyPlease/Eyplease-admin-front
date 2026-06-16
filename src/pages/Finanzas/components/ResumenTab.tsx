import { useMemo } from "react"
import { AlertTriangleIcon, CalendarIcon, ClockIcon, DollarSignIcon, TicketIcon, UsersIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { MonthlySummary } from "@/interfaces/finanzas"
import useFinanzasStore from "@/store/finanzas"
import { MONTH_LABELS, formatMoney, isOverdueStatus, revenueByPlan } from "@/utils/finanzas"
import { HeroTile, KpiTile, Panel } from "./ui"

const SEED_YEAR = 2026
const MONTHS_ORDER = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

interface Props {
    summary: MonthlySummary[]
    period: { year: number; month: string }
}

const ResumenTab = ({ summary, period }: Props) => {
    const { clients, months } = useFinanzasStore()
    const monthLabel = MONTH_LABELS[period.month] ?? period.month
    const isSeedYear = period.year === SEED_YEAR

    const sel = isSeedYear ? summary.find((s) => s.month === period.month) : undefined
    const hasData = !!sel
    const hasPayments = isSeedYear && months.includes(period.month)

    const ingresoTotal = isSeedYear ? summary.reduce((acc, s) => acc + (s["Ingreso"] ?? 0), 0) : 0
    const ingresoMes = sel?.["Ingreso"] ?? 0
    const ticket = sel?.["Ticket promedio"] ?? null
    const retraso = sel?.["Retraso"] ?? 0
    const clientesTotales = sel?.["Clientes totales"] ?? (isSeedYear ? clients.length : 0)

    const pendienteMes = hasPayments
        ? clients
            .filter((c) => (c.payments[period.month]?.status ?? "").toLowerCase() !== "realizado")
            .reduce((acc, c) => acc + (c.fixedPayment ?? 0), 0)
        : 0
    const conRetraso = hasPayments
        ? clients.filter((c) => isOverdueStatus(c.payments[period.month]?.status)).length
        : 0
    const activos = clients.filter((c) => (c.appStatus ?? "").toLowerCase() === "activo").length

    const planDist = useMemo(() => revenueByPlan(clients), [clients])
    const maxPlanCount = Math.max(...planDist.map((p) => p.count), 1)

    // Historial mensual de ingresos del año seleccionado.
    const incomeHistory = MONTHS_ORDER.map((m) => ({
        mes: (MONTH_LABELS[m] ?? m).slice(0, 3),
        month: m,
        total: isSeedYear ? (summary.find((s) => s.month === m)?.["Ingreso"] ?? 0) : 0,
    }))

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            {!hasData && (
                <Panel className="p-4 text-sm text-slate-500">
                    Sin datos de ingresos para <b className="text-slate-700">{monthLabel} {period.year}</b>. Cuando el bot reporte los pagos del periodo aparecerán aquí.
                </Panel>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <HeroTile label={`Ingreso total ${period.year}`} value={formatMoney(ingresoTotal)} sub="Acumulado del año" icon={<DollarSignIcon className="h-5 w-5" />} />
                <KpiTile label={`Ingreso de ${monthLabel}`} value={formatMoney(ingresoMes)} accent="cyan" icon={<CalendarIcon className="h-5 w-5" />} sub="Mes seleccionado" />
                <KpiTile label="Pendiente por pagar" value={formatMoney(pendienteMes)} accent="amber" icon={<ClockIcon className="h-5 w-5" />} sub={`Falta cobrar de ${monthLabel}`} />
                <KpiTile label="Retrasos totales" value={formatMoney(retraso)} accent="rose" icon={<AlertTriangleIcon className="h-5 w-5" />} sub="Deuda vencida acumulada" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <KpiTile label="Ticket promedio" value={formatMoney(ticket)} accent="violet" icon={<TicketIcon className="h-5 w-5" />} sub="Por cliente activo" />
                <KpiTile label="Clientes con retraso" value={conRetraso} accent="rose" icon={<AlertTriangleIcon className="h-5 w-5" />} sub={`De ${clients.length} en total`} />
                <KpiTile label="Clientes totales" value={clientesTotales} accent="violet" icon={<UsersIcon className="h-5 w-5" />} sub={`${activos} activos en la app`} />
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
                            <XAxis dataKey="mes" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={false}>
                                {incomeHistory.map((h) => (
                                    <Cell key={h.month} fill={h.month === period.month ? "#16B8C4" : "#C7EFEB"} />
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

export default ResumenTab
