import { useState } from 'react'
import { ArrowRightIcon, CheckIcon, CopyIcon, MailIcon, MessageCircleIcon, PhoneIcon, XIcon, ZapIcon } from 'lucide-react'
import { toast } from 'sonner'

import { GrowthProspect } from '@/interfaces/growth'
import { cn } from '@/lib/utils'
import { initials } from '@/pages/Clients/List/names'
import { money } from '@/pages/Hoy/lib'
import { agoText } from '@/pages/Sales/sales.utils'
import { formatDate } from '@/utils/dates'

import { recentlyWritten, registeredText, sourceLabel, sourceTone, suggestedMessage, waFor, whyNow } from '../growth.utils'
import { GrowthActions } from '../useGrowth'

const STEPS = ['Se registró', 'Usa la app', 'Quiere pagar', 'Pagó']

const copy = async (value: string, done = 'Copiado') => {
    try {
        await navigator.clipboard.writeText(value)
        toast.success(done)
    } catch {
        toast.error('No se pudo copiar solo: selecciónalo a mano')
    }
}

/**
 * Un prospecto: quién es, de dónde llegó, qué señales dio y el mensaje para escribirle. El canto de color dice su
 * grupo; los botones cambian con él (una «lista» pasa a Ventas, una «fría» se puede dejar).
 */
const ProspectRow = ({ row, index, actions }: { row: GrowthProspect, index: number, actions: GrowthActions }) => {
    const [open, setOpen] = useState(false)
    const message = suggestedMessage(row)
    const wa = waFor(row, message)
    const working = actions.busy === row.key
    const written = recentlyWritten(row)
    const step = row.group === 'lista' ? 3 : row.uses_app ? 2 : 1
    const staleWritten = row.contact?.action === 'written' && !written

    return (
        <article
            data-g={row.group}
            style={{ '--i': Math.min(index, 8) + 1 } as React.CSSProperties}
            className={cn('vta-row gro-row shell-glass pulse-rise', written && 'is-done')}
        >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-[12.5px] font-extrabold text-primary">{initials(row.name)}</span>
                    <div className="min-w-0">
                        <b className="block truncate text-[14.5px] leading-tight font-extrabold">{row.name}</b>
                        <small className="block truncate text-[11.5px] text-muted-foreground">
                            {[row.rank ?? row.profile, row.account, row.plan && `${row.plan.name}${row.on_trial ? ' (prueba)' : ''}`].filter(Boolean).join(' · ') || 'Sin cuenta todavía'}
                        </small>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('pulse-tag', sourceTone(row.source))}>{sourceLabel(row.source)}</span>
                    {written
                        ? <span className="pulse-tag ok" title={row.contact?.at ? formatDate(new Date(row.contact.at), { date: 'medium', time: 'short' }) : undefined}>
                            <CheckIcon className="size-3" /> Le {row.contact?.by ? `escribió ${row.contact.by.split(' ')[0]}` : 'escribiste'} {agoText(row.contact?.at)}
                        </span>
                        : <span className={cn('pulse-tag', staleWritten ? 'warn' : row.group === 'fria' ? 'bad' : 'plain')} title={formatDate(new Date(row.registered_at), { date: 'medium', time: 'short' })}>
                            {staleWritten ? `Sin respuesta desde ${agoText(row.contact?.at)}` : registeredText(row.registered_at)}
                        </span>}
                </div>
            </div>

            {row.signals.length > 0 && (
                <div className="gro-signals mt-3">
                    {row.signals.map(signal => <span key={signal}><ZapIcon className="size-3.5" />{signal}</span>)}
                </div>
            )}

            {row.group === 'lista' && row.suggested_plan && (
                <p className="vta-asks mt-2 text-[13.5px] leading-snug font-semibold">
                    Le va el <em>Plan {row.suggested_plan.name.replace(/^Plan\s+/i, '')}</em>
                    {row.suggested_plan.price > 0 && (
                        <span className="ml-2 inline-block align-middle text-[12px] font-extrabold text-emerald-600 tabular-nums dark:text-emerald-400">
                            +{money(row.suggested_plan.price)} al mes
                        </span>
                    )}
                </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-3">
                {row.phone && <button type="button" className="vta-copy" onClick={() => copy(row.phone!)}><PhoneIcon className="size-3.5 shrink-0" /><span className="truncate">{row.phone}</span></button>}
                {row.email && <button type="button" className="vta-copy" onClick={() => copy(row.email!)}><MailIcon className="size-3.5 shrink-0" /><span className="truncate">{row.email}</span></button>}
                {!row.phone && <span className="text-[11.5px] text-muted-foreground">Sin WhatsApp registrado: escríbele por correo</span>}
            </div>

            {open && (
                <div className="gro-msg mt-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="gro-msg-label">Mensaje sugerido · con tu voz</span>
                        <button type="button" className="vta-btn ghost" onClick={() => copy(message, 'Mensaje copiado')}><CopyIcon className="size-3.5" /> Copiar</button>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">{message}</p>
                    <p className="mt-2 text-[11.5px] text-muted-foreground">Por qué hoy: {whyNow(row)}</p>
                </div>
            )}

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-3">
                <div className="vta-steps">
                    {STEPS.map((label, i) => (
                        <span key={label} className={cn(i + 1 < step && 'done', i + 1 === step && 'now')}>
                            {i > 0 && <b className={cn(i < step && 'done')} />}
                            <i />
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {(row.group === 'fria' || row.kind === 'whatsapp') && (
                        <button type="button" disabled={working} className="vta-btn ghost" onClick={() => actions.log(row, 'dropped')}>
                            <XIcon className="size-3.5" /> Dejarla
                        </button>
                    )}
                    <button type="button" className="vta-btn ghost" onClick={() => setOpen(value => !value)}>
                        <MessageCircleIcon className="size-3.5" /> {open ? 'Ocultar mensaje' : 'Ver mensaje'}
                    </button>
                    {wa && <a href={wa} target="_blank" rel="noreferrer" className="vta-btn wa">WhatsApp</a>}
                    {row.kind === 'account' && row.group === 'lista'
                        ? <button type="button" disabled={working} className="vta-btn gro-primary" onClick={() => actions.toSales(row)}>
                            Pasar a Ventas <ArrowRightIcon className="size-3.5" />
                        </button>
                        : !written && (
                            <button type="button" disabled={working} className="vta-btn" onClick={() => actions.log(row, 'written')}>
                                <CheckIcon className="size-3.5" /> Ya le escribí
                            </button>
                        )}
                </div>
            </div>
        </article>
    )
}

export default ProspectRow
