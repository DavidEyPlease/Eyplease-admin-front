import { useState } from 'react'
import { CreditCardIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/uishadcn/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { titleCase } from './names'
import { BoardClient } from './useClientsBoard'
import useClientStatus from './useClientStatus'

/**
 * Confirmar antes de activar o desactivar a una clienta.
 *
 * Desactivar no es un detalle visual: la saca del sistema. Por eso el diálogo dice, en palabras de
 * todos los días, qué le va a pasar — y qué NO se borra, para que se pueda hacer sin miedo. Lo que no
 * hace la plataforma (cancelar su tarjeta en Stripe) lo dice también, sólo a quien paga así.
 */
const StatusDialog = ({ client, onClose }: { client: BoardClient | null, onClose: () => void }) => {
    const { setActive } = useClientStatus()
    const [saving, setSaving] = useState(false)

    const active = client?.client.user?.active !== false
    const name = client ? titleCase(client.client.name) : ''
    const paysByCard = !!client?.client.card_subscription

    const confirm = async () => {
        if (!client || saving) return
        setSaving(true)

        try {
            await setActive(client.client.id, !active)
            toast.success(active ? `${name} quedó desactivada` : `${name} está activa otra vez`)
            onClose()
        } catch (error) {
            toast.error((error as Error)?.message || 'No se pudo cambiar el estado. Inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AlertDialog open={!!client} onOpenChange={open => { if (!open && !saving) onClose() }}>
            <AlertDialogContent className="max-w-[460px] rounded-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[18px] font-extrabold tracking-tight">
                        {active ? `¿Desactivar a ${name}?` : `¿Activar a ${name}?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="grid gap-3 text-[13.5px] leading-relaxed text-muted-foreground">
                            {active ? (
                                <>
                                    <ul className="grid gap-1.5">
                                        <li>· Se le cierra la sesión en todos sus dispositivos y ya no podrá entrar.</li>
                                        <li>· Deja de generarse su cobro mensual.</li>
                                        <li>· Dejan de hacerse sus publicaciones.</li>
                                    </ul>
                                    <p><b className="font-semibold text-foreground">No se borra nada:</b> sus datos, sus pagos y sus piezas se quedan, y la puedes activar cuando quieras.</p>
                                </>
                            ) : (
                                <p>Vuelve a poder entrar con su contraseña de siempre, se le vuelven a hacer sus publicaciones y, si tiene día de pago, se le vuelve a generar su cobro.</p>
                            )}

                            {active && paysByCard && (
                                <p className="flex gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-[13px] text-amber-800 dark:text-amber-300">
                                    <CreditCardIcon className="mt-0.5 size-4 shrink-0" />
                                    <span><b className="font-semibold">Paga con tarjeta automática.</b> Desactivarla aquí no cancela ese cobro: Stripe le seguirá cobrando cada mes hasta que canceles su suscripción en Stripe.</span>
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={saving} className="rounded-xl">Cancelar</AlertDialogCancel>
                    {/* Botón propio y no `AlertDialogAction`: ese cierra el diálogo al instante, y si la
                        API falla ya no quedaría dónde decirlo ni cómo reintentar */}
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={saving}
                        className={cn(
                            'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white transition-opacity disabled:opacity-60',
                            active ? 'bg-destructive' : 'bg-primary',
                        )}
                    >
                        {saving && <Loader2Icon className="size-4 animate-spin" />}
                        {active ? 'Desactivar' : 'Activar'}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default StatusDialog
