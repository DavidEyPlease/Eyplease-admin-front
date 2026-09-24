import { CheckIcon, GiftIcon, MailIcon, PackageIcon, PhoneIcon, RotateCcwIcon, TrendingUpIcon, UserPlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { initials } from '@/pages/Clients/List/names'
import { money } from '@/pages/Hoy/lib'
import { formatDate } from '@/utils/dates'

import { agoText, waitText, waitTone } from '../sales.utils'
import { SalesActions, SalesRow } from '../useSales'

const KIND: Record<SalesRow['kind'], { icon: typeof GiftIcon, label: string }> = {
    gift: { icon: GiftIcon, label: 'Regalo' },
    interest: { icon: TrendingUpIcon, label: 'Quiere subir' },
    prospect: { icon: UserPlusIcon, label: 'Directora invitada' },
}

/** Teléfono y correo: un clic y ya están en el portapapeles, sin abrir la ficha. */
const Copy = ({ icon: Icon, value }: { icon: typeof PhoneIcon, value: string | null }) => !value ? null : (
    <button
        type="button"
        title={`Copiar ${value}`}
        className="vta-copy"
        onClick={async () => {
            try {
                await navigator.clipboard.writeText(value)
                toast.success('Copiado')
            } catch {
                /* Sin permiso de portapapeles (o en http) no hay copia silenciosa: al menos que lo vea entero */
                toast.error(`No se pudo copiar sola: ${value}`)
            }
        }}
    >
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{value}</span>
    </button>
)

/** Lo pidió · Contactada · Activado — con un vistazo se ve dónde se quedó. */
const Steps = ({ steps, step }: { steps: string[], step: number }) => (
    <div className="vta-steps">
        {steps.map((label, index) => (
            <span key={label} className={cn(index + 1 < step && 'done', index + 1 === step && 'now')}>
                {index > 0 && <b className={cn(index < step && 'done')} />}
                <i />
                {label}
            </span>
        ))}
    </div>
)

/**
 * Una fila de la fila de ventas: a quién le hablas, qué pide, cuánto lleva esperando, en qué paso
 * va y los botones que mueven ese paso. Las tres listas se pintan con esta misma tarjeta; lo único
 * que cambia es el canto de color, la frase y qué botones tiene.
 */
const QueueRow = ({ row, index, actions }: { row: SalesRow, index: number, actions: SalesActions }) => {
    const kind = KIND[row.kind]
    const Icon = row.kind === 'gift' && row.gift.kind === 'unit_package' ? PackageIcon : kind.icon
    const label = row.kind === 'gift' && row.gift.kind === 'unit_package' ? 'Paquete de unidad' : kind.label
    const working = actions.busy === row.id

    return (
        <article
            data-kind={row.kind}
            style={{ '--i': Math.min(index, 8) + 1 } as React.CSSProperties}
            className={cn('vta-row shell-glass pulse-rise', row.stage === 'done' && 'is-done')}
        >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-[12.5px] font-extrabold text-primary">{initials(row.who.name)}</span>
                    <div className="min-w-0">
                        <b className="block truncate text-[14.5px] leading-tight font-extrabold">{row.who.name}</b>
                        <small className="block truncate text-[11.5px] text-muted-foreground">
                            {[row.who.account, row.who.plan].filter(Boolean).join(' · ') || 'Todavía no está en el padrón'}
                        </small>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <span className="pulse-tag plain"><Icon className="size-3" /> {label}</span>
                    {/* Lo que espera dice cuánto lleva (y se pone rojo); lo tibio, cuándo fue; lo demás,
                        la palabra del paso en el que se quedó */}
                    <span
                        className={cn('pulse-tag', row.stage === 'waiting' ? waitTone(row.since) : row.stage === 'warm' ? 'plain' : 'ok')}
                        title={formatDate(new Date(row.since), { date: 'medium', time: 'short' })}
                    >
                        {row.stage === 'waiting' ? waitText(row.since) : row.stage === 'warm' ? agoText(row.since) : row.steps[row.step - 1]}
                    </span>
                </div>
            </div>

            <p className="vta-asks mt-3 text-[14px] leading-snug font-semibold">
                {row.asks.pre} <em>{row.asks.strong}</em> {row.asks.post}
                {row.monthly > 0 && (
                    <span className="ml-2 inline-block align-middle text-[12px] font-extrabold text-emerald-600 tabular-nums dark:text-emerald-400">
                        +{money(row.monthly)} al mes
                    </span>
                )}
            </p>

            {row.note && <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{row.note}</p>}

            <div className="mt-2 flex flex-wrap items-center gap-x-3">
                <Copy icon={PhoneIcon} value={row.who.phone} />
                <Copy icon={MailIcon} value={row.who.email} />
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-3">
                <Steps steps={row.steps} step={row.step} />
                <div className="flex flex-wrap items-center gap-2">
                    {row.wa.map(link => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="vta-btn wa">{link.label}</a>
                    ))}

                    {row.kind === 'gift' && !row.gift.contacted_at && (
                        <button type="button" disabled={working} className="vta-btn" onClick={() => actions.setGiftContacted(row, true)}>
                            <CheckIcon className="size-3.5" /> Ya la contacté
                        </button>
                    )}
                    {row.kind === 'gift' && row.gift.contacted_at && !row.gift.fulfilled_at && <>
                        <button type="button" disabled={working} className="vta-btn" onClick={() => actions.setGiftFulfilled(row, true)}>
                            <CheckIcon className="size-3.5" /> Ya quedó activado
                        </button>
                        <button type="button" disabled={working} title="No la he contactado" className="vta-btn ghost" onClick={() => actions.setGiftContacted(row, false)}>
                            <RotateCcwIcon className="size-3.5" /> Aún no
                        </button>
                    </>}
                    {row.kind === 'gift' && row.gift.fulfilled_at && (
                        <button type="button" disabled={working} title="Volver a dejarlo por activar" className="vta-btn ghost" onClick={() => actions.setGiftFulfilled(row, false)}>
                            <RotateCcwIcon className="size-3.5" /> No quedó
                        </button>
                    )}

                    {row.kind === 'interest' && !row.interest.contacted_at && (
                        <button type="button" disabled={working} className="vta-btn" onClick={() => actions.setInterestContacted(row, true)}>
                            <CheckIcon className="size-3.5" /> Ya la contacté
                        </button>
                    )}
                    {row.kind === 'interest' && row.interest.contacted_at && (
                        <button type="button" disabled={working} title="Regresarla a la fila" className="vta-btn ghost" onClick={() => actions.setInterestContacted(row, false)}>
                            <RotateCcwIcon className="size-3.5" /> Aún no
                        </button>
                    )}

                    {/* Las Directoras invitadas no se marcan: el premio se da solo cuando entra con ese correo */}
                    {row.kind === 'prospect' && row.stage === 'closing' && (
                        <span className="text-[11.5px] font-semibold text-muted-foreground">El premio se le da a mano</span>
                    )}
                </div>
            </div>
        </article>
    )
}

export default QueueRow
