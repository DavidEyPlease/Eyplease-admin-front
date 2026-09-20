import { useMemo } from "react"
import { toast } from "sonner"
import { CheckIcon, ExternalLinkIcon, XIcon } from "lucide-react"

import { FinanceClient } from "@/interfaces/finance"
import { cn } from "@/lib/utils"
import { MONTH_LABELS, formatMoney, periodLabel, periodRemaining } from "@/utils/finance"
import useFinanceBalance from "../useFinanceBalance"
import { useFinanceClientsPage, useReviewReceipt } from "../useFinanceClients"
import { useFinanceSummary } from "../useFinanceSummary"
import "@/pages/Hoy/hoy.css"

/** Las colas caben enteras en una carga: la cartera son ~100 clientas */
const QUEUE = 200

/** Las cifras grandes van sin centavos: en un titular hacen ruido. Las de cada fila sí van exactas. */
const whole = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`

const periodsWith = (client: FinanceClient, statuses: string[]) => Object.keys(client.payments).filter(period => statuses.includes(client.payments[period]?.status ?? "")).sort()
const owed = (client: FinanceClient, periods: string[]) => periods.reduce((sum, period) => sum + periodRemaining(client.payments[period], client.fixedPayment ?? 0), 0)

const Queue = ({ title, count, tone, empty, children }: { title: string, count: number, tone: string, empty: string, children: React.ReactNode }) => (
    <section className="shell-glass flex min-h-[220px] flex-col overflow-hidden rounded-3xl">
        <header className="flex items-center justify-between gap-2 px-5 pt-[18px] pb-2.5">
            <h2 className="text-[15px] font-extrabold tracking-tight">{title}</h2>
            <span className={cn("pulse-tag", count > 0 ? tone : "ok")}>{count > 0 ? count : "al día"}</span>
        </header>
        {count > 0 ? <div className="max-h-[360px] divide-y divide-border overflow-y-auto">{children}</div> : <p className="m-auto px-6 pb-8 text-center text-[13px] text-muted-foreground">{empty}</p>}
    </section>
)

interface Props {
    period: { year: number, month: number }
    onOpenClient: (account: string) => void
    onGoTo: (tab: "cobranza" | "balance" | "proyeccion") => void
}

/**
 * «La caja del mes»: Finanzas abre en lo que hay que HACER, no en un tablero de cifras. El mes en
 * una sola barra y, debajo, las colas de trabajo: comprobantes por validar (se aprueban aquí
 * mismo), a quién cobrarle y quién cobra esta semana. El año va en una tira al final. Todo sale de
 * los mismos endpoints que ya usan Resumen, Cobranza y Balance.
 */
const MonthTab = ({ period, onOpenClient, onGoTo }: Props) => {
    const { summary } = useFinanceSummary(period.year, period.month)
    const { balance } = useFinanceBalance(period.year)
    const review = useFinanceClientsPage({ year: period.year, page: 1, perPage: QUEUE, collectionStatus: "in_review" })
    const overdue = useFinanceClientsPage({ year: period.year, page: 1, perPage: QUEUE, collectionStatus: "overdue" })
    const pending = useFinanceClientsPage({ year: period.year, page: 1, perPage: QUEUE, collectionStatus: "pending" })
    const { reviewReceipt, reviewing } = useReviewReceipt()

    const monthLabel = MONTH_LABELS[period.month - 1] ?? ""
    const month = summary?.month_summary
    const collected = month?.income ?? 0
    const late = month?.overdue_total ?? 0
    /* `pending_total` es TODO lo que falta del mes (incluye lo vencido): lo que aún no vence es la resta */
    const upcoming = Math.max((month?.pending_total ?? 0) - late, 0)
    const expected = collected + upcoming + late
    const pct = (value: number) => expected > 0 ? (value / expected) * 100 : 0

    const receipts = useMemo(() => review.clients.flatMap(client => periodsWith(client, ["in_review"]).map(p => ({ client, period: p, payment: client.payments[p] }))), [review.clients])
    const debtors = useMemo(() => overdue.clients.map(client => { const periods = periodsWith(client, ["overdue", "partial"]); return { client, periods, amount: owed(client, periods) } }).filter(row => row.periods.length).sort((a, b) => b.amount - a.amount), [overdue.clients])

    const today = new Date().getDate()
    const thisWeek = useMemo(() => {
        const current = `${period.year}-${String(period.month).padStart(2, "0")}`
        return pending.clients
            .filter(client => client.payments[current]?.status === "pending" && client.paymentDay != null && client.paymentDay >= today && client.paymentDay <= today + 7)
            .map(client => ({ client, amount: periodRemaining(client.payments[current], client.fixedPayment ?? 0) }))
            .sort((a, b) => (a.client.paymentDay ?? 0) - (b.client.paymentDay ?? 0))
    }, [pending.clients, period, today])

    const resolve = async (account: string, name: string, p: string, decision: "approve" | "reject") => {
        try {
            await reviewReceipt({ account, period: p, decision })
            toast.success(decision === "approve" ? `Comprobante de ${periodLabel(p)} validado · ${name}` : `Comprobante de ${periodLabel(p)} rechazado`)
        } catch {
            toast.error("No se pudo guardar la decisión")
        }
    }

    const months = (balance?.months ?? []).filter(item => item.month <= 12)
    const peak = Math.max(...months.map(item => Math.max(item.income, item.expense)), 1)

    return (
        <div className="grid min-w-0 grid-cols-1 gap-[18px]">
            {/* El mes en una barra */}
            <section className="shell-glass rounded-3xl p-[22px]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <small className="text-[11px] font-bold tracking-[.08em] text-muted-foreground uppercase">La caja de {monthLabel.toLowerCase()}</small>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
                            <b className="text-[38px] leading-none font-extrabold tracking-[-.04em] tabular-nums">{whole(collected)}</b>
                            <span className="text-[15px] font-semibold text-muted-foreground">de {whole(expected)} esperados</span>
                        </div>
                    </div>
                    <div className="text-right text-[12.5px] text-muted-foreground">
                        <b className="block text-[22px] leading-none font-extrabold text-foreground tabular-nums">{Math.round(pct(collected))} %</b>cobrado
                    </div>
                </div>

                <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-foreground/[.07]">
                    <i className="block h-full bg-gradient-to-r from-emerald-500 to-[#2CD4D9] transition-[width] duration-700" style={{ width: `${pct(collected)}%` }} />
                    <i className="block h-full bg-foreground/20 transition-[width] duration-700" style={{ width: `${pct(upcoming)}%` }} />
                    <i className="block h-full bg-rose-500 transition-[width] duration-700" style={{ width: `${pct(late)}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" />Cobrado <b className="text-foreground tabular-nums">{whole(collected)}</b></span>
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-foreground/30" />Por cobrar, sin vencer <b className="text-foreground tabular-nums">{whole(upcoming)}</b></span>
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-rose-500" />Vencido <b className="text-rose-600 tabular-nums dark:text-rose-400">{whole(late)}</b>{month ? ` · ${month.overdue_clients} clientas` : ""}</span>
                    {summary && <span className="ml-auto">Ticket promedio <b className="text-foreground tabular-nums">{whole(month?.avg_ticket ?? 0)}</b> · {summary.active_clients} activas</span>}
                </div>
            </section>

            {/* Lo que hay que hacer */}
            <div className="grid gap-[18px] lg:grid-cols-2">
                <Queue title="Comprobantes por validar" count={receipts.length} tone="plain" empty="No hay comprobantes esperando. Cuando una clienta suba el suyo, aparece aquí.">
                    {receipts.map(({ client, period: p, payment }) => (
                        <div key={`${client.id}-${p}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                            <button type="button" onClick={() => onOpenClient(client.id)} className="min-w-0 flex-1 cursor-pointer text-left">
                                <b className="block truncate text-[13.5px] font-bold hover:underline">{client.name}</b>
                                <small className="block text-[11.5px] text-muted-foreground">{periodLabel(p)} · {formatMoney(payment?.amount ?? client.fixedPayment ?? 0)}{payment?.referenceNumber ? ` · ref. ${payment.referenceNumber}` : ""}</small>
                            </button>
                            {payment?.receiptUrl && <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold text-primary hover:bg-primary/10"><ExternalLinkIcon className="size-3.5" />Ver</a>}
                            <button type="button" disabled={reviewing} onClick={() => resolve(client.id, client.name, p, "reject")} title="Rechazar" className="grid size-8 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"><XIcon className="size-4" /></button>
                            <button type="button" disabled={reviewing} onClick={() => resolve(client.id, client.name, p, "approve")} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-500/12 px-3 text-[12.5px] font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"><CheckIcon className="size-4" />Aprobar</button>
                        </div>
                    ))}
                </Queue>

                <Queue title="A quién cobrarle" count={debtors.length} tone="bad" empty="Nadie debe. Así da gusto.">
                    {debtors.map(({ client, periods, amount }) => (
                        <button key={client.id} type="button" onClick={() => onOpenClient(client.id)} className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-foreground/[.035]">
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13.5px] font-bold">{client.name}</b>
                                <small className="block truncate text-[11.5px] text-muted-foreground">{client.plan ?? "Sin plan"} · debe {periods.map(p => periodLabel(p).toLowerCase()).join(", ")}</small>
                            </span>
                            {periods.length > 1 && <span className="pulse-tag bad">{periods.length} meses</span>}
                            <b className="text-[14.5px] font-extrabold text-rose-600 tabular-nums dark:text-rose-400">{formatMoney(amount)}</b>
                        </button>
                    ))}
                </Queue>
            </div>

            <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <Queue title="Cobran esta semana" count={thisWeek.length} tone="plain" empty="Nadie tiene día de pago en los próximos siete días.">
                    {thisWeek.map(({ client, amount }) => (
                        <button key={client.id} type="button" onClick={() => onOpenClient(client.id)} className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-foreground/[.035]">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-[13px] font-extrabold text-primary tabular-nums dark:bg-[#6C47FF]/20 dark:text-[#C4B8FF]">{client.paymentDay}</span>
                            <span className="min-w-0 flex-1"><b className="block truncate text-[13px] font-bold">{client.name}</b><small className="text-[11.5px] text-muted-foreground">{client.billingType === "stripe" ? "se cobra sola con tarjeta" : "paga por transferencia"}</small></span>
                            <b className="text-[13.5px] font-extrabold tabular-nums">{formatMoney(amount)}</b>
                        </button>
                    ))}
                </Queue>

                {/* El año en una tira */}
                <section className="shell-glass rounded-3xl p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-extrabold tracking-tight">El año {period.year}</h2>
                            <p className="text-[12px] text-muted-foreground">Lo que entró contra lo que se gastó, mes a mes.</p>
                        </div>
                        {balance && (
                            <div className="flex gap-5 text-right text-[11.5px] text-muted-foreground">
                                <span>Entró<b className="block text-[15px] font-extrabold text-foreground tabular-nums">{whole(balance.year_income)}</b></span>
                                <span>Se gastó<b className="block text-[15px] font-extrabold text-foreground tabular-nums">{whole(balance.year_expense)}</b></span>
                                <span>Quedó<b className={cn("block text-[15px] font-extrabold tabular-nums", balance.year_balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{whole(balance.year_balance)}</b></span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex h-[120px] items-end gap-1.5">
                        {months.map(item => (
                            <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${MONTH_LABELS[item.month - 1]}: entró ${formatMoney(item.income)}, se gastó ${formatMoney(item.expense)}`}>
                                <div className="flex h-full w-full items-end justify-center gap-[3px]">
                                    <i className={cn("block w-[42%] max-w-[18px] rounded-t-[5px]", item.month === period.month ? "bg-gradient-to-t from-[#6C47FF] to-[#2CD4D9]" : "bg-[#6C47FF]/45")} style={{ height: `${Math.max((item.income / peak) * 100, 2)}%` }} />
                                    <i className="block w-[42%] max-w-[18px] rounded-t-[5px] bg-foreground/20" style={{ height: `${Math.max((item.expense / peak) * 100, 2)}%` }} />
                                </div>
                                <small className={cn("text-[10px] font-semibold", item.month === period.month ? "text-foreground" : "text-muted-foreground")}>{(MONTH_LABELS[item.month - 1] ?? "").slice(0, 3)}</small>
                            </div>
                        ))}
                        {!months.length && <p className="m-auto text-[12.5px] text-muted-foreground">Sin movimientos registrados este año.</p>}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold">
                        <button type="button" onClick={() => onGoTo("balance")} className="cursor-pointer text-primary hover:underline">Ver el balance</button>
                        <button type="button" onClick={() => onGoTo("proyeccion")} className="cursor-pointer text-primary hover:underline">Ver la proyección</button>
                        <button type="button" onClick={() => onGoTo("cobranza")} className="cursor-pointer text-primary hover:underline">Toda la cobranza</button>
                    </div>
                </section>
            </div>

            {summary && summary.plan_distribution.length > 0 && (
                <section className="shell-glass rounded-3xl p-5">
                    <h2 className="text-[15px] font-extrabold tracking-tight">De dónde viene el dinero</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {summary.plan_distribution.map(plan => {
                            const total = summary.plan_distribution.reduce((sum, item) => sum + item.revenue, 0) || 1
                            return (
                                <div key={plan.plan}>
                                    <div className="flex items-baseline justify-between gap-2 text-[12.5px]"><b className="truncate font-bold">{plan.plan}</b><span className="text-muted-foreground tabular-nums">{plan.count} clientas · {whole(plan.revenue)}</span></div>
                                    <span className="pulse-bar mt-1.5 block"><i style={{ width: `${(plan.revenue / total) * 100}%`, background: "linear-gradient(90deg,#6C47FF,#2CD4D9)" }} /></span>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
    )
}

export default MonthTab
