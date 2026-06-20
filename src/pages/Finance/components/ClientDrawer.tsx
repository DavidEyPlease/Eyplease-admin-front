import { PhoneIcon } from "lucide-react"

import SideModal from "@/components/common/SideModal"
import Spinner from "@/components/common/Spinner"
import { formatMoney, periodLabel, periodsForYear } from "@/utils/finance"
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
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Historial de pagos</h4>
                        <div className="rounded-xl border border-slate-200/70 bg-white">
                            {periods.map((period) => {
                                const p = client.payments[period]
                                return (
                                    <div key={period} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0">
                                        <span className="w-24 text-slate-600">{periodLabel(period)}</span>
                                        <span className="flex-1 text-slate-400">{p?.amount != null ? formatMoney(p.amount) : "—"}</span>
                                        <select
                                            value={p?.status ?? ""}
                                            onChange={(e) => onStatusChange(period, e.target.value)}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-[#5B47E0]"
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
