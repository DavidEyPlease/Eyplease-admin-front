import { CalendarClockIcon, PhoneIcon } from "lucide-react"
import { toast } from "sonner"

import SideModal from "@/components/common/SideModal"
import Spinner from "@/components/common/Spinner"
import { formatChargeDate, formatMoney, periodLabel, periodsForYear } from "@/utils/finance"
import { MarkPaymentInput, useFinanceClient, useMarkPayment } from "../useFinanceClients"
import { StatusPill } from "./ui"

const STATUS_OPTIONS: { value: MarkPaymentInput["status"]; label: string }[] = [
    { value: "paid", label: "Pagado" },
    { value: "overdue", label: "Retraso" },
    { value: "pending", label: "Pendiente" },
]
const APP_STATUS_LABELS: Record<string, string> = { active: "Activo", inactive: "Inactivo" }

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm last:border-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-700">{children}</span>
    </div>
)

const ClientDrawer = ({ clientId, year, onClose }: { clientId: string | null; year: number; onClose: () => void }) => {
    const { client, loading } = useFinanceClient(clientId, year)
    const { markPayment } = useMarkPayment()
    const periods = periodsForYear(year)

    const onStatusChange = (period: string, status: string) => {
        if (!status || !client) return
        markPayment({ account: client.id, period, status: status as MarkPaymentInput["status"], source: "manual" })
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
                    <section className="rounded-xl border border-slate-200/70 bg-white p-4">
                        <Row label="Estatus en la app">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs ${client.appStatus === "active" ? "bg-[#EEEBFC] text-[#5B47E0]" : "bg-slate-100 text-slate-400"}`}>
                                {APP_STATUS_LABELS[client.appStatus ?? ""] ?? "—"}
                            </span>
                        </Row>
                        <Row label="Pago fijo">{formatMoney(client.fixedPayment)}</Row>
                        <Row label="Día de pago">{client.paymentDay ?? "—"}</Row>
                        <Row label="Próximo cobro">
                            <span className="inline-flex items-center gap-1.5 text-[#5B47E0]">
                                <CalendarClockIcon className="h-4 w-4" /> {formatChargeDate(client.paymentDay)}
                            </span>
                        </Row>
                        <Row label="Saldo">
                            <span className={client.balance > 0 ? "text-rose-600" : "text-slate-500"}>
                                {client.balance > 0 ? formatMoney(client.balance) : client.balance < 0 ? `+${formatMoney(-client.balance)}` : "—"}
                            </span>
                        </Row>
                    </section>

                    {/* Phone */}
                    <section>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Teléfono (WhatsApp)</label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={client.phone ?? ""}
                                readOnly
                                placeholder="Sin teléfono"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-600 outline-none"
                            />
                        </div>
                    </section>

                    {/* Payment history */}
                    <section>
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Historial de pagos</h4>
                        <p className="mb-2 text-xs text-slate-400">Ajusta el monto de cada mes (ej. periodos con precio o promoción distinta).</p>
                        <div className="rounded-xl border border-slate-200/70 bg-white">
                            {periods.map((period) => {
                                const p = client.payments[period]
                                return (
                                    <div key={period} className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                                        <span className="w-16 shrink-0 text-slate-600">{periodLabel(period)}</span>
                                        <div className="flex flex-1 items-center gap-1">
                                            <span className="text-slate-400">$</span>
                                            <input
                                                type="number"
                                                key={`${period}-${p?.amount ?? ""}`}
                                                defaultValue={p?.amount ?? ""}
                                                placeholder="—"
                                                onBlur={(e) => {
                                                    const v = e.target.value === "" ? null : Number(e.target.value)
                                                    if (v !== (p?.amount ?? null)) onAmountChange(period, v)
                                                }}
                                                className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-right text-slate-800 outline-none hover:border-slate-200 focus:border-[#5B47E0] focus:bg-white"
                                            />
                                        </div>
                                        <select
                                            value={p?.status ?? ""}
                                            onChange={(e) => onStatusChange(period, e.target.value)}
                                            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-[#5B47E0]"
                                        >
                                            <option value="">—</option>
                                            {STATUS_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value ?? ""}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400">Vista rápida:</span>
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
