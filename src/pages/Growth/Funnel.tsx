import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon, CreditCardIcon, SmartphoneIcon, SparklesIcon, UserPlusIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { GrowthFunnelCounts, GrowthPeriod } from '@/interfaces/growth'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { money } from '@/pages/Hoy/lib'

import GrowthTabs from './components/GrowthTabs'
import { sourceLabel, sourceTone } from './growth.utils'
import { useGrowthFunnel } from './useGrowth'
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import './growth.css'

const PERIODS: Array<{ key: GrowthPeriod, label: string, text: string }> = [
    { key: 'semana', label: 'Esta semana', text: 'esta semana' },
    { key: 'mes', label: 'Este mes', text: 'en 30 días' },
    { key: 'trimestre', label: '90 días', text: 'en 90 días' },
]

const STEPS: Array<{ key: keyof GrowthFunnelCounts, label: string, sub: string, icon: typeof UserPlusIcon }> = [
    { key: 'registered', label: 'Se registraron', sub: 'Solas, en la app o en la web', icon: UserPlusIcon },
    { key: 'uses', label: 'Usan la app', sub: 'Volvieron después de su primer día', icon: SmartphoneIcon },
    { key: 'wants', label: 'Quieren pagar', sub: 'Miraron o pidieron un plan', icon: SparklesIcon },
    { key: 'pays', label: 'Pagan', sub: 'Ya tienen un pago cobrado', icon: CreditCardIcon },
]

const pct = (part: number, whole: number) => whole > 0 ? Math.round(part / whole * 1000) / 10 : 0

/** +3 / −2 contra la ventana anterior, en verde o en rojo; nada si no hay con qué comparar. */
const Delta = ({ now, before }: { now: number, before: number }) => {
    if (!before && !now) return null
    const diff = now - before
    if (!diff) return <small className="text-[11.5px] font-bold text-muted-foreground">igual que la anterior</small>
    return <small className={cn('text-[11.5px] font-bold', diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{diff > 0 ? '+' : '−'}{Math.abs(diff)} vs. la anterior</small>
}

/**
 * Embudo: ¿dónde se me están quedando? Las cuentas que se registran solas, escalón por escalón hasta el pago, contra
 * la ventana anterior; el escalón donde más se pierde, en rojo y con la liga a quién rescatar; y de qué origen vienen
 * las que pagan.
 */
const GrowthFunnelPage = () => {
    const [period, setPeriod] = useState<GrowthPeriod>('semana')
    const { response, loading } = useGrowthFunnel(period)
    const current = response?.current
    const previous = response?.previous
    const text = PERIODS.find(item => item.key === period)?.text ?? ''

    const values = STEPS.map(step => Number(current?.[step.key] ?? 0))
    const conversions = values.slice(1).map((value, index) => pct(value, values[index]))
    /* La fuga: el paso con peor conversión (sólo si hay gente suficiente para que signifique algo) */
    const leak = values[0] >= 3 ? conversions.indexOf(Math.min(...conversions)) : -1
    const max = Math.max(values[0], 1)

    const sources = current?.by_source ?? []
    const conversion = (row: { pays: number, registered: number }) => pct(row.pays, row.registered)
    const best = Math.max(0, ...sources.filter(row => row.registered >= 3).map(conversion))
    const unlabeled = sources.filter(row => row.source === 'directo' || row.source === 'sin').reduce((sum, row) => sum + row.registered, 0)
    const invite = sources.find(row => row.source === 'invitacion')
    const social = sources.filter(row => row.source === 'instagram' || row.source === 'facebook')
    const socialReg = social.reduce((sum, row) => sum + row.registered, 0)
    const socialPays = social.reduce((sum, row) => sum + row.pays, 0)

    return (
        <div className="mx-auto grid w-full max-w-[1180px] min-w-0 gap-[18px]">
            {isNewShell()
                ? <PageHead
                    eyebrow="Crecimiento · Embudo"
                    title={<>{loading ? 'Embudo.' : `${current?.registered ?? 0} ${current?.registered === 1 ? 'se registró' : 'se registraron'}`} <em>{loading ? '' : `${text}.`}</em></>}
                    sub="Cada escalón, del registro al pago. El porcentaje en rojo es donde más gente se te va: ahí se trabaja primero."
                />
                : <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Embudo · {text}</h1>}

            <GrowthTabs />

            <section className="shell-glass pulse-rise rounded-3xl p-[18px] sm:p-[22px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Del registro al pago <span className="text-[12px] font-medium text-muted-foreground">{text}</span></h2>
                    <div className="flex flex-wrap gap-1.5">
                        {PERIODS.map(item => (
                            <button key={item.key} type="button" onClick={() => setPeriod(item.key)} className={cn('gro-chip', period === item.key && 'on')}>{item.label}</button>
                        ))}
                    </div>
                </div>

                <div className="gro-funnel mt-4">
                    {STEPS.map((step, index) => (
                        <div key={step.key} className="gro-step" style={{ '--i': index } as React.CSSProperties}>
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground"><step.icon className="size-3.5" /> {step.label}</span>
                            <b className="mt-1 block text-[30px] leading-tight font-extrabold tracking-[-.03em] tabular-nums">{loading ? '—' : values[index]}</b>
                            <small className="block text-[11px] text-muted-foreground">{step.sub}</small>
                            {previous && <Delta now={values[index]} before={Number(previous[step.key] ?? 0)} />}
                            <div className="gro-bar mt-3"><i style={{ width: `${Math.max(3, Math.sqrt(values[index] / max) * 100)}%` }} /></div>
                            {index < STEPS.length - 1 && (
                                <span className={cn('gro-conv', index === leak && 'leak')}>{conversions[index]}% pasan →</span>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-[11.5px] text-muted-foreground">
                    Cuentan las que se registraron solas; las que da de alta el equipo, no. Las barras van en escala de raíz: proporcionales, «Pagan» sería una raya.
                    Lo de antes del registro (quién vio un post, quién tocó la liga) se conecta con Instagram y Facebook en la siguiente etapa.
                </p>
            </section>

            {!loading && (current?.lost ?? 0) > 0 && (
                <section className="gro-leak pulse-rise">
                    <b className="gro-leak-num">{current!.lost}</b>
                    <div className="min-w-0">
                        <b className="block text-[14.5px] font-extrabold">{current!.lost === 1 ? 'se registró y no volvió' : 'se registraron y no volvieron'} después del primer día.</b>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">Ya te dieron su nombre y su correo. Un mensaje a tiempo rescata a varias; un anuncio más, no.</p>
                    </div>
                    <Link to={`${APP_ROUTES.GROWTH.PROSPECTS}?g=fria`} className="vta-btn gro-primary">Ver a quién escribirle <ArrowRightIcon className="size-3.5" /></Link>
                </section>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-[18px] lg:grid-cols-4">
                {[
                    { label: `Pagan ${text}`, value: loading ? '—' : String(current?.pays ?? 0), sub: previous ? <Delta now={current?.pays ?? 0} before={previous.pays} /> : null },
                    { label: 'Dinero nuevo al mes', value: loading ? '—' : money(current?.monthly ?? 0), sub: <small className="text-[11.5px] text-muted-foreground">lo que suman sus planes</small> },
                    { label: 'Registro → paga', value: loading ? '—' : `${pct(current?.pays ?? 0, current?.registered ?? 0)}%`, sub: <small className="text-[11.5px] text-muted-foreground">de cada 100 que se registran</small> },
                    { label: 'Se perdieron', value: loading ? '—' : String(current?.lost ?? 0), sub: <small className="text-[11.5px] text-muted-foreground">no volvieron tras el primer día</small> },
                ].map((kpi, index) => (
                    <div key={kpi.label} className="shell-glass pulse-rise min-w-0 rounded-[22px] p-4" style={{ '--i': index + 1 } as React.CSSProperties}>
                        <span className="text-[11.5px] font-bold text-muted-foreground">{kpi.label}</span>
                        <b className="mt-0.5 block text-[24px] leading-tight font-extrabold tracking-[-.02em] tabular-nums">{kpi.value}</b>
                        {kpi.sub}
                    </div>
                ))}
            </div>

            <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px] sm:p-[22px]">
                <h2 className="text-[15px] font-extrabold tracking-tight">De dónde vienen las que pagan <span className="text-[12px] font-medium text-muted-foreground">{text}</span></h2>
                {!loading && !sources.length && <p className="mt-3 text-[13px] text-muted-foreground">Nadie se registró en este periodo.</p>}
                {sources.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                        <table className="gro-table w-full">
                            <thead>
                                <tr><th>Origen</th><th className="num">Registros</th><th className="num">Usan</th><th className="num">Pagan</th><th className="hidden sm:table-cell">Convierte</th><th className="num hidden sm:table-cell">Al mes</th></tr>
                            </thead>
                            <tbody>
                                {sources.map(row => {
                                    const rate = conversion(row)
                                    return (
                                        <tr key={row.source} className={cn(best > 0 && rate === best && row.registered >= 3 && 'best')}>
                                            <td><span className={cn('pulse-tag', sourceTone(row.source))}>{sourceLabel(row.source)}</span></td>
                                            <td className="num">{row.registered}</td>
                                            <td className="num">{row.uses}</td>
                                            <td className="num"><b>{row.pays}</b></td>
                                            <td className="hidden sm:table-cell">
                                                <div className="flex items-center gap-2"><div className="gro-bar flex-1"><i style={{ width: `${best ? rate / best * 100 : 0}%` }} /></div><b className="w-12 text-right text-[12px] tabular-nums">{rate}%</b></div>
                                            </td>
                                            <td className="num hidden sm:table-cell">{row.monthly ? money(row.monthly) : '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-3 grid gap-2">
                    {invite && invite.registered >= 3 && socialReg >= 3 && (
                        <p className="gro-insight">
                            La <b>invitación de una consultora</b> convierte {conversion(invite)}%; Instagram y Facebook juntos, {pct(socialPays, socialReg)}%.
                            {' '}Las redes sirven para que te conozcan; la recomendación es la que cierra.
                        </p>
                    )}
                    {unlabeled > 0 && (
                        <p className="gro-insight">
                            <b>{unlabeled} {unlabeled === 1 ? 'llegó' : 'llegaron'} sin etiqueta</b> y no sabemos qué las trajo. Cada liga que publiques debe llevar su origen:
                            {' '}<code>eyplease.com.mx/?origen=instagram</code>, <code>?origen=facebook</code>, <code>?origen=whatsapp</code>…
                        </p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default GrowthFunnelPage
