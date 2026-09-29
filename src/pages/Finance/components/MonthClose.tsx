import { useState } from "react"
import { toast } from "sonner"
import { CalendarXIcon, MailIcon, PauseCircleIcon, ShieldCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { titleCase } from "@/pages/Clients/List/names"
import {
    AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/uishadcn/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/uishadcn/ui/dialog"
import { formatMoney, periodLabel } from "@/utils/finance"
import { useMonthClose, type MonthCloseRow } from "../useMonthClose"

const monthsText = (row: MonthCloseRow) => {
    const names = row.owed.map(item => periodLabel(item.period).toLowerCase())
    const last = names.pop()
    return names.length ? `${names.join(", ")} y ${last}` : last ?? ""
}

/** El día 1 del mes que sigue al que se cierra, dicho corto: «1 oct». */
const closeDay = (next: string) => `1 ${periodLabel(next).toLowerCase().slice(0, 3)}`

/**
 * El cierre de mes, a la vista antes de que pase: quién llega debiendo, a quién se pausará el día 1 a las 00:30 (se le
 * da de baja y le llega un correo con lo que debe y cómo volver) y a quién no, con el porqué. Si alguien paga antes,
 * sale sola de la lista. Con el interruptor apagado no se pausa a nadie: sólo te llega la lista por correo.
 */
const MonthClose = () => {
    const { preview, loading, setEnabled, mailFor, saving } = useMonthClose()
    const [confirming, setConfirming] = useState(false)
    const [mail, setMail] = useState<{ name: string, html: string } | null>(null)

    if (loading) {
        return <section className="shell-glass h-28 animate-pulse rounded-3xl" />
    }

    /* Sin la vista previa (una API sin el cierre, o un error) la tarjeta no se pinta: no es la pantalla principal */
    if (!preview || !Array.isArray(preview.pause) || !Array.isArray(preview.spared)) {
        return null
    }

    const month = periodLabel(preview.period).toLowerCase()
    const next = periodLabel(preview.next_period).toLowerCase()

    const toggle = async (enabled: boolean) => {
        try {
            await setEnabled(enabled)
            toast.success(enabled ? `Encendido: el ${closeDay(preview.next_period)} a las 00:30 se cierra ${month}` : "Apagado: el día 1 sólo te llegará la lista")
        } catch (error) {
            toast.error((error as { message?: string })?.message || "No se pudo guardar")
        } finally {
            setConfirming(false)
        }
    }

    const openMail = async (row: MonthCloseRow) => {
        try {
            const html = await mailFor(row.account)
            setMail({ name: titleCase(row.name), html })
        } catch (error) {
            toast.error((error as { message?: string })?.message || "No se pudo abrir el correo")
        }
    }

    return (
        <section className="shell-glass overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-[18px] pb-2.5">
                <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold tracking-tight">
                        <CalendarXIcon className="size-4 text-amber-500" /> Cierre de {month}
                        <span className={cn("pulse-tag", preview.enabled ? "ok" : "plain")}>{preview.enabled ? `encendido · ${closeDay(preview.next_period)}, 00:30` : "apagado"}</span>
                    </h2>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                        Quien llegue al día 1 debiendo se pone en pausa y le llega un correo. Para volver paga lo que debe más {next}.
                    </p>
                </div>
                {preview.enabled ? (
                    <button type="button" disabled={saving} onClick={() => toggle(false)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-[12.5px] font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                        Apagar
                    </button>
                ) : (
                    <button type="button" disabled={saving} onClick={() => setConfirming(true)} className="shell-cta inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-[12.5px] font-bold text-white disabled:opacity-50">
                        <PauseCircleIcon className="size-4" /> Encender el cierre
                    </button>
                )}
            </header>

            {preview.pause.length === 0 ? (
                <p className="px-5 pb-4 text-[13px] text-muted-foreground">Nadie llega debiendo {month}: el día 1 no se pausa a nadie.</p>
            ) : (
                <div className="divide-y divide-border">
                    {preview.pause.map(row => (
                        <div key={row.user_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                            <div className="min-w-0 flex-1">
                                <b className="block truncate text-[13.5px] font-bold">{titleCase(row.name)}</b>
                                <small className="block text-[11.5px] text-muted-foreground">
                                    {row.account} · debe <b className="text-foreground">{formatMoney(row.total)}</b> de {monthsText(row)}
                                    {row.days_late !== null && ` · ${row.days_late} días de atraso`}
                                    {row.next_amount !== null && ` · para volver ${formatMoney(row.total + row.next_amount)}`}
                                </small>
                                {!row.email && <small className="mt-0.5 block text-[11.5px] font-semibold text-amber-700 dark:text-amber-300">Sin correo: se pausa, pero no le llega el aviso.</small>}
                            </div>
                            {row.email && (
                                <button type="button" onClick={() => openMail(row)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold text-primary hover:bg-primary/10">
                                    <MailIcon className="size-3.5" /> Ver su correo
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {preview.spared.length > 0 && (
                <div className="border-t border-border px-5 py-3">
                    <small className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-[.06em] text-muted-foreground uppercase"><ShieldCheckIcon className="size-3.5" /> No se pausan</small>
                    {preview.spared.map(row => (
                        <p key={row.user_id} className="text-[12.5px] leading-relaxed text-muted-foreground">
                            <b className="text-foreground">{titleCase(row.name)}</b> · {formatMoney(row.total)} · {row.reason}
                        </p>
                    ))}
                </div>
            )}

            <AlertDialog open={confirming} onOpenChange={value => !value && !saving && setConfirming(false)}>
                <AlertDialogContent className="rounded-[24px] p-6 sm:max-w-md">
                    <AlertDialogHeader className="place-items-start text-left">
                        <AlertDialogTitle className="text-[17px] font-extrabold tracking-tight">¿Encender el cierre de mes?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="grid gap-1.5 text-[13px] leading-relaxed">
                                <p>
                                    El {closeDay(preview.next_period)} a las 00:30 se pondrán en pausa las cuentas que sigan debiendo {month}
                                    {preview.pause.length ? ` (hoy serían ${preview.pause.length})` : ""}: se les da de baja y les llega el correo.
                                </p>
                                <p>Quien pague antes sale sola de la lista. Cada mes vuelve a correr hasta que lo apagues.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel disabled={saving} className="rounded-full">Cancelar</AlertDialogCancel>
                        <button type="button" disabled={saving} onClick={() => toggle(true)} className="shell-cta inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-4 text-[13px] font-bold text-white disabled:opacity-50">
                            {saving ? "Un momento…" : "Sí, encenderlo"}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={Boolean(mail)} onOpenChange={value => !value && setMail(null)}>
                <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[680px]">
                    <DialogHeader className="px-5 pt-5">
                        <DialogTitle className="text-[16px] font-extrabold">El correo que le llegaría a {mail?.name}</DialogTitle>
                        <DialogDescription className="text-[12px]">Asunto: «Su cuenta de Eyplease+ quedó en pausa»</DialogDescription>
                    </DialogHeader>
                    {mail && <iframe title="Correo de la cuenta en pausa" srcDoc={mail.html} sandbox="" className="h-[70vh] w-full border-t border-border bg-white" />}
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default MonthClose
