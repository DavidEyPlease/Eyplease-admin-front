import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { OverviewRevenuePeriod } from "@/interfaces/overview"
import { money, monthName } from "../overview.utils"

interface Props {
    current: OverviewRevenuePeriod
    previous: OverviewRevenuePeriod
}

/**
 * Lo primero que se ve: cuánto entró y cuánto falta por entrar este mes.
 *
 * El mes en curso siempre va "por detrás" del anterior porque todavía no
 * termina, así que la comparación se muestra como dato, no como alarma.
 */
const MoneyBlock = ({ current, previous }: Props) => {
    const billed = current.collected + current.outstanding
    const pct = billed > 0 ? Math.round((current.collected / billed) * 100) : 0
    const diff = current.collected - previous.collected
    const mes = monthName(current.period)

    return (
        <div className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Cobrado en {mes}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {money(current.collected)}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                    {diff >= 0 ? (
                        <ArrowUpRightIcon className="size-3.5 text-emerald-600" />
                    ) : (
                        <ArrowDownRightIcon className="size-3.5 text-slate-400" />
                    )}
                    {money(Math.abs(diff))} {diff >= 0 ? "más" : "menos"} que {monthName(previous.period)}
                    <span className="text-slate-400">({money(previous.collected)})</span>
                </p>
            </div>

            <div className="sm:border-l sm:border-slate-100 sm:pl-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Falta por cobrar de {mes}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-red-600 sm:text-4xl">
                    {money(current.outstanding)}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                    <strong className="text-slate-900">{current.overdue_count}</strong> vencidos
                    {current.pending_count > 0 && <> · {current.pending_count} por vencer</>}
                    {current.in_review_count > 0 && <> · {current.in_review_count} por validar</>}
                </p>
            </div>

            <div className="sm:col-span-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                        {current.paid_count} de {current.total_count} clientas al corriente
                    </span>
                    <span className="font-semibold text-slate-900">{pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full transition-[width]"
                        style={{ width: `${pct}%`, backgroundImage: "linear-gradient(90deg,#5B47E0,#5DD9D2)" }}
                    />
                </div>
            </div>
        </div>
    )
}

export default MoneyBlock
