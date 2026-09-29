import { useState } from 'react'
import { CreditCardIcon, Loader2Icon, ReceiptTextIcon } from 'lucide-react'
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
import { moneyIn } from '@/constants/countries'
import { cn } from '@/lib/utils'
import { periodLabel } from '@/utils/finance'
import { titleCase } from './names'
import { StatusTarget } from './statusTarget'
import useClientDebt, { ClientDebt } from './useClientDebt'
import useClientStatus from './useClientStatus'

/** «a, b y c» */
const joinEs = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}` : items[0] ?? ''

/** Los meses que debe, en palabras: «julio, agosto y septiembre de 2026»; si son muchos, el tramo */
const monthsOwed = (periods: string[]) => {
    const month = (period: string) => periodLabel(period).toLowerCase()
    if (periods.length > 4) return `${periods.length} meses, de ${month(periods[0])} de ${periods[0].slice(0, 4)} a ${month(periods[periods.length - 1])} de ${periods[periods.length - 1].slice(0, 4)}`

    const years = [...new Set(periods.map(period => period.slice(0, 4)))]
    return joinEs(years.map(year => `${joinEs(periods.filter(period => period.startsWith(year)).map(month))} de ${year}`))
}

/**
 * Lo que debe, dicho ANTES de confirmar. Al activarla es un aviso: le vuelve a aparecer y, si ya pasó
 * el plazo, la app sólo la deja entrar a pagar. Al desactivarla, que no se pierde: se queda guardado.
 */
const DebtNotice = ({ debt, activating }: { debt: ClientDebt, activating: boolean }) => {
    const amount = moneyIn(debt.total, debt.currency)
    const months = monthsOwed(debt.periods.map(item => item.period))
    const late = debt.days_overdue > 0

    if (!activating) {
        return <p><b className="font-semibold text-foreground">Lo que debe ({amount} de {months}) se queda guardado</b> en Finanzas → Cobranza → «Bajas con adeudo», y le vuelve a aparecer si la activas.</p>
    }

    return (
        <p className="flex gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-[13px] text-amber-800 dark:text-amber-300">
            <ReceiptTextIcon className="mt-0.5 size-4 shrink-0" />
            <span>
                <b className="font-semibold">Debe {amount}</b> de {months}. Al activarla le vuelve a aparecer en {late ? '«A quién cobrarle»' : 'la cobranza'}
                {debt.account_blocked ? ' y la app sólo la dejará entrar a pagar hasta que se ponga al corriente.' : late ? ' y la app le mostrará el aviso de pago.' : '.'}
            </span>
        </p>
    )
}

/**
 * Confirmar antes de activar o desactivar a una clienta.
 *
 * Desactivar no es un detalle visual: la saca del sistema. Por eso el diálogo dice, en palabras de
 * todos los días, qué le va a pasar — y qué NO se borra, para que se pueda hacer sin miedo. Lo que no
 * hace la plataforma (cancelar su tarjeta en Stripe) lo dice también, sólo a quien paga así. Y lo que
 * debe, de todos los años: una baja conserva su deuda y le vuelve a aparecer si regresa.
 */
const StatusDialog = ({ target, onClose, onChanged }: { target: StatusTarget | null, onClose: () => void, onChanged?: (active: boolean) => void }) => {
    const { setActive } = useClientStatus()
    const [saving, setSaving] = useState(false)
    const { debt: freshDebt, loading: checking, failed } = useClientDebt(target?.id ?? null)

    /* Al cerrar, `target` pasa a null ANTES de que termine la animación de salida: sin esto el título
       cambiaba a «¿Desactivar a ?» y el aviso se esfumaba mientras el diálogo se desvanecía. Se pinta
       la última clienta y lo último que se supo de lo que debe (estado derivado, no un efecto) */
    const [last, setLast] = useState({ target, debt: freshDebt })
    if (target && (target !== last.target || freshDebt !== last.debt)) setLast({ target, debt: freshDebt })
    const shown = target ?? last.target
    const debt = target ? freshDebt : last.debt

    const active = shown?.active ?? true
    const name = shown ? titleCase(shown.name) : ''

    const confirm = async () => {
        if (!target || saving) return
        setSaving(true)

        try {
            await setActive(target.id, !active)
            toast.success(active ? `${name} quedó desactivada` : `${name} está activa otra vez`)
            onChanged?.(!active)
            onClose()
        } catch (error) {
            toast.error((error as Error)?.message || 'No se pudo cambiar el estado. Inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AlertDialog open={!!target} onOpenChange={open => { if (!open && !saving) onClose() }}>
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

                            {checking && <p className="flex items-center gap-2 text-[12.5px]"><Loader2Icon className="size-3.5 animate-spin" />Revisando si debe algo…</p>}
                            {failed && <p className="text-[12.5px]">No se pudo revisar si debe algo.</p>}
                            {debt && debt.total > 0 && <DebtNotice debt={debt} activating={!active} />}
                            {debt && debt.total <= 0 && !active && <p className="text-[12.5px]">No debe nada.</p>}

                            {active && shown?.paysByCard && (
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
                        API falla ya no quedaría dónde decirlo ni cómo reintentar. Espera a saber si
                        debe algo: el aviso tiene que verse ANTES de confirmar */}
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={saving || checking}
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
