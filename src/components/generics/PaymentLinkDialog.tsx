import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon, CreditCardIcon, Loader2Icon, MessageCircleIcon, TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/uishadcn/ui/dialog'
import FinanceService, { CardLinkResult } from '@/services/finance.service'
import { formatMoney, periodLabel } from '@/utils/finance'

interface Props {
    /** Número de cuenta de la clienta: el servidor saca de ahí los meses y el importe */
    account: string | null
    /** Cómo se llama, para el título y el mensaje de WhatsApp */
    name: string
    onClose: () => void
}

const expiry = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

/** «martes, 22 de septiembre, 8:10 a.m.» ya trae su punto al final: no se le pone otro */
const until = (iso: string) => expiry.format(new Date(iso))
const withPeriod = (text: string) => text.endsWith('.') ? text : `${text}.`

/** «septiembre 2026» — el mes con su año, que es como lo lee ella en Stripe */
const monthYear = (period: string) => `${periodLabel(period).toLocaleLowerCase('es-MX')} ${period.slice(0, 4)}`

/**
 * La liga de pago con tarjeta para MANDARLE a una clienta: pago único, sin domiciliar su tarjeta.
 *
 * El panel sólo dice quién. Los meses y el importe los pone el servidor desde el libro de pagos, así
 * que no hay nada que teclear ni forma de cobrar de más; y al pagarse se abona justo eso, mes por mes.
 * La liga se ENSEÑA (con su botón de copiar y el de WhatsApp) en vez de abrirse: quien la paga es ella,
 * no el equipo. Pedirla dos veces devuelve la misma mientras le quede vida.
 */
const PaymentLinkDialog = ({ account, name, onClose }: Props) => {
    const [link, setLink] = useState<CardLinkResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<'link' | 'message' | null>(null)
    const input = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!account) return

        let alive = true
        setLink(null)
        setError(null)
        setCopied(null)

        FinanceService.createCardLink(account)
            .then(result => { if (alive) setLink(result) })
            .catch((failure: Error) => { if (alive) setError(failure.message) })

        return () => { alive = false }
    }, [account])

    /* El padrón trae los nombres en mayúsculas: «LAURA» → «Laura» */
    const first = (name.trim().split(/\s+/)[0] ?? '').toLocaleLowerCase('es-MX')
    const firstName = first.charAt(0).toLocaleUpperCase('es-MX') + first.slice(1)

    /* Con la voz de David para WhatsApp (00_Manuales/voz-y-tono.md): «usted» con clientas pero en tono
       de conocido, saludo breve, una idea por renglón, sin emojis y cerrando con una pregunta abierta */
    const message = link
        ? [
            `Hola, ${firstName}.`,
            `Le comparto su liga para pagar con tarjeta su mensualidad de Eyplease+ (${formatMoney(link.amount)}):`,
            link.checkout_url,
            'Es un pago único: su tarjeta no se queda guardada ni se le cobra sola después.',
            withPeriod(`Sirve hasta el ${until(link.expires_at)}`),
            '¿Tiene alguna duda con el pago?',
        ].join('\n')
        : ''

    const copy = async (what: 'link' | 'message') => {
        if (!link) return
        const text = what === 'link' ? link.checkout_url : message

        try {
            await navigator.clipboard.writeText(text)
            setCopied(what)
            toast.success(what === 'link' ? 'Liga copiada' : 'Mensaje copiado, listo para pegar')
        } catch {
            /* Sin permiso de portapapeles (o en http): se selecciona para copiarla a mano */
            input.current?.select()
            toast.error('No se pudo copiar sola: ya quedó seleccionada, cópiala con ⌘C')
        }
    }

    return (
        <Dialog open={!!account} onOpenChange={open => { if (!open) onClose() }}>
            <DialogContent className="max-w-[500px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[18px] font-extrabold tracking-tight">
                        <CreditCardIcon className="size-5 text-primary" /> Liga de pago para {firstName}
                    </DialogTitle>
                    <DialogDescription className="text-[13px] text-muted-foreground">
                        Pago único con tarjeta: su tarjeta no se queda guardada ni se le cobra sola después.
                    </DialogDescription>
                </DialogHeader>

                {!link && !error && (
                    <div className="flex items-center gap-2.5 rounded-2xl bg-foreground/[.04] px-4 py-5 text-[13px] text-muted-foreground">
                        <Loader2Icon className="size-4 animate-spin" /> Generando la liga con lo que debe…
                    </div>
                )}

                {error && (
                    <p className="flex gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-[13px] text-amber-800 dark:text-amber-300">
                        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" /> {error}
                    </p>
                )}

                {link && (
                    <div className="grid gap-3.5">
                        <div className="rounded-2xl bg-foreground/[.04] px-4 py-3">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">Va a pagar</span>
                                <b className="text-[20px] font-extrabold tabular-nums">{formatMoney(link.amount)}</b>
                            </div>
                            <ul className="mt-1.5 grid gap-0.5 text-[12.5px] text-muted-foreground">
                                {link.periods.map(item => (
                                    <li key={item.period} className="flex justify-between gap-3">
                                        <span className="first-letter:uppercase">{monthYear(item.period)}</span>
                                        <span className="tabular-nums">{formatMoney(item.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <input
                                ref={input}
                                readOnly
                                value={link.checkout_url}
                                onFocus={event => event.target.select()}
                                aria-label="Liga de pago"
                                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 font-mono text-[12px] text-muted-foreground outline-none focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={() => copy('link')}
                                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[13px] font-bold text-white"
                            >
                                {copied === 'link' ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                                {copied === 'link' ? 'Copiada' : 'Copiar'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => copy('message')}
                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border text-[13px] font-bold text-foreground transition-colors hover:bg-foreground/[.04]"
                        >
                            {copied === 'message' ? <CheckIcon className="size-4 text-emerald-500" /> : <MessageCircleIcon className="size-4" />}
                            {copied === 'message' ? 'Mensaje copiado' : 'Copiar mensaje para WhatsApp'}
                        </button>

                        <p className="text-[12px] text-muted-foreground">
                            Sirve hasta el <b className="font-semibold text-foreground">{withPeriod(until(link.expires_at))}</b> En cuanto pague,
                            su pago se registra solo en Cobranza.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default PaymentLinkDialog
