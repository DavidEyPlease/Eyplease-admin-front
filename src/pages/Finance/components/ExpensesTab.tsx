import { useMemo, useState } from "react"
import { PencilIcon, Trash2Icon } from "lucide-react"
import dayjs from "dayjs"
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

import Spinner from "@/components/common/Spinner"
import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import { ExpenseItem, EXPENSE_CATEGORY_LABELS } from "@/interfaces/finance"
import { formatMoney, MONTH_LABELS } from "@/utils/finance"
import useExpenses from "../useExpenses"
import { ExpenseFormValues, toExpensePayload } from "./expenseSchema"
import ExpenseForm from "./ExpenseForm"
import { HeroTile, KpiTile, Panel } from "./ui"

const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}
const categoryBadgeCls = "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
const rowActionCls = "flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition"

const ExpensesTab = ({ period }: { period: { year: number; month: number } }) => {
    const { expenses, loading, createExpense, updateExpense, deleteExpense, mutating } = useExpenses(period.year)
    const monthIndex = period.month - 1
    const monthLabel = MONTH_LABELS[monthIndex] ?? String(period.month)

    const [editing, setEditing] = useState<ExpenseItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const monthExpenses = useMemo(
        () =>
            expenses
                .filter((e) => dayjs(e.date).month() === monthIndex)
                .sort((a, b) => b.date.localeCompare(a.date)),
        [expenses, monthIndex]
    )

    const total = monthExpenses.reduce((acc, e) => acc + e.amount, 0)
    const teamTotal = monthExpenses.filter((e) => e.category === "team").reduce((acc, e) => acc + e.amount, 0)
    const toolsTotal = monthExpenses.filter((e) => e.category === "tools").reduce((acc, e) => acc + e.amount, 0)

    const history = useMemo(
        () =>
            MONTH_LABELS.map((label, idx) => ({
                label: label.slice(0, 3),
                monthIndex: idx,
                total: expenses
                    .filter((e) => dayjs(e.date).month() === idx)
                    .reduce((acc, e) => acc + e.amount, 0),
            })),
        [expenses]
    )

    // Default date for new expenses: today if it falls in the selected period, else day 1.
    const fallbackDate = useMemo(() => {
        const now = dayjs()
        return now.year() === period.year && now.month() === monthIndex
            ? now.toDate()
            : dayjs().year(period.year).month(monthIndex).date(1).toDate()
    }, [period.year, monthIndex])

    const handleSubmit = async (values: ExpenseFormValues) => {
        const payload = toExpensePayload(values)
        if (editing) {
            await updateExpense(editing.id, payload)
            toast.success("Gasto actualizado")
        } else {
            await createExpense(payload)
            toast.success("Gasto agregado")
        }
        setEditing(null)
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await deleteExpense(id)
            toast.success("Gasto eliminado")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <HeroTile label={`Gasto total · ${monthLabel} ${period.year}`} value={formatMoney(total)} sub="Suma del periodo" />
                <KpiTile label="Equipo" value={formatMoney(teamTotal)} accent="violet" sub="Gastos de equipo" />
                <KpiTile label="Herramientas" value={formatMoney(toolsTotal)} accent="cyan" sub="Software y servicios" />
            </div>

            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Historial mensual {period.year}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">Gasto total por mes. El mes seleccionado está resaltado.</p>
                </div>
                <div className="p-4 pt-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={false}>
                                {history.map((h) => (
                                    <Cell key={h.monthIndex} fill={h.monthIndex === monthIndex ? "#5B47E0" : "#D9D6F4"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            <Panel className="p-5">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">Gastos de {monthLabel} {period.year}</h3>
                    <p className="text-xs text-slate-400">{formatMoney(total)} en total</p>
                </div>

                <div className="mt-4">
                    <ExpenseForm
                        expense={editing}
                        fallbackDate={fallbackDate}
                        loading={mutating}
                        onSubmit={handleSubmit}
                        onCancelEdit={() => setEditing(null)}
                    />
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                    {loading && (
                        <div className="py-10">
                            <Spinner size="md" color="primary" />
                        </div>
                    )}

                    {!loading && monthExpenses.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">Sin gastos en este periodo. Agrega el primero.</p>
                    )}

                    {!loading &&
                        monthExpenses.map((expense) => (
                            <div key={expense.id} className="flex items-center gap-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-700">{expense.description}</p>
                                    <div className="mt-0.5 flex items-center gap-2">
                                        <span className="text-xs text-slate-400">{dayjs(expense.date).format("DD/MM")}</span>
                                        <span className={categoryBadgeCls}>{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-800">{formatMoney(expense.amount)}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(expense)}
                                        className={`${rowActionCls} hover:bg-slate-100 hover:text-slate-600`}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <AlertConfirmDelete
                                        title="¿Eliminar este gasto?"
                                        description="Esta acción no se puede deshacer."
                                        loading={mutating && deletingId === expense.id}
                                        onConfirm={() => handleDelete(expense.id)}
                                        trigger={
                                            <button type="button" className={`${rowActionCls} hover:bg-rose-50 hover:text-rose-500`}>
                                                <Trash2Icon className="h-4 w-4" />
                                            </button>
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </Panel>
        </div>
    )
}

export default ExpensesTab
