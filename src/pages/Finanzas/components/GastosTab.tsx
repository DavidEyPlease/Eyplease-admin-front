import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import useFinanzasStore, { periodKey } from "@/store/finanzas"
import { formatMoney, MONTH_LABELS } from "@/utils/finanzas"
import { HeroTile, KpiTile, Panel } from "./ui"

const TEAM_KEYS = ["Diseñadora", "Programador", "Administración"]
const MONTHS_ORDER = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]
const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 12px 28px -16px rgba(15,23,42,0.25)", fontSize: 12 },
}

const GastosTab = ({ period }: { period: { year: number; month: string } }) => {
    const { expenses, addExpense, removeExpense, updateExpense } = useFinanzasStore()
    const key = periodKey(period.year, period.month)
    const items = expenses[key] ?? []
    const monthLabel = MONTH_LABELS[period.month] ?? period.month

    const [newName, setNewName] = useState("")
    const [newAmount, setNewAmount] = useState("")

    const total = items.reduce((acc, e) => acc + e.amount, 0)
    const teamTotal = items.filter((e) => TEAM_KEYS.includes(e.name)).reduce((acc, e) => acc + e.amount, 0)
    const toolsTotal = total - teamTotal

    const history = MONTHS_ORDER.map((m) => ({
        mes: (MONTH_LABELS[m] ?? m).slice(0, 3),
        month: m,
        total: (expenses[periodKey(period.year, m)] ?? []).reduce((acc, e) => acc + e.amount, 0),
    }))

    const handleAdd = () => {
        const amount = Number(newAmount)
        if (!newName.trim() || !amount || amount <= 0) return
        addExpense(key, { name: newName.trim(), amount })
        setNewName("")
        setNewAmount("")
    }

    const inputCls = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <HeroTile label={`Gasto total · ${monthLabel} ${period.year}`} value={formatMoney(total)} sub="Suma del periodo" />
                <KpiTile label="Equipo" value={formatMoney(teamTotal)} accent="violet" sub="Diseñadora, programador, administración" />
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
                            <XAxis dataKey="mes" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip {...tooltipStyle} formatter={(v: number) => formatMoney(v)} cursor={{ fill: "#F8FAFC" }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={false}>
                                {history.map((h) => (
                                    <Cell key={h.month} fill={h.month === period.month ? "#5B47E0" : "#D9D6F4"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            <Panel className="p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Gastos de {monthLabel} {period.year}</h3>
                    <span className="text-sm font-semibold text-slate-800">{formatMoney(total)}</span>
                </div>

                {/* Lista editable */}
                <div className="mt-4 divide-y divide-slate-100">
                    {items.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Sin gastos en este periodo. Agrega el primero abajo.</p>}
                    {items.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 py-2">
                            <input
                                value={e.name}
                                onChange={(ev) => updateExpense(key, e.id, { name: ev.target.value })}
                                className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-700 outline-none hover:border-slate-200 focus:border-[#5B47E0] focus:bg-white"
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={e.amount}
                                    onChange={(ev) => updateExpense(key, e.id, { amount: Number(ev.target.value) || 0 })}
                                    className="w-24 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-right text-sm font-medium text-slate-800 outline-none hover:border-slate-200 focus:border-[#5B47E0] focus:bg-white"
                                />
                            </div>
                            <button onClick={() => removeExpense(key, e.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Agregar */}
                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50/70 p-3 sm:flex-row sm:items-center">
                    <input placeholder="Nombre del gasto" value={newName} onChange={(e) => setNewName(e.target.value)} className={`${inputCls} flex-1`} />
                    <input placeholder="Monto" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className={`${inputCls} sm:w-32`} />
                    <button onClick={handleAdd} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" }}>
                        <PlusIcon className="h-4 w-4" /> Agregar
                    </button>
                </div>
            </Panel>
        </div>
    )
}

export default GastosTab
