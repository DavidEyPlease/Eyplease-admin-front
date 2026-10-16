import { useEffect, useState } from "react"
import { CalendarClockIcon, CreditCardIcon, GiftIcon, HandHeartIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/uishadcn/ui/dialog"
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { FinanceClient } from "@/interfaces/finance"
import { IPlan } from "@/interfaces/plans"
import { formatDueDate, formatMoney, periodLabel } from "@/utils/finance"
import { queryKeys } from "@/utils/queryKeys"
import { useWinBack, useWinBackPreview, WinBackInput } from "../useFinanceClients"
import { BtnGhost, BtnPrimary } from "./ui"

const FREE_MONTHS = [1, 2, 3]

/**
 * Regreso con promoción (reconquista): una baja vuelve con N meses gratis, en un solo paso. Lo que debía de antes
 * se condona (queda «Condonado» en su historial), su día de pago pasa a ser hoy, se le pone la promoción «Regreso ·
 * N mes(es) gratis» del catálogo, el plan con el que vuelve, y se reactiva. Una domiciliada cuya tarjeta ya no
 * cobraba en Stripe pasa además a cobro por fecha. Todo lo calcula la API: aquí sólo se
 * enseña la vista previa y se confirma.
 */
const WinBackDialog = ({ client, onClose }: { client: FinanceClient | null; onClose: () => void }) => {
    const { response: plans } = useFetchQuery<IPlan[]>(API_ROUTES.PLANS.LIST, {
        customQueryKey: queryKeys.list("config/plans", {}),
        enabled: !!client,
        staleTime: 5 * 60 * 1000,
    })
    const [input, setInput] = useState<WinBackInput>({ plan_id: null, free_months: 1, waive_previous: true })
    const { response: preview, loading, error } = useWinBackPreview(client?.id ?? null, input)
    const { winBack, saving } = useWinBack()

    /* Al abrir para otra clienta: lo de siempre (su mismo plan, 1 mes, condonar) */
    const clientId = client?.id
    useEffect(() => {
        if (clientId) setInput({ plan_id: null, free_months: 1, waive_previous: true })
    }, [clientId])

    const paidPlans = (plans ?? []).filter(plan => plan.active !== false && !plan.free)
    const planId = input.plan_id ?? preview?.plan.id ?? ""
    const errorMessage = (error as { message?: string } | null)?.message

    const confirm = async () => {
        if (!client) return
        try {
            const done = await winBack(client.id, { ...input, plan_id: planId || null })
            if (!done) return
            toast.success(`${client.name} volvió con ${done.plan.name}: ${done.free_months === 1 ? "su mes gratis" : `${done.free_months} meses gratis`} corre desde hoy. Primer cobro el ${formatDueDate(done.first_charge.date)}.`)
            onClose()
        } catch {
            /* El aviso ya lo dio el hook con el mensaje de la API; el diálogo se queda abierto */
        }
    }

    return (
        <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <GiftIcon className="h-5 w-5 text-[#5B47E0] dark:text-[#A99BFF]" /> Regreso con promoción
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {client ? `${client.name} · ${client.id}${client.plan ? ` · estaba en ${client.plan}` : ""}` : ""}
                    </DialogDescription>
                </DialogHeader>

                {client && (
                    <div className="space-y-4">
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                            <span className="text-sm text-foreground">Regresa con el plan</span>
                            <select
                                value={planId}
                                onChange={(e) => setInput(prev => ({ ...prev, plan_id: e.target.value || null }))}
                                className="max-w-[60%] rounded-lg border border-border bg-card px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-[#5B47E0]"
                            >
                                {paidPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name} · {formatMoney(plan.price)}</option>
                                ))}
                            </select>
                        </label>

                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                            <span className="text-sm text-foreground">Meses gratis</span>
                            <div className="flex gap-1.5">
                                {FREE_MONTHS.map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setInput(prev => ({ ...prev, free_months: n }))}
                                        className={`h-8 min-w-8 rounded-lg border px-2.5 text-sm font-semibold transition ${input.free_months === n ? "border-transparent bg-[#5B47E0] text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border px-3 py-2.5">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                                <input type="checkbox" checked={input.waive_previous} onChange={(e) => setInput(prev => ({ ...prev, waive_previous: e.target.checked }))} className="size-4 accent-[#5B47E0]" />
                                Condonar lo que debía de antes
                            </label>
                            {preview && preview.waived.length > 0 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    {preview.waived.map(w => `${periodLabel(w.period)} ${w.period.slice(0, 4)}`).join(", ")}
                                    {" · "}<b className="text-foreground">{formatMoney(preview.waived.reduce((s, w) => s + w.remaining, 0))}</b>
                                    {input.waive_previous ? " quedan «Condonado»: no es deuda ni ingreso." : " se quedan pendientes, con plazo hasta que acaben sus meses gratis."}
                                </p>
                            )}
                            {preview && preview.waived.length === 0 && <p className="mt-1.5 text-xs text-muted-foreground">No debía nada de antes.</p>}
                        </div>

                        {loading && !preview && <p className="text-xs text-muted-foreground">Calculando…</p>}
                        {errorMessage && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>}

                        {preview && (
                            <div className="space-y-2 rounded-xl bg-[#5B47E0]/[.06] px-3 py-3 text-xs text-muted-foreground">
                                <p className="flex items-start gap-2">
                                    <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B47E0] dark:text-[#A99BFF]" />
                                    <span>Se activa <b className="text-foreground">hoy</b> con <b className="text-foreground">{preview.plan.name}</b>. Gratis hasta el <b className="text-foreground">{formatDueDate(preview.free_until)}</b>: esos meses salen en $0 y ya saldados.</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <CalendarClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>Su día de pago pasa a ser el <b className="text-foreground">{preview.payment_day}</b>. Primer cobro: <b className="text-foreground">{formatDueDate(preview.first_charge.date)}</b> por <b className="text-foreground">{formatMoney(preview.first_charge.amount)}</b>, sin que nadie tenga que acordarse.</span>
                                </p>
                                {preview.card_to_manual && (
                                    <p className="flex items-start gap-2">
                                        <CreditCardIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>Era domiciliada, pero su tarjeta ya no cobraba en Stripe{preview.card_to_manual.status ? ` (${preview.card_to_manual.status})` : ""}. Pasa a <b className="text-foreground">cobro por fecha</b>; cancela su suscripción vieja en Stripe.</span>
                                    </p>
                                )}
                                {input.waive_previous && preview.waived_total > 0 && (
                                    <p className="flex items-start gap-2">
                                        <HandHeartIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>Se condonan <b className="text-foreground">{formatMoney(preview.waived_total)}</b> de antes. Queda anotado quién y cuándo.</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <BtnGhost onClick={onClose} disabled={saving}>Cancelar</BtnGhost>
                    <BtnPrimary onClick={confirm} disabled={saving || !preview || !!errorMessage}>{saving ? "Reactivando…" : "Reactivarla"}</BtnPrimary>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default WinBackDialog
