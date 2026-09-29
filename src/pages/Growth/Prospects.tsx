import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { GrowthGroup, GrowthProspect } from '@/interfaces/growth'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { money } from '@/pages/Hoy/lib'

import ProspectRow from './components/ProspectRow'
import GrowthTabs from './components/GrowthTabs'
import { GROUPS, sourceLabel } from './growth.utils'
import { useGrowthActions, useGrowthProspects } from './useGrowth'
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import './growth.css'

type Filter = 'todas' | GrowthGroup
type Profile = 'todas' | 'Directora' | 'Consultora'

/**
 * Prospectos: ¿a quién le escribo hoy? Las cuentas que se registraron solas y todavía no pagan, más los contactos del
 * bot sin cuenta, en el orden en que conviene escribirles. Cada una trae el mensaje sugerido; la que está lista pasa a
 * Ventas, que es donde se cierra.
 */
const GrowthProspectsPage = () => {
    const { rows, response, loading } = useGrowthProspects()
    const actions = useGrowthActions()
    const [params, setParams] = useSearchParams()

    const filter = (params.get('g') ?? 'todas') as Filter
    const profile = (params.get('perfil') ?? 'todas') as Profile
    const source = params.get('origen') ?? 'todos'
    const setParam = (key: string, value: string, empty: string) => setParams(prev => {
        const next = new URLSearchParams(prev)
        if (value === empty) next.delete(key)
        else next.set(key, value)
        return next
    }, { replace: true })

    const sources = useMemo(() => [...new Set(rows.map(row => row.source))], [rows])
    const shown = useMemo(() => rows.filter(row =>
        (filter === 'todas' || row.group === filter)
        && (profile === 'todas' || row.profile === profile)
        && (source === 'todos' || row.source === source)), [rows, filter, profile, source])

    const count = (group: GrowthGroup) => rows.filter(row => row.group === group).length
    const ready = rows.filter(row => row.group === 'lista')
    const waiting = ready.reduce((sum, row) => sum + (row.suggested_plan?.price ?? 0), 0)
    const withoutPhone = rows.filter(row => !row.phone).length

    const verdict = ready.length
        ? `${ready.length} ${ready.length === 1 ? 'lista' : 'listas'} para pagar.`
        : rows.length ? `${rows.length} por atender.` : 'Nadie en la lista.'

    return (
        <div className="grid min-w-0 grid-cols-1 items-start gap-[18px] xl:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="pulse-rail order-2 grid gap-3.5 xl:order-1 xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-106px)] xl:overflow-y-auto xl:pr-0.5">
                <section className="shell-glass pulse-rise rounded-3xl p-[18px]">
                    <h2 className="text-[14.5px] font-extrabold tracking-tight">Qué atender</h2>
                    <div className="mt-2 grid gap-0.5">
                        <button type="button" onClick={() => setParam('g', 'todas', 'todas')} className={cn('vta-pick', filter === 'todas' && 'on')}>
                            <span className="min-w-0"><b className="block truncate text-[12.5px] font-bold">Todas</b><small>En el orden en que conviene escribirles</small></span>
                            <b className="text-[17px] leading-none font-extrabold tabular-nums">{rows.length}</b>
                        </button>
                        {GROUPS.map(group => (
                            <button key={group.key} type="button" onClick={() => setParam('g', group.key, 'todas')} className={cn('vta-pick', filter === group.key && 'on')}>
                                <span className="min-w-0">
                                    <b className="flex items-center gap-1.5 truncate text-[12.5px] font-bold"><i className="gro-dot" style={{ background: group.color }} />{group.title}</b>
                                    <small>{group.hint}</small>
                                </span>
                                <b className="text-[17px] leading-none font-extrabold tabular-nums">{count(group.key)}</b>
                            </button>
                        ))}
                    </div>
                </section>

                {waiting > 0 && (
                    <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 2 } as React.CSSProperties}>
                        <h2 className="text-[14.5px] font-extrabold tracking-tight">Esperando en «Listas»</h2>
                        <b className="mt-2 block text-[30px] leading-none font-extrabold tracking-[-.03em] text-emerald-600 tabular-nums dark:text-emerald-400">+{money(waiting)}</b>
                        <small className="mt-1 block text-[11.5px] text-muted-foreground">al mes, si las {ready.length} dicen que sí</small>
                    </section>
                )}

                <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 3 } as React.CSSProperties}>
                    <h2 className="text-[14.5px] font-extrabold tracking-tight">Filtrar</h2>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {(['todas', 'Directora', 'Consultora'] as Profile[]).map(value => (
                            <button key={value} type="button" onClick={() => setParam('perfil', value, 'todas')} className={cn('gro-chip', profile === value && 'on')}>
                                {value === 'todas' ? 'Todas' : `${value}s`}
                            </button>
                        ))}
                    </div>
                    {sources.length > 1 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {['todos', ...sources].map(value => (
                                <button key={value} type="button" onClick={() => setParam('origen', value, 'todos')} className={cn('gro-chip', source === value && 'on')}>
                                    {value === 'todos' ? 'Cualquier origen' : sourceLabel(value)}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 4 } as React.CSSProperties}>
                    <h2 className="text-[14.5px] font-extrabold tracking-tight">Reglas de la casa</h2>
                    <ul className="mt-2 grid gap-2 text-[11.5px] leading-snug text-muted-foreground">
                        <li>Una <b className="font-bold text-foreground">lista</b> se atiende el mismo día. Mañana ya se enfrió.</li>
                        <li>A una <b className="font-bold text-foreground">fría</b> se le escribe una vez. Si no contesta, se deja en paz.</li>
                        <li>Nunca «¿qué te pareció?». Siempre un paso concreto.</li>
                        <li>Cuando dice que sí, <b className="font-bold text-foreground">Pasar a Ventas</b>: ahí se activa el plan y se cobra.</li>
                        {response && !response.bot.allowed && <li>Los contactos del WhatsApp sólo salen a quien tiene el módulo de WhatsApp.</li>}
                        {response?.bot.allowed && !response.bot.available && <li className="text-amber-600 dark:text-amber-400">La base del bot no respondió: hoy sólo salen las cuentas.</li>}
                    </ul>
                </section>
            </aside>

            <div className="order-1 mx-auto grid w-full max-w-[780px] min-w-0 gap-[18px] xl:order-2">
                {isNewShell()
                    ? <PageHead eyebrow="Crecimiento · Prospectos" title={<>Prospectos. <em>{verdict}</em></>} sub="Las que se registraron gratis y todavía no pagan, y los que escribieron al WhatsApp, en el orden en que conviene escribirles. Cada una trae su mensaje; tú sólo lo mandas." />
                    : <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Prospectos · {verdict}</h1>}

                <GrowthTabs />

                {!loading && withoutPhone > 0 && (
                    <p className="text-[12px] text-muted-foreground">
                        {withoutPhone} sin WhatsApp: el registro no lo guardaba hasta ahora. Las que se registren desde hoy ya llegan con su número.
                    </p>
                )}

                {loading && <div className="grid gap-3">{Array.from({ length: 4 }, (_, index) => <span key={index} className="h-[160px] animate-pulse rounded-[22px] bg-foreground/[.06]" />)}</div>}

                {!loading && !shown.length && (
                    <p className="rounded-[22px] border border-dashed border-border px-5 py-12 text-center text-[13px] text-muted-foreground">
                        {rows.length ? 'Nadie con ese filtro.' : 'Nadie se ha registrado en los últimos 60 días. En cuanto alguien cree su cuenta gratis o escriba al WhatsApp, aparece aquí.'}
                    </p>
                )}

                {GROUPS.map(group => {
                    const groupRows: GrowthProspect[] = shown.filter(row => row.group === group.key)
                    if (!groupRows.length) return null
                    return (
                        <section key={group.key} className="grid gap-3">
                            <div className="flex flex-wrap items-baseline gap-x-2.5">
                                <i className="gro-dot translate-y-[-1px]" style={{ background: group.color }} />
                                <h2 className="text-[15px] font-extrabold tracking-tight">{group.title}</h2>
                                <span className="text-[11.5px] font-bold text-muted-foreground tabular-nums">{groupRows.length}</span>
                                <span className="text-[11.5px] text-muted-foreground">· {group.hint}</span>
                            </div>
                            {groupRows.map((row, index) => <ProspectRow key={row.key} row={row} index={index} actions={actions} />)}
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

export default GrowthProspectsPage
