import { cn } from '@/lib/utils'
import { money } from '@/pages/Hoy/lib'

import { SalesKind } from '../useSales'
import ReferralTools from './ReferralTools'

export interface Tally {
    /** Lo que espera respuesta más lo que falta cerrar: el trabajo de hoy */
    pending: number
    /** Ya contactadas, falta activar el plan o dar el premio */
    closing: number
    /** Tocaron candados o miraron planes, pero no lo han pedido */
    warm: number
    done: number
    /** Lo que entraría al mes si se cierra lo pendiente */
    monthly: number
    /** Tratos en curso (aceptaron; falta su primer pago completo) y lo que suman al mes cuando paguen completo */
    deals: number
    dealsMonthly: number
}

export type SalesFilter = 'all' | SalesKind

const mirando = (warm: number) => `y ${warm} ${warm === 1 ? 'anda' : 'andan'} mirando`

const PICKS: Array<{ key: SalesFilter, label: string, sub: (tally: Tally) => string }> = [
    { key: 'all', label: 'Todo', sub: tally => tally.warm ? mirando(tally.warm) : 'lo que hay que atender' },
    { key: 'gift', label: 'Regalos y paquetes', sub: tally => tally.closing ? `${tally.closing} por activar` : 'de Directoras a su unidad' },
    { key: 'interest', label: 'Quieren subir de plan', sub: tally => tally.warm ? mirando(tally.warm) : 'lo pidieron desde la app' },
    { key: 'prospect', label: 'Directoras invitadas', sub: tally => tally.closing ? `${tally.closing} ya ${tally.closing === 1 ? 'entró' : 'entraron'}, falta el premio` : 'las invitó su consultora' },
    { key: 'deal', label: 'Tratos en curso', sub: tally => tally.deals ? `+${money(tally.dealsMonthly)} al mes cuando paguen completo` : 'mes gratis y pruebas de plan' },
    { key: 'referral', label: 'Recomendaciones', sub: tally => tally.deals ? `${tally.deals} con premio corriendo` : 'una Directora invita a otra' },
]

/**
 * La columna de contexto: dónde está el trabajo, cuánto dinero hay esperando y las reglas de la
 * casa. Elegir una lista sólo filtra la fila de la derecha; nada se abre en otra pantalla.
 */
const SalesRail = ({ tally, filter, onFilter }: { tally: Record<SalesFilter, Tally>, filter: SalesFilter, onFilter: (value: SalesFilter) => void }) => {
    const prospects = tally.prospect
    const monthly = tally.all.monthly

    return (<>
        <section className="shell-glass pulse-rise rounded-3xl p-[18px]">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-[14.5px] font-extrabold tracking-tight">La fila</h2>
                <span className={cn('pulse-tag', tally.all.pending ? 'warn' : 'ok')}>{tally.all.pending} por atender</span>
            </div>

            <div className="mt-2 grid gap-0.5">
                {PICKS.map(pick => (
                    <button key={pick.key} type="button" onClick={() => onFilter(pick.key)} className={cn('vta-pick', filter === pick.key && 'on')}>
                        <span className="min-w-0">
                            <b className="block truncate text-[12.5px] font-bold">{pick.label}</b>
                            <small className="truncate">{pick.sub(tally[pick.key])}</small>
                        </span>
                        <b className="text-[17px] leading-none font-extrabold tabular-nums">{pick.key === 'deal' ? tally.deal.deals : pick.key === 'referral' ? tally.referral.pending + tally.referral.deals + tally.referral.warm : tally[pick.key].pending}</b>
                    </button>
                ))}
            </div>
        </section>

        {(monthly > 0 || prospects.pending > 0) && (
            <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 2 } as React.CSSProperties}>
                <h2 className="text-[14.5px] font-extrabold tracking-tight">Si todo esto cierra</h2>
                {monthly > 0 && <>
                    <b className="mt-2 block text-[30px] leading-none font-extrabold tracking-[-.03em] text-emerald-600 tabular-nums dark:text-emerald-400">+{money(monthly)}</b>
                    <small className="mt-1 block text-[11.5px] text-muted-foreground">al mes, con los precios de hoy</small>
                    <p className="mt-2.5 text-[11.5px] leading-snug text-muted-foreground">
                        {[tally.gift.monthly > 0 && `${money(tally.gift.monthly)} de regalos y paquetes`, tally.interest.monthly > 0 && `${money(tally.interest.monthly)} de quienes suben de plan`].filter(Boolean).join(' · ')}
                    </p>
                </>}
                {prospects.pending > 0 && (
                    <p className={cn('text-[11.5px] leading-snug text-muted-foreground', monthly > 0 && 'mt-2.5 border-t border-border pt-2.5')}>
                        Y {prospects.pending} {prospects.pending === 1 ? 'Directora nueva' : 'Directoras nuevas'} por entrar: su cuenta empieza gratis, pero llegan con su unidad.
                    </p>
                )}
            </section>
        )}

        {tally.all.deals > 0 && (
            <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 3 } as React.CSSProperties}>
                <h2 className="text-[14.5px] font-extrabold tracking-tight">Tratos en curso</h2>
                <b className="mt-2 block text-[30px] leading-none font-extrabold tracking-[-.03em] text-emerald-600 tabular-nums dark:text-emerald-400">+{money(tally.all.dealsMonthly)}</b>
                <small className="mt-1 block text-[11.5px] text-muted-foreground">
                    al mes cuando {tally.all.deals === 1 ? 'pague' : `las ${tally.all.deals} paguen`} su primer mes completo
                </small>
            </section>
        )}

        <ReferralTools />

        <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 5 } as React.CSSProperties}>
            <h2 className="text-[14.5px] font-extrabold tracking-tight">Cómo se cierra</h2>
            <ul className="mt-2 grid gap-2 text-[11.5px] leading-snug text-muted-foreground">
                <li>La app no cobra ni dice cómo pagar: todo esto se cierra por WhatsApp o transferencia, aquí afuera.</li>
                <li>Marca <b className="font-bold text-foreground">Ya la contacté</b> en cuanto le escribas, y <b className="font-bold text-foreground">Ya quedó activado</b> cuando el plan ya esté puesto en su cuenta.</li>
                <li>El premio de la Directora invitada se da solo si entra con <b className="font-bold text-foreground">ese</b> correo; si entra con otro, hay que dárselo a mano.</li>
                <li>Si un pedido no era venta, <b className="font-bold text-foreground">Quitar</b> lo saca de la fila sin borrarlo.</li>
                <li>Los tratos salen solos de Finanzas (regreso con mes gratis, prueba de plan) y se quedan aquí hasta que pagan su primer mes completo.</li>
            </ul>
        </section>
    </>)
}

export default SalesRail
