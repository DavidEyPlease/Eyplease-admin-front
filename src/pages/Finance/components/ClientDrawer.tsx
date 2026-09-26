import { useState } from "react"
import { CalendarClockIcon, FileTextIcon, HandshakeIcon, PhoneIcon } from "lucide-react"
import { toast } from "sonner"

import SideModal from "@/components/common/SideModal"
import Spinner from "@/components/common/Spinner"
import DateInput from "@/components/common/Inputs/DateInput"
import { PaymentStatus } from "@/interfaces/finance"
import { dateOnly, formatDueDate, formatMoney, formatPaidAt, paidAtOn, periodLabel, periodsForYear, promiseState } from "@/utils/finance"
import { MarkPaymentInput, useFinanceClient, useMarkPayment, usePaymentPromise } from "../useFinanceClients"
import { StatusPill } from "./ui"

// "En revisión" only displays: it is set by the client's receipt upload and
// resolved from Cobranza (Validar / Rechazar), never picked by hand.
const STATUS_OPTIONS: { value: Exclude<PaymentStatus, null>; label: string; disabled?: boolean }[] = [
    { value: "paid", label: "Pagado" },
    { value: "overdue", label: "Retraso" },
    { value: "pending", label: "Pendiente" },
    { value: "in_review", label: "En revisión", disabled: true },
]
const APP_STATUS_LABELS: Record<string, string> = { active: "Activo", inactive: "Inactivo" }

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{children}</span>
    </div>
)

/** 'YYYY-MM-DD' de la API → Date del calendario (sin corrimiento de zona). */
const calendarDate = (ymd: string | null) => {
    if (!ymd) return undefined
    const [y, m, d] = ymd.split("-").map(Number)
    return new Date(y, m - 1, d)
}

const ClientDrawer = ({ clientId, year, onClose }: { clientId: string | null; year: number; onClose: () => void }) => {
    const { client, loading } = useFinanceClient(clientId, year)
    const { markPayment } = useMarkPayment()
    const { setPromise } = usePaymentPromise()
    const periods = periodsForYear(year)
    /* El día en que entró el dinero: decide en qué mes cuenta el ingreso. Por defecto hoy; si
       el pago fue otro día (un depósito del 30 que se marca el 2), se cambia aquí antes de marcar. */
    const [paidOn, setPaidOn] = useState<Date>(() => new Date())

    const onStatusChange = (period: string, status: string) => {
        if (!status || !client) return
        const paid = status === "paid"
        markPayment({
            account: client.id,
            period,
            status: status as MarkPaymentInput["status"],
            source: "manual",
            ...(paid ? { paid_at: paidAtOn(paidOn) } : {}),
        })
        if (paid) toast.success(`${periodLabel(period)} pagado el ${formatPaidAt(paidAtOn(paidOn))}`)
    }

    const onPromiseChange = async (date: Date | undefined) => {
        if (!client) return
        await setPromise(client.id, date ? dateOnly(date) : null)
        toast.success(date ? `Promesa de pago registrada para el ${formatDueDate(dateOnly(date))}` : "Promesa de pago quitada")
    }

    // Ajusta el monto de un periodo (ej. precios/promociones distintas en meses pasados).
    const onAmountChange = (period: string, amount: number | null) => {
        if (!client) return
        const status = (client.payments[period]?.status ?? "pending") as MarkPaymentInput["status"]
        markPayment({ account: client.id, period, status, amount: amount ?? 0, source: "manual" })
        toast.success(`Monto de ${periodLabel(period)} actualizado`)
    }

    return (
        <SideModal
            open={!!clientId}
            onOpenChange={(o) => !o && onClose()}
            title={client?.name ?? "Cliente"}
            description={client ? `${client.id} · ${client.plan ?? "Sin plan"}` : ""}
            size="md"
        >
            {loading && !client && (
                <div className="flex justify-center py-12">
                    <Spinner size="md" color="primary" />
                </div>
            )}
            {client && (
                <div className="space-y-6 pt-2">
                    {/* Summary */}
                    <section className="rounded-xl border border-border bg-card p-4">
                        <Row label="Estatus en la app">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs ${client.appStatus === "active" ? "bg-[#5B47E0]/10 text-[#5B47E0] dark:text-[#A99BFF]" : "bg-foreground/[.06] text-muted-foreground"}`}>
                                {APP_STATUS_LABELS[client.appStatus ?? ""] ?? "—"}
                            </span>
                        </Row>
                        <Row label="Pago fijo">{formatMoney(client.fixedPayment)}</Row>
                        <Row label="Día de pago">{client.paymentDay ?? "—"}</Row>
                        <Row label="Próximo cobro">
                            <span className="inline-flex items-center gap-1.5 text-[#5B47E0] dark:text-[#A99BFF]">
                                <CalendarClockIcon className="h-4 w-4" /> {formatDueDate(client.nextChargeDate)}
                            </span>
                        </Row>
                        <Row label="Promesa de pago">
                            <span className="inline-flex items-center gap-2">
                                {promiseState(client.promisedUntil) === "expired" && (
                                    <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">Vencida</span>
                                )}
                                <DateInput
                                    value={calendarDate(client.promisedUntil)}
                                    onChange={onPromiseChange}
                                    placeholder="Sin promesa"
                                    className="py-1.5 text-xs"
                                />
                            </span>
                        </Row>
                        <Row label="Saldo">
                            <span className={client.balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}>
                                {client.balance > 0 ? formatMoney(client.balance) : client.balance < 0 ? `+${formatMoney(-client.balance)}` : "—"}
                            </span>
                        </Row>
                    </section>

                    {promiseState(client.promisedUntil) === "active" && (
                        <p className="-mt-3 flex items-start gap-2 rounded-xl bg-[#5B47E0]/[.06] px-3 py-2 text-xs text-muted-foreground">
                            <HandshakeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B47E0] dark:text-[#A99BFF]" />
                            Prometió pagar el {formatDueDate(client.promisedUntil)}. Hasta ese día no se le bloquea ni le llegan recordatorios; lo que debe sigue pendiente y no cuenta como ingreso.
                        </p>
                    )}

                    {/* Phone */}
                    <section>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono (WhatsApp)</label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={client.phone ?? ""}
                                readOnly
                                placeholder="Sin teléfono"
                                className="w-full rounded-xl border border-border bg-foreground/[.03] py-2.5 pl-10 pr-3 text-sm text-muted-foreground outline-none"
                            />
                        </div>
                    </section>

                    {/* Payment history */}
                    <section>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de pagos</h4>
                        <p className="mb-2 text-xs text-muted-foreground">Ajusta el monto de cada mes (ej. periodos con precio o promoción distinta).</p>
                        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-foreground/[.02] px-3 py-2">
                            <span className="text-xs text-muted-foreground">Fecha del pago</span>
                            <DateInput value={paidOn} onChange={(d) => setPaidOn(d ?? new Date())} className="py-1.5 text-xs" />
                            <span className="basis-full text-[11px] text-muted-foreground">Los meses que marques como «Pagado» quedan con esta fecha: es la que decide en qué mes cuenta el ingreso.</span>
                        </div>
                        <div className="rounded-xl border border-border bg-card">
                            {periods.map((period) => {
                                const p = client.payments[period]
                                return (
                                    <div key={period} className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-0">
                                        <span className="w-16 shrink-0 text-muted-foreground">{periodLabel(period)}</span>
                                        <div className="flex flex-1 items-center gap-1">
                                            <span className="text-muted-foreground">$</span>
                                            <input
                                                type="number"
                                                key={`${period}-${p?.amount ?? ""}`}
                                                defaultValue={p?.amount ?? ""}
                                                placeholder="—"
                                                onBlur={(e) => {
                                                    const v = e.target.value === "" ? null : Number(e.target.value)
                                                    if (v !== (p?.amount ?? null)) onAmountChange(period, v)
                                                }}
                                                className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-right text-foreground outline-none hover:border-border focus:border-[#5B47E0] focus:bg-card"
                                            />
                                        </div>
                                        {p?.status === "paid" && p.paidAt && (
                                            <span className="shrink-0 text-[11px] text-muted-foreground" title="Fecha del pago">{formatPaidAt(p.paidAt)}</span>
                                        )}
                                        {p?.receiptUrl && (
                                            <a href={p.receiptUrl} target="_blank" rel="noreferrer" title="Ver comprobante" className="shrink-0 text-[#5B47E0] dark:text-[#A99BFF] hover:opacity-80">
                                                <FileTextIcon className="h-4 w-4" />
                                            </a>
                                        )}
                                        <select
                                            value={p?.status ?? ""}
                                            onChange={(e) => onStatusChange(period, e.target.value)}
                                            className="shrink-0 rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground outline-none focus:border-[#5B47E0]"
                                        >
                                            <option value="">—</option>
                                            {STATUS_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">Vista rápida:</span>
                            {periods.map((period) => (
                                <StatusPill key={period} status={client.payments[period]?.status ?? null} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </SideModal>
    )
}

export default ClientDrawer
