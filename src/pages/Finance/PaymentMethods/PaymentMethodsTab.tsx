import { useEffect, useState } from "react"
import { CreditCardIcon, LandmarkIcon, PencilIcon, RepeatIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/common/Spinner"
import Button from "@/components/common/Button"
import SwitchInput from "@/components/common/Inputs/Switch"
import { Textarea } from "@/uishadcn/ui/textarea"
import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import { PaymentAccount, PAYMENT_ACCOUNT_TYPE_LABELS } from "@/interfaces/finance"
import usePaymentMethods from "./usePaymentMethods"
import { PaymentAccountFormValues, toPaymentAccountPayload } from "./components/paymentAccountSchema"
import PaymentAccountForm from "./components/PaymentAccountForm"
import { Panel } from "../components/ui"

const rowActionCls = "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition"
const activeBadgeCls = "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
const inactiveBadgeCls = "inline-flex items-center rounded-full bg-foreground/[.06] px-2 py-0.5 text-xs font-medium text-muted-foreground"
const typeBadgeCls = "inline-flex items-center rounded-full bg-foreground/[.06] px-2 py-0.5 text-xs font-medium text-muted-foreground"

const PaymentMethodsTab = () => {
    const { accounts, settings, loading, createAccount, updateAccount, deleteAccount, updateSettings, mutating } = usePaymentMethods()

    const [editing, setEditing] = useState<PaymentAccount | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Local mirror of the settings so the toggles/instructions are editable.
    const [stripeEnabled, setStripeEnabled] = useState(true)
    const [transferEnabled, setTransferEnabled] = useState(true)
    const [cardAutomation, setCardAutomation] = useState(false)
    const [instructions, setInstructions] = useState("")

    useEffect(() => {
        if (!settings) return
        setStripeEnabled(settings.stripeEnabled)
        setTransferEnabled(settings.transferEnabled)
        setCardAutomation(settings.cardAutomationEnabled)
        setInstructions(settings.transferInstructions)
    }, [settings])

    const handleSubmit = async (values: PaymentAccountFormValues) => {
        const payload = toPaymentAccountPayload(values)
        if (editing) {
            await updateAccount(editing.id, payload)
            toast.success("Cuenta actualizada")
        } else {
            await createAccount(payload)
            toast.success("Cuenta agregada")
        }
        setEditing(null)
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await deleteAccount(id)
            toast.success("Cuenta eliminada")
        } finally {
            setDeletingId(null)
        }
    }

    const saveSettings = async () => {
        await updateSettings({
            stripe_enabled: stripeEnabled,
            transfer_enabled: transferEnabled,
            client_card_automation_enabled: cardAutomation,
            transfer_instructions: instructions.trim(),
        })
        toast.success("Configuración guardada")
    }

    if (loading) {
        return (
            <Panel className="p-12">
                <Spinner size="md" color="primary" />
            </Panel>
        )
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            {/* Toggles + instructions */}
            <Panel className="p-5">
                <h3 className="text-sm font-semibold text-foreground">Métodos de cobro</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Controla qué opciones ve el equipo al cobrar un adeudo en Cobranza.</p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <CreditCardIcon className="h-5 w-5 text-[#635BFF]" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Pago con tarjeta (Stripe)</p>
                                <p className="text-xs text-muted-foreground">Botón "Con tarjeta" en el cobro.</p>
                            </div>
                        </div>
                        <SwitchInput id="stripe-enabled" checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <LandmarkIcon className="h-5 w-5 text-[#5B47E0] dark:text-[#A99BFF]" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Transferencia</p>
                                <p className="text-xs text-muted-foreground">Muestra las cuentas de cobro.</p>
                            </div>
                        </div>
                        <SwitchInput id="transfer-enabled" checked={transferEnabled} onCheckedChange={setTransferEnabled} />
                    </div>
                </div>

                {/* Lo que ven las CLIENTAS, no el equipo: por eso va aparte y explica qué hace. Depende de
                    que el pago con tarjeta esté encendido (sin Stripe no hay con qué domiciliar). */}
                <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                    <div className="flex items-start gap-2.5">
                        <RepeatIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#635BFF]" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Invitar a domiciliar la tarjeta</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                En la web, cuando una clienta sube su comprobante, se le ofrece que su plan se cobre solo cada mes.
                                Su primer cobro automático cae en su próxima fecha de pago. No se ofrece a quien tiene deudas vencidas o promoción.
                            </p>
                        </div>
                    </div>
                    <SwitchInput id="card-automation" checked={cardAutomation} disabled={!stripeEnabled} onCheckedChange={setCardAutomation} />
                </div>

                <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground">Instrucciones de transferencia</label>
                    <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Ej. Envía tu comprobante por WhatsApp para confirmar tu pago."
                        maxLength={500}
                        rows={2}
                        className="mt-1 bg-card"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <Button text="Guardar configuración" color="primary" rounded size="sm" loading={mutating} onClick={saveSettings} />
                </div>
            </Panel>

            {/* Transfer accounts */}
            <Panel className="p-5">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">Cuentas de cobro</h3>
                    <p className="text-xs text-muted-foreground">{accounts.length} {accounts.length === 1 ? "cuenta" : "cuentas"}</p>
                </div>

                <div className="mt-4">
                    <PaymentAccountForm
                        account={editing}
                        loading={mutating}
                        onSubmit={handleSubmit}
                        onCancelEdit={() => setEditing(null)}
                    />
                </div>

                <div className="mt-4 divide-y divide-border">
                    {accounts.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">Sin cuentas de cobro. Agrega la primera.</p>
                    )}

                    {accounts.map((account) => (
                        <div key={account.id} className="flex items-center gap-3 py-2.5">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-medium text-foreground">{account.bank}</p>
                                    <span className={typeBadgeCls}>{PAYMENT_ACCOUNT_TYPE_LABELS[account.numberType]}</span>
                                    <span className={account.isActive ? activeBadgeCls : inactiveBadgeCls}>{account.isActive ? "Activa" : "Inactiva"}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">{account.beneficiary} · {account.number}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing(account)}
                                    className={`${rowActionCls} hover:bg-foreground/[.07] hover:text-foreground`}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <AlertConfirmDelete
                                    title="¿Eliminar esta cuenta?"
                                    description="Esta acción no se puede deshacer."
                                    loading={mutating && deletingId === account.id}
                                    onConfirm={() => handleDelete(account.id)}
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

export default PaymentMethodsTab
