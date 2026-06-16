import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { MonthlySummary } from "@/interfaces/finanzas"
import useFinanzasStore, { periodKey } from "@/store/finanzas"
import { formatMoney, MONTH_LABELS } from "@/utils/finanzas"
import { HeroTile, KpiTile, Panel } from "./ui"

const SEED_YEAR = 2026
const CYAN = "#16B8C4"
const VIOLET = "#5B47E0"
const MONTHS_ORDER = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]
const axis = { tick: { fill: "#94A3B8", fontSize: 11 }, axisLine: false, tickLine: false }
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const BalanceTab = ({ summary, period }: { summary: MonthlySummary[]; period: { year: number; month: string } }) => {
    const { expenses } = useFinanzasStore()
    const isSeedYear = period.year === SEED_YEAR

    const rows = MONTHS_ORDER.map((m) => {
        const ingreso = isSeedYear ? summary.find((s) => s.month === m)?.["Ingreso"] ?? 0 : 0
        const gasto = (expenses[periodKey(period.year, m)] ?? []).reduce((acc, e) => acc + e.amount, 0)
        return { mes: (MONTH_LABELS[m] ?? m).slice(0, 3), month: m, Ingreso: ingreso, Gasto: gasto, Balance: ingreso - gasto }
    })
    const withData = rows.filter((r) => r.Ingreso > 0 || r.Gasto > 0)

    const ingresoAnual = rows.reduce((a, r) => a + r.Ingreso, 0)
    const gastoAnual = rows.reduce((a, r) => a + r.Gasto, 0)
    const balanceAnual = ingresoAnual - gastoAnual

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <HeroTile label={`Balance anual ${period.year}`} value={formatMoney(balanceAnual)} sub={balanceAnual < 0 ? "El año va en pérdida" : "El año va en positivo"} />
                <KpiTile label="Ingreso anual" value={formatMoney(ingresoAnual)} accent="cyan" sub="Suma de ingresos del año" />
                <KpiTile label="Gasto anual" value={formatMoney(gastoAnual)} accent="violet" sub="Suma de gastos del año" />
            </div>

            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Ingresos vs. Gastos {period.year}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Barras = ingreso (cyan) y gasto (gris). La línea morada es el balance del mes.</p>
                </div>
                <div className="p-4 pt-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
                            <XAxis dataKey="mes" {...axis} />
                            <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Ingreso" fill={CYAN} radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                            <Bar dataKey="Gasto" fill="#E5E9F2" radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                            <Line type="monotone" dataKey="Balance" stroke={VIOLET} strokeWidth={3} dot={{ r: 3, fill: VIOLET }} isAnimationActive={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            <Panel className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-slate-400">
                                <th className="px-5 py-3 font-semibold">Mes</th>
                                <th className="px-5 py-3 text-right font-semibold">Ingreso</th>
                                <th className="px-5 py-3 text-right font-semibold">Gasto</th>
                                <th className="px-5 py-3 text-right font-semibold">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withData.length ? withData.map((r) => (
                                <tr key={r.month} className="border-b border-slate-50">
                                    <td className="px-5 py-3 font-medium text-slate-700">{MONTH_LABELS[r.month] ?? r.month}</td>
                                    <td className="px-5 py-3 text-right text-slate-600">{formatMoney(r.Ingreso)}</td>
                                    <td className="px-5 py-3 text-right text-slate-600">{formatMoney(r.Gasto)}</td>
                                    <td className={`px-5 py-3 text-right font-semibold ${r.Balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatMoney(r.Balance)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400">Sin datos para {period.year}.</td></tr>
                            )}
                        </tbody>
                        {withData.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-slate-100 bg-slate-50/50 text-sm font-bold">
                                    <td className="px-5 py-3 text-slate-700">Total {period.year}</td>
                                    <td className="px-5 py-3 text-right text-slate-800">{formatMoney(ingresoAnual)}</td>
                                    <td className="px-5 py-3 text-right text-slate-800">{formatMoney(gastoAnual)}</td>
                                    <td className={`px-5 py-3 text-right ${balanceAnual < 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatMoney(balanceAnual)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Panel>
        </div>
    )
}

export default BalanceTab
