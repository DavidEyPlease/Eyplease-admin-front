import { useMemo, useState } from 'react'
import { AlertTriangleIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'

import { SocialPost } from '@/interfaces/social'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'

import GrowthTabs from './components/GrowthTabs'
import SocialPostSheet from './components/SocialPostSheet'
import { STATUS, addDays, channelsText, dayText, formatLabel, missingToApprove, sameDay, timeText, weekStart, ymd } from './social.utils'
import { useSocialActions, useSocialCalendar } from './useSocial'
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import './growth.css'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const Thumb = ({ post, className }: { post: Pick<SocialPost, 'media'>, className?: string }) => {
    const first = post.media[0]
    if (!first) return <span className={cn('soc-thumb empty', className)} />
    return first.type === 'video'
        ? <video src={first.url} muted playsInline className={cn('soc-thumb', className)} />
        : <img src={first.url} alt="" className={cn('soc-thumb', className)} />
}

/**
 * Redes: el calendario de Facebook e Instagram de Eyplease+. Arriba lo que espera tu aprobación (si no lo apruebas, no
 * sale); luego dos semanas de calendario; abajo cómo va el mes. Lo aprobado lo publica solo el servidor a su hora.
 */
const GrowthSocialPage = () => {
    const [start, setStart] = useState(() => weekStart())
    const { response, loading } = useSocialCalendar(start)
    const actions = useSocialActions()
    const [sheet, setSheet] = useState<{ open: boolean, post: SocialPost | null, date?: string | null }>({ open: false, post: null })

    const items = useMemo(() => response?.items ?? [], [response])
    const pending = items.filter(post => post.status === 'review')
    const failed = items.filter(post => post.status === 'failed')
    const undated = items.filter(post => !post.scheduled_at)
    const days = Array.from({ length: 14 }, (_, index) => addDays(start, index))
    const today = new Date()
    const month = response?.month
    const meta = response?.meta
    const arrivals = month?.arrivals ?? {}

    const openPost = (post: SocialPost) => setSheet({ open: true, post })
    const verdict = pending.length ? `${pending.length} por aprobar.` : failed.length ? `${failed.length} no ${failed.length === 1 ? 'salió' : 'salieron'}.` : 'Todo al día.'

    return (
        <div className="mx-auto grid w-full max-w-[1180px] min-w-0 gap-[18px]">
            {isNewShell()
                ? <PageHead
                    eyebrow="Crecimiento · Redes"
                    title={<>Redes. <em className={cn(!pending.length && !failed.length && '!bg-none !text-emerald-600 dark:!text-emerald-400')}>{loading ? '' : verdict}</em></>}
                    sub="El calendario de Instagram y Facebook. Tú apruebas; lo aprobado se publica solo a su hora."
                >
                    <button type="button" className="vta-btn gro-primary" onClick={() => setSheet({ open: true, post: null })}><PlusIcon className="size-3.5" /> Nueva publicación</button>
                </PageHead>
                : <div className="flex items-center justify-between gap-3"><h1 className="text-xl font-bold tracking-tight sm:text-2xl">Redes · {verdict}</h1><button type="button" className="vta-btn gro-primary" onClick={() => setSheet({ open: true, post: null })}><PlusIcon className="size-3.5" /> Nueva</button></div>}

            <GrowthTabs />

            {meta && !meta.ready && (
                <p className="flex items-start gap-2 rounded-[18px] border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-[12.5px] text-amber-700 dark:text-amber-300">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span><b>Todavía no puede publicar solo.</b> {meta.reason} Puedes planear y aprobar; en cuanto esté la llave, lo programado sale.</span>
                </p>
            )}

            <div className="grid min-w-0 grid-cols-2 gap-[14px] lg:grid-cols-4">
                {[
                    { label: `Publicadas en ${month?.label ?? 'el mes'}`, value: month?.published ?? 0, sub: `de ${month?.planned ?? 0} planeadas` },
                    { label: 'Alcance del mes', value: (month?.reach ?? 0).toLocaleString('es-MX'), sub: 'personas que las vieron' },
                    { label: 'Llegaron por Instagram', value: arrivals.instagram ?? 0, sub: 'cuentas nuevas por la liga de la bio' },
                    { label: 'Llegaron por Facebook', value: arrivals.facebook ?? 0, sub: 'cuentas nuevas por sus ligas' },
                ].map((kpi, index) => (
                    <div key={kpi.label} className="shell-glass pulse-rise min-w-0 rounded-[22px] p-4" style={{ '--i': index } as React.CSSProperties}>
                        <span className="block truncate text-[11.5px] font-bold text-muted-foreground">{kpi.label}</span>
                        <b className="mt-0.5 block text-[24px] leading-tight font-extrabold tracking-[-.02em] tabular-nums">{loading ? '—' : kpi.value}</b>
                        <small className="text-[11.5px] text-muted-foreground">{kpi.sub}</small>
                    </div>
                ))}
            </div>

            {[...failed, ...pending].length > 0 && (
                <section className="grid gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-2.5">
                        <i className="gro-dot" style={{ background: '#E5077D' }} />
                        <h2 className="text-[15px] font-extrabold tracking-tight">Por aprobar</h2>
                        <span className="text-[11.5px] text-muted-foreground">· si no la apruebas, no sale</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {[...failed, ...pending].map((post, index) => {
                            const missing = missingToApprove(post)
                            return (
                                <article key={post.id} className="soc-card shell-glass pulse-rise" style={{ '--i': index } as React.CSSProperties}>
                                    <button type="button" className="shrink-0" onClick={() => openPost(post)}><Thumb post={post} className="h-full w-[108px]" /></button>
                                    <div className="grid min-w-0 flex-1 content-start gap-1.5 p-3">
                                        <button type="button" onClick={() => openPost(post)} className="truncate text-left text-[14px] font-extrabold">{post.title}</button>
                                        <div className="flex flex-wrap gap-1">
                                            <span className={cn('pulse-tag', STATUS[post.status].tone)}>{STATUS[post.status].label}</span>
                                            <span className="pulse-tag">{formatLabel(post.format)}</span>
                                        </div>
                                        <small className="text-[11.5px] text-muted-foreground">{dayText(post.scheduled_at)}{post.scheduled_at && ` · ${timeText(post.scheduled_at)}`} · {channelsText(post.channels)}</small>
                                        {post.status === 'failed' && post.last_error && <small className="line-clamp-2 text-[11.5px] text-rose-600 dark:text-rose-400">{post.last_error}</small>}
                                        {post.status === 'review' && post.caption && <p className="line-clamp-2 text-[12px] text-muted-foreground">{post.caption}</p>}
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            <button
                                                type="button"
                                                disabled={actions.busy === post.id || missing.length > 0}
                                                title={missing.length ? `Falta: ${missing.join(', ')}` : 'Sale sola a su hora'}
                                                className="vta-btn gro-primary"
                                                onClick={() => actions.approve(post)}
                                            >
                                                <CheckIcon className="size-3.5" /> Aprobar
                                            </button>
                                            <button type="button" className="vta-btn" onClick={() => openPost(post)}>Ver completo</button>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </section>
            )}

            <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[16px] sm:p-[20px]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[15px] font-extrabold tracking-tight">
                        Calendario <span className="text-[12px] font-medium text-muted-foreground">{days[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – {days[13].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button type="button" className="vta-btn ghost" title="Semana anterior" onClick={() => setStart(prev => addDays(prev, -7))}><ChevronLeftIcon className="size-4" /></button>
                        <button type="button" className="gro-chip" onClick={() => setStart(weekStart())}>Hoy</button>
                        <button type="button" className="vta-btn ghost" title="Semana siguiente" onClick={() => setStart(prev => addDays(prev, 7))}><ChevronRightIcon className="size-4" /></button>
                    </div>
                </div>
                <div className="soc-cal">
                    {DAYS.map(day => <span key={day} className="soc-cal-h">{day}</span>)}
                    {days.map(day => {
                        const posts = items.filter(post => post.scheduled_at && sameDay(new Date(post.scheduled_at), day))
                        const isToday = sameDay(day, today)
                        return (
                            <div key={ymd(day)} className={cn('soc-day', isToday && 'today', day < addDays(today, -1) && !isToday && 'past')}>
                                <div className="flex items-center justify-between text-[11.5px] font-extrabold text-muted-foreground">
                                    <span>{day.getDate() === 1 ? day.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : day.getDate()}<span className="soc-day-name"> · {DAYS[(day.getDay() + 6) % 7]}</span></span>
                                    <button type="button" title="Nueva publicación este día" className="soc-add" onClick={() => setSheet({ open: true, post: null, date: ymd(day) })}><PlusIcon className="size-3.5" /></button>
                                </div>
                                {posts.map(post => (
                                    <button key={post.id} type="button" className="soc-tile" onClick={() => openPost(post)}>
                                        <Thumb post={post} />
                                        <span className="min-w-0">
                                            <b className="block truncate text-[11px]">{post.title}</b>
                                            <small className="flex items-center gap-1 text-[10.5px] text-muted-foreground"><i className="gro-dot !size-[7px]" style={{ background: STATUS[post.status].dot }} />{timeText(post.scheduled_at)} · {STATUS[post.status].label}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )
                    })}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {(['idea', 'production', 'review', 'scheduled', 'published'] as const).map(status => (
                        <span key={status} className="pulse-tag"><i className="gro-dot !size-[7px]" style={{ background: STATUS[status].dot }} />{STATUS[status].label}</span>
                    ))}
                </div>
                {undated.length > 0 && (
                    <div className="mt-4 border-t border-border pt-3">
                        <h3 className="text-[13px] font-extrabold">Ideas sin fecha <span className="font-medium text-muted-foreground">{undated.length}</span></h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {undated.map(post => (
                                <button key={post.id} type="button" className="soc-tile !w-auto max-w-[260px]" onClick={() => openPost(post)}>
                                    <Thumb post={post} />
                                    <span className="min-w-0"><b className="block truncate text-[11.5px]">{post.title}</b><small className="text-[10.5px] text-muted-foreground">{STATUS[post.status].label}</small></span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <div className="grid min-w-0 grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px]">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Lo que más se vio <span className="text-[12px] font-medium text-muted-foreground">{month?.label}</span></h2>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                        Instagram no deja medir qué post trajo a cada registro (sus ligas no se pueden tocar): eso se ve arriba, por red y por semana, con la liga de la bio.
                    </p>
                    {!month?.best.length && <p className="mt-3 text-[13px] text-muted-foreground">Todavía no hay publicaciones con números este mes.</p>}
                    <div className="mt-3 grid gap-2.5">
                        {month?.best.map((post, index) => (
                            <button key={post.id} type="button" className="grid grid-cols-[20px_44px_minmax(0,1fr)_auto] items-center gap-3 text-left" onClick={() => { const full = items.find(item => item.id === post.id); if (full) openPost(full) }}>
                                <b className="text-center text-[13px] text-muted-foreground">{index + 1}</b>
                                {post.thumb ? <img src={post.thumb} alt="" className="h-[55px] w-[44px] rounded-[10px] object-cover" /> : <span className="soc-thumb empty h-[55px] w-[44px]" />}
                                <span className="min-w-0"><b className="block truncate text-[13px]">{post.title}</b><small className="text-[11.5px] text-muted-foreground">{formatLabel(post.format)} · {dayText(post.published_at)}</small></span>
                                <span className="text-right"><b className={cn('block text-[18px] tabular-nums', index === 0 && 'shell-title')}>{post.reach.toLocaleString('es-MX')}</b><small className="text-[11px] text-muted-foreground">la vieron</small></span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="shell-glass pulse-rise min-w-0 rounded-3xl p-[18px]">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Equilibrio del mes</h2>
                    <div className="mt-3 grid gap-2.5">
                        {month?.pillars.map(pillar => {
                            const scale = Math.max(6, ...(month?.pillars.map(item => Math.max(item.count, item.target)) ?? [6]))
                            return (
                                <div key={pillar.key} className="grid gap-1">
                                    <div className="flex justify-between text-[12.5px]"><span>{pillar.label}</span><span className={cn('tabular-nums text-muted-foreground', pillar.count < pillar.target && 'text-amber-600 dark:text-amber-400')}>{pillar.count} de {pillar.target}</span></div>
                                    <div className="soc-pillar"><i style={{ width: `${pillar.count / scale * 100}%` }} /><u style={{ left: `${pillar.target / scale * 100}%` }} /></div>
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-3 text-[11.5px] text-muted-foreground">La rayita es lo que toca al mes. La <b className="text-foreground">prueba social</b> es la que más convierte con esta audiencia: que nunca quede corta.</p>
                </section>
            </div>

            <SocialPostSheet
                open={sheet.open}
                post={sheet.post}
                defaultDate={sheet.date}
                pillars={response?.pillars ?? []}
                actions={actions}
                onClose={() => setSheet(prev => ({ ...prev, open: false }))}
                onSaved={post => setSheet({ open: true, post })}
            />
        </div>
    )
}

export default GrowthSocialPage
