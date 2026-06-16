import { PhoneIcon } from "lucide-react"

import SideModal from "@/components/common/SideModal"
import useFinanzasStore from "@/store/finanzas"
import { formatMoney, MONTH_LABELS } from "@/utils/finanzas"
import { StatusPill } from "./ui"

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm last:border-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-700">{children}</span>
    </div>
)

const ClientDrawer = ({ clientId, onClose }: { clientId: string | null; onClose: () => void }) => {
    const { clients, months, updateClient, updatePayment } = useFinanzasStore()
    const client = clients.find((c) => c.id === clientId) ?? null

    return (
        <SideModal
            open={!!clientId}
            onOpenChange={(o) => !o && onClose()}
            title={client?.name ?? "Cliente"}
            description={client ? `${client.id} · ${client.plan ?? "Sin plan"}` : ""}
            size="md"
        >
            {client && (
                <div className="space-y-6 pt-2">
                    {/* Resumen */}
                    <section className="rounded-xl border border-slate-200/70 bg-white p-4">
                        <Row label="Estatus en la app">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs ${client.appStatus === "Activo" ? "bg-[#EEEBFC] text-[#5B47E0]" : "bg-slate-100 text-slate-400"}`}>
                                {client.appStatus ?? "—"}
                            </span>
                        </Row>
                        <Row label="Pago fijo">{formatMoney(client.fixedPayment)}</Row>
                        <Row label="Día de pago">{client.paymentDay ?? "—"}</Row>
                        <Row label="Saldo">
                            <span className={client.balance > 0 ? "text-rose-600" : "text-slate-500"}>
                                {client.balance > 0 ? formatMoney(client.balance) : client.balance < 0 ? `+${formatMoney(-client.balance)}` : "—"}
                            </span>
                        </Row>
                        <Row label="Recordatorios enviados">{client.reminderCount ?? 0}</Row>
                        {client.promo && <Row label="Promoción">{client.promo}</Row>}
                    </section>

                    {/* Teléfono */}
                    <section>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Teléfono (WhatsApp)</label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={client.phone ?? ""}
                                onChange={(e) => updateClient(client.id, { phone: e.target.value })}
                                placeholder="Ej. 55 1234 5678"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15"
                            />
                        </div>
                    </section>

                    {/* Historial de pagos */}
                    <section>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Historial de pagos</h4>
                        <div className="rounded-xl border border-slate-200/70 bg-white">
                            {months.map((m) => {
                                const p = client.payments[m]
                                return (
                                    <div key={m} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0">
                                        <span className="w-24 text-slate-600">{MONTH_LABELS[m] ?? m}</span>
                                        <span className="flex-1 text-slate-400">{p?.amount != null ? formatMoney(p.amount) : "—"}</span>
                                        <select
                                            value={p?.status ?? ""}
                                            onChange={(e) => updatePayment(client.id, m, { status: e.target.value })}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-[#5B47E0]"
                                        >
                                            <option value="">—</option>
                                            <option value="Realizado">Realizado</option>
                                            <option value="Retraso">Retraso</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-400">Vista rápida:</span>
                            {months.map((m) => (
                                <StatusPill key={m} status={client.payments[m]?.status ?? null} />
                            ))}
                        </div>
                    </section>

                    {/* Notas */}
                    <section>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Notas</label>
                        <textarea
                            value={client.notes ?? ""}
                            onChange={(e) => updateClient(client.id, { notes: e.target.value })}
                            placeholder="Acuerdos, observaciones, promesas de pago..."
                            className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15"
                        />
                    </section>
                </div>
            )}
        </SideModal>
    )
}

export default ClientDrawer
