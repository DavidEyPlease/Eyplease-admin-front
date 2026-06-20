import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import Spinner from "@/components/common/Spinner"
import { formatMoney, MONTH_LABELS } from "@/utils/finance"
import { useFinanceBalance } from "../useFinanceBalance"
import { HeroTile, KpiTile, Panel } from "./ui"

const CYAN = "#16B8C4"
const VIOLET = "#5B47E0"
const axis = { tick: { fill: "#94A3B8", fontSize: 11 }, axisLine: false, tickLine: false }
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const BalanceTab = ({ period }: { period: { year: number; month: number } }) => {
    const { balance, loading } = useFinanceBalance(period.year)

    if (loading || !balance) {
        return <Panel className="p-12"><Spinner size="md" color="primary" /></Panel>
    }

    const rows = balance.months.map((m) => ({
        label: (MONTH_LABELS[m.month - 1] ?? String(m.month)).slice(0, 3),
        monthNumber: m.month,
        income: m.income,
        expense: m.expense,
        balance: m.balance,
    }))
    const withData = rows.filter((r) => r.income > 0 || r.expense > 0)

    const yearIncome = balance.year_income
    const yearExpense = balance.year_expense
    const yearBalance = balance.year_balance

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <HeroTile label={`Balance anual ${period.year}`} value={formatMoney(yearBalance)} sub={yearBalance < 0 ? "El año va en pérdida" : "El año va en positivo"} />
                <KpiTile label="Ingreso anual" value={formatMoney(yearIncome)} accent="cyan" sub="Suma de ingresos del año" />
                <KpiTile label="Gasto anual" value={formatMoney(yearExpense)} accent="violet" sub="Suma de gastos del año" />
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
                            <XAxis dataKey="label" {...axis} />
                            <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="income" name="Ingreso" fill={CYAN} radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                            <Bar dataKey="expense" name="Gasto" fill="#E5E9F2" radius={[5, 5, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                            <Line type="monotone" dataKey="balance" name="Balance" stroke={VIOLET} strokeWidth={3} dot={{ r: 3, fill: VIOLET }} isAnimationActive={false} />
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
                                <tr key={r.monthNumber} className="border-b border-slate-50">
                                    <td className="px-5 py-3 font-medium text-slate-700">{MONTH_LABELS[r.monthNumber - 1]}</td>
                                    <td className="px-5 py-3 text-right text-slate-600">{formatMoney(r.income)}</td>
                                    <td className="px-5 py-3 text-right text-slate-600">{formatMoney(r.expense)}</td>
                                    <td className={`px-5 py-3 text-right font-semibold ${r.balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatMoney(r.balance)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400">Sin datos para {period.year}.</td></tr>
                            )}
                        </tbody>
                        {withData.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-slate-100 bg-slate-50/50 text-sm font-bold">
                                    <td className="px-5 py-3 text-slate-700">Total {period.year}</td>
                                    <td className="px-5 py-3 text-right text-slate-800">{formatMoney(yearIncome)}</td>
                                    <td className="px-5 py-3 text-right text-slate-800">{formatMoney(yearExpense)}</td>
                                    <td className={`px-5 py-3 text-right ${yearBalance < 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatMoney(yearBalance)}</td>
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
