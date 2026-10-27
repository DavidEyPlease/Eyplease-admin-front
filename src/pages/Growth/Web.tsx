import { useState } from 'react'
import { FileTextIcon, MessageCircleIcon, MessagesSquareIcon, SmartphoneIcon, UserPlusIcon, UsersIcon } from 'lucide-react'

import { GrowthPeriod, GrowthWebCounts } from '@/interfaces/growth'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'

import GrowthTabs from './components/GrowthTabs'
import { sourceLabel, sourceTone } from './growth.utils'
import { useGrowthWeb } from './useGrowth'
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import './growth.css'

const PERIODS: Array<{ key: GrowthPeriod, label: string, text: string }> = [
    { key: 'semana', label: 'Esta semana', text: 'en 7 días' },
    { key: 'mes', label: 'Este mes', text: 'en 30 días' },
    { key: 'trimestre', label: '90 días', text: 'en 90 días' },
]

const KPIS: Array<{ key: keyof GrowthWebCounts, label: string, sub: string, icon: typeof UsersIcon }> = [
    { key: 'visits', label: 'Visitas', sub: 'Personas distintas por día', icon: UsersIcon },
    { key: 'phone', label: 'Desde el teléfono', sub: 'Donde vive la Directora', icon: SmartphoneIcon },
    { key: 'whatsapp', label: 'Tocaron WhatsApp', sub: 'Alguno de los botones de la página', icon: MessageCircleIcon },
    { key: 'chat', label: 'Usaron el chat', sub: 'Dejaron sus datos en «Chatea con David»', icon: MessagesSquareIcon },
    { key: 'signups', label: 'Se registraron', sub: 'Cuentas nuevas solas (como en Embudo)', icon: UserPlusIcon },
]

const PAGES: Record<string, string> = {
    '/': 'Inicio',
    '/guia/': 'Guía de la app',
    '/politicas-privacidad/': 'Aviso de privacidad',
    '/presentacion/': 'Presentación',
}
const pageLabel = (path: string) => PAGES[path] ?? path

const pct = (part: number, whole: number) => whole > 0 ? Math.round(part / whole * 100) : 0

const shortDay = (day: string) => {
    const date = new Date(`${day}T12:00:00`)
    return { weekday: date.toLocaleDateString('es-MX', { weekday: 'narrow' }), num: date.getDate() }
}
const longDate = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

/** +3 / −2 contra la ventana anterior, en verde o en rojo; nada si no hay con qué comparar. */
const Delta = ({ now, before }: { now: number, before: number }) => {
    if (!before && !now) return null
    const diff = now - before
    if (!diff) return <small className="text-[11.5px] font-bold text-muted-foreground">igual que la anterior</small>
    return <small className={cn('text-[11.5px] font-bold', diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{diff > 0 ? '+' : '−'}{Math.abs(diff)} vs. la anterior</small>
}

/**
 * Web: ¿cuánta gente entra a eyplease.com.mx, de dónde llega y cuántas dan el paso? Lo manda la propia web (sin
 * cookies) desde el 27-oct-2026; lo de antes está reconstruido de los registros del servidor.
 */
const GrowthWebPage = () => {
    const [period, setPeriod] = useState<GrowthPeriod>('semana')
    const { response, loading } = useGrowthWeb(period)
    const current = response?.current
    const previous = response?.previous
    const text = PERIODS.find(item => item.key === period)?.text ?? ''

    const days = response?.by_day ?? []
    const maxDay = Math.max(1, ...days.map(day => day.visits))
    const sources = response?.by_source ?? []
    const pages = response?.by_page ?? []
    const visits = current?.visits ?? 0
    /* Sin medición en la ventana anterior (antes del 1-oct no hay registros), comparar diría «+145»: mejor nada */
    const hasPrevious = (previous?.views ?? 0) > 0
    const unlabeled = sources.find(row => row.source === 'directo')?.visits ?? 0
    const social = sources.filter(row => row.source === 'instagram' || row.source === 'facebook').reduce((sum, row) => sum + row.visits, 0)

    return (
        <div className="mx-auto grid w-full max-w-[1180px] min-w-0 gap-[18px]">
            {isNewShell()
                ? <PageHead
                    eyebrow="Crecimiento · Web"
                    title={<>{loading ? 'Web.' : `${visits} ${visits === 1 ? 'visita' : 'visitas'}`} <em>{loading ? '' : `${text}.`}</em></>}
                    sub="Cuánta gente entra a eyplease.com.mx, de dónde llega y cuántas dan el paso: WhatsApp, el chat o el registro."
                />
                : <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Web · {text}</h1>}

            <GrowthTabs />

            <div className="flex flex-wrap gap-1.5">
                {PERIODS.map(item => (
                    <button key={item.key} type="button" onClick={() => setPeriod(item.key)} className={cn('gro-chip', period === item.key && 'on')}>{item.label}</button>
                ))}
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-[18px] lg:grid-cols-5">
                {KPIS.map((kpi, index) => {
                    const value = Number(current?.[kpi.key] ?? 0)
                    return (
                        <div key={kpi.key} className="shell-glass pulse-rise min-w-0 rounded-[22px] p-4" style={{ '--i': index } as React.CSSProperties}>
                            <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-muted-foreground"><kpi.icon className="size-3.5" /> {kpi.label}</span>
                            <b className="mt-0.5 block text-[26px] leading-tight font-extrabold tracking-[-.02em] tabular-nums">
                                {loading ? '—' : value}
                                {!loading && kpi.key === 'phone' && visits > 0 && <span className="ml-1.5 text-[13px] font-bold text-muted-foreground">{pct(value, visits)}%</span>}
                            </b>
                            <small className="block text-[11px] text-muted-foreground">{kpi.sub}</small>
                            {previous && (kpi.key === 'signups' || hasPrevious) && <Delta now={value} before={Number(previous[kpi.key] ?? 0)} />}
                        </div>
                    )
                })}
            </div>

            <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px] sm:p-[22px]">
                <h2 className="text-[15px] font-extrabold tracking-tight">Visitas por día <span className="text-[12px] font-medium text-muted-foreground">{text}</span></h2>
                <div className={cn('gro-days mt-4', days.length > 31 && 'dense')}>
                    {days.map((day, index) => {
                        const label = shortDay(day.day)
                        return (
                            <div key={day.day} className="gro-day" title={`${longDate(day.day)}: ${day.visits} ${day.visits === 1 ? 'visita' : 'visitas'} · ${day.views} páginas`}>
                                <span className="gro-day-num">{day.visits || ''}</span>
                                <div className="gro-day-col"><i style={{ height: `${day.visits ? Math.max(4, day.visits / maxDay * 100) : 0}%`, '--i': index } as React.CSSProperties} /></div>
                                {days.length <= 31 && <span className="gro-day-label">{label.weekday}<br />{label.num}</span>}
                            </div>
                        )
                    })}
                </div>
            </section>

            <div className="grid min-w-0 grid-cols-1 gap-[18px] lg:grid-cols-2">
                <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px] sm:p-[22px]">
                    <h2 className="text-[15px] font-extrabold tracking-tight">De dónde llegan <span className="text-[12px] font-medium text-muted-foreground">{text}</span></h2>
                    {!loading && !sources.length && <p className="mt-3 text-[13px] text-muted-foreground">Nadie entró en este periodo.</p>}
                    {sources.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                            <table className="gro-table w-full">
                                <thead><tr><th>Origen</th><th className="num">Visitas</th><th className="num">Teléfono</th><th className="num">WhatsApp</th></tr></thead>
                                <tbody>
                                    {sources.map(row => (
                                        <tr key={row.source}>
                                            <td><span className={cn('pulse-tag', sourceTone(row.source))}>{sourceLabel(row.source)}</span></td>
                                            <td className="num"><b>{row.visits}</b></td>
                                            <td className="num">{row.phone}</td>
                                            <td className="num">{row.whatsapp || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && visits > 0 && (
                        <div className="mt-3 grid gap-2">
                            {social === 0 && (
                                <p className="gro-insight">Instagram y Facebook no mandaron a nadie {text}. La liga de la biografía y de cada publicación tiene que llevar su origen: <code>eyplease.com.mx/?origen=instagram</code>.</p>
                            )}
                            {unlabeled > visits / 2 && (
                                <p className="gro-insight"><b>{unlabeled} de {visits}</b> llegaron sin etiqueta (escribieron la dirección o venían de una liga sin <code>?origen=</code>). Cada liga que publiques debe decir de dónde viene.</p>
                            )}
                        </div>
                    )}
                </section>

                <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px] sm:p-[22px]">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Qué ven <span className="text-[12px] font-medium text-muted-foreground">{text}</span></h2>
                    {!loading && !pages.length && <p className="mt-3 text-[13px] text-muted-foreground">Sin páginas vistas en este periodo.</p>}
                    {pages.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                            <table className="gro-table w-full">
                                <thead><tr><th>Página</th><th className="num">Visitas</th><th className="num">Veces vista</th></tr></thead>
                                <tbody>
                                    {pages.map(row => (
                                        <tr key={row.path}>
                                            <td><span className="flex items-center gap-1.5"><FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" /> {pageLabel(row.path)}</span></td>
                                            <td className="num"><b>{row.visits}</b></td>
                                            <td className="num">{row.views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                Una visita es una persona en un día: si vuelve otro día cuenta otra vez. No se cuentan robots ni buscadores, y no se guarda nada de la persona.
                {response?.measured_since && <> La web lo manda sola desde el {longDate(response.measured_since)}.</>}
                {response?.rebuilt_since && <> Lo de antes está reconstruido de los registros del servidor (desde el {longDate(response.rebuilt_since)}): ahí no hay clics a WhatsApp.</>}
                {' '}Para no contarte a ti, abre una vez <code>eyplease.com.mx/?interno=1</code> en tu teléfono y en tu computadora.
            </p>
        </div>
    )
}

export default GrowthWebPage
