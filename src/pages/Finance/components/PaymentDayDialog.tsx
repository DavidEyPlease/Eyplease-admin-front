import { useEffect, useState } from "react"
import { CalendarClockIcon, CalendarIcon, GiftIcon } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/uishadcn/ui/dialog"
import DateInput from "@/components/common/Inputs/DateInput"
import { FinanceClient } from "@/interfaces/finance"
import { formatDueDate, formatMoney, paidAtOn, periodLabelIn, periodOf, todayMx } from "@/utils/finance"
import { useMarkPayment, usePaymentDay } from "../useFinanceClients"
import { BtnGhost, BtnPrimary } from "./ui"

const pad = (n: number) => String(n).padStart(2, "0")

/** ¿Su prueba gratis sigue corriendo? (termina hoy o después) */
export const trialRunning = (client: Pick<FinanceClient, "trialEndsAt">) =>
    !!client.trialEndsAt && client.trialEndsAt >= todayMx()

/**
 * El primer cobro que le tocaría con ese día, igual que lo calcula la API: del mes en curso en adelante, el
 * primero que NO cae dentro de su prueba gratis (los días de prueba no se cobran). Un 31 cae en el último
 * día de los meses más cortos. Es sólo la vista previa: la fecha que vale es la que devuelve la API al guardar.
 */
const firstChargeOn = (day: number, trialEndsAt: string | null | undefined) => {
    let [year, month] = todayMx().slice(0, 7).split("-").map(Number)
    for (let i = 0; i < 24; i++) {
        const date = `${year}-${pad(month)}-${pad(Math.min(day, new Date(year, month, 0).getDate()))}`
        if (!trialEndsAt || date >= trialEndsAt) return date
        month += 1
        if (month > 12) { month = 1; year += 1 }
    }
    return null
}

/**
 * Pone (o cambia) el día de pago de una clienta que paga por transferencia. Con él entra al calendario de
 * cobro: se le crea su mes y le llegan los recordatorios. Toda alta nueva nace sin día y, mientras no lo
 * tenga, el sistema no le cobra nada: en Cobranza sale como «Sin día de pago».
 *
 * Si se registró sola, propone el día en que termina su prueba; y si ya pagó, deja registrado ese primer
 * mes en el mismo paso.
 */
const PaymentDayDialog = ({ client, year, onClose }: { client: FinanceClient | null; year: number; onClose: () => void }) => {
    const { setPaymentDay, saving } = usePaymentDay()
    const { markPayment, marking } = useMarkPayment()
    const [dayInput, setDayInput] = useState("")
    const [alreadyPaid, setAlreadyPaid] = useState(false)
    const [paidOn, setPaidOn] = useState<Date>(() => new Date())

    /* Al abrir: su día actual; si no tiene, el día en que termina su prueba, y si no hay prueba, hoy */
    useEffect(() => {
        if (!client) return
        const suggested = client.paymentDay
            ?? Number((trialRunning(client) ? client.trialEndsAt! : todayMx()).slice(8, 10))
        setDayInput(String(suggested))
        setAlreadyPaid(false)
        setPaidOn(new Date())
    }, [client?.id])

    const day = Number(dayInput)
    const validDay = Number.isInteger(day) && day >= 1 && day <= 31
    const inTrial = !!client && trialRunning(client)
    const firstCharge = client && validDay ? firstChargeOn(day, inTrial ? client.trialEndsAt : null) : null
    const alreadyPassed = !!firstCharge && firstCharge < todayMx()
    const busy = saving || marking

    const save = async () => {
        if (!client || !validDay) return
        try {
            const updated = await setPaymentDay(client.id, day)
            const charge = updated?.nextChargeDate ?? firstCharge
            if (alreadyPaid && charge) {
                await markPayment({ account: client.id, period: periodOf(charge), status: "paid", source: "manual", paid_at: paidAtOn(paidOn) })
                toast.success(`${client.name}: día de pago ${day} y ${periodLabelIn(periodOf(charge), year)} pagado`)
            } else {
                toast.success(`${client.name}: día de pago ${day}${charge ? ` · primer cobro ${formatDueDate(charge)}` : ""}`)
            }
            onClose()
        } catch {
            /* El aviso ya lo dio el hook con el mensaje de la API; el diálogo se queda abierto */
        }
    }

    return (
        <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Día de pago</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {client ? `${client.name} · ${client.id} · ${client.plan ?? "sin plan"}${client.fixedPayment ? ` · ${formatMoney(client.fixedPayment)} al mes` : ""}` : ""}
                    </DialogDescription>
                </DialogHeader>
                {client && (
                    <div className="space-y-4">
                        {inTrial && (
                            <p className="flex items-start gap-2 rounded-xl bg-[#5B47E0]/[.06] px-3 py-2 text-xs text-muted-foreground">
                                <GiftIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B47E0] dark:text-[#A99BFF]" />
                                Su prueba gratis termina el {formatDueDate(client.trialEndsAt)}. Esos días no se cobran: su primer mes empieza ese día.
                            </p>
                        )}

                        <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                            <span className="text-sm text-foreground">Día del mes en que paga</span>
                            <input
                                type="number" min={1} max={31} inputMode="numeric"
                                value={dayInput}
                                onChange={(e) => setDayInput(e.target.value)}
                                className="w-16 rounded-lg border border-border bg-transparent px-2 py-1 text-right text-sm font-semibold text-foreground outline-none focus:border-[#5B47E0]"
                            />
                        </label>

                        {validDay && firstCharge ? (
                            <p className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CalendarClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>
                                    Primer cobro: <b className="text-foreground">{formatDueDate(firstCharge)}</b>
                                    {client.fixedPayment ? <> · <b className="text-foreground">{formatMoney(client.fixedPayment)}</b></> : null}. Después, cada día {day}.
                                    {alreadyPassed && !alreadyPaid && <span className="mt-1 block text-rose-600 dark:text-rose-400">Ese día ya pasó este mes: le aparecerá como vencido.</span>}
                                </span>
                            </p>
                        ) : (
                            <p className="text-xs text-rose-600 dark:text-rose-400">Escribe un día del 1 al 31.</p>
                        )}

                        <div className="rounded-xl border border-border px-3 py-2.5">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                                <input type="checkbox" checked={alreadyPaid} onChange={(e) => setAlreadyPaid(e.target.checked)} className="size-4 accent-[#5B47E0]" />
                                Ya pagó su primer mes
                            </label>
                            {alreadyPaid && (
                                <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-foreground">Fecha del pago</span>
                                    <DateInput value={paidOn} onChange={(d) => setPaidOn(d ?? new Date())} className="ml-auto py-1.5 text-xs" />
                                    <span className="basis-full text-[11px] text-muted-foreground">
                                        Se registra {firstCharge ? periodLabelIn(periodOf(firstCharge), year) : "su primer mes"} como pagado; su siguiente cobro es un mes después.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-2">
                    <BtnGhost onClick={onClose} disabled={busy}>Cancelar</BtnGhost>
                    <BtnPrimary onClick={save} disabled={busy || !validDay}>{busy ? "Guardando…" : "Guardar"}</BtnPrimary>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentDayDialog
