import { ReactNode } from "react";
import { ActivityIcon, BriefcaseBusinessIcon, InfoIcon, SmartphoneIcon } from "lucide-react";

import { Country } from "@/constants/countries";
import { periodLabel } from "@/utils/finance";
import MiniBars from "./MiniBars";
import { ago, appDevices, ClientInsights } from "./useClientInsights";

const Stat = ({ label, value, sub }: { label: string, value: ReactNode, sub?: ReactNode }) => (
    <div className="min-w-0 rounded-2xl border border-border bg-card/40 px-3.5 py-3">
        <p className="text-[10.5px] leading-tight font-extrabold tracking-[.1em] text-muted-foreground uppercase">{label}</p>
        <p className="mt-1 truncate text-[22px] leading-tight font-extrabold tracking-tight tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{sub}</p>}
    </div>
)

const monthShort = (period: string) => periodLabel(period).slice(0, 3)
const monthLong = (period: string) => periodLabel(period).toLowerCase()

const Section = ({ icon, title, sub, children }: { icon: ReactNode, title: string, sub?: ReactNode, children: ReactNode }) => (
    <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold"><span className="text-[#6C47FF] dark:text-[#A894FF]">{icon}</span>{title}</h2>
        {sub && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>}
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-5">{children}</div>
    </section>
)

/** Los indicadores de su negocio: los mismos que ella ve en la pestaña Indicadores de su app. */
const Business = ({ data, country }: { data: ClientInsights, country: Country }) => {
    const locale = country === 'COL' ? 'es-CO' : 'es-MX'
    const number = (value: number) => value.toLocaleString(locale)
    const { indicators } = data
    const ordered = indicators.ordered
    const loadedMonths = data.production.filter(month => month.loaded)

    return (
        <Section icon={<BriefcaseBusinessIcon className="size-4" />} title="Su negocio" sub="Lo mismo que ella ve en «Indicadores» de su app, y los puntos de su unidad mes a mes.">
            <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-5">
                <Stat label="Su unidad" value={number(indicators.unit_size)} sub="consultoras" />
                <Stat
                    label="Pidieron este mes"
                    value={ordered.count === null ? '—' : `${number(ordered.count)} de ${number(ordered.total)}`}
                    sub={ordered.count === null ? 'Aún no carga su reporte' : ordered.source === 'hearts' ? 'Según sus corazones' : 'Según su reporte de ventas'}
                />
                <Stat label="Reto de las 5" value={number(indicators.leaders.count)} sub={indicators.leaders.period ? `con 5+ activas · ${monthLong(indicators.leaders.period)}` : 'con 5 o más activas'} />
                <Stat label="Con corazones" value={indicators.with_hearts.count === null ? '—' : number(indicators.with_hearts.count)} sub="Círculo Rosa" />
                <Stat label="Cerca del regalo" value={indicators.near_gift.count === null ? '—' : number(indicators.near_gift.count)} sub="a 3 meses o menos" />
            </div>

            <div className="min-w-0">
                <p className="text-[12.5px] font-bold">Puntos de su unidad <span className="font-semibold text-muted-foreground">· últimos {data.production.length} meses</span></p>
                {loadedMonths.length ? (
                    <div className="mt-3">
                        <MiniBars
                            caption="Puntos de su unidad por mes"
                            format={number}
                            bars={data.production.map(month => ({
                                key: month.month,
                                label: month.current ? `${monthShort(month.month)} · hoy` : monthShort(month.month),
                                value: month.unit_points,
                                pending: !month.loaded,
                                tip: month.loaded ? (
                                    <>
                                        <b className="block font-bold">{periodLabel(month.month)}{month.current ? ' (en curso)' : ''}</b>
                                        Unidad: <b>{number(month.unit_points ?? 0)}</b> pts<br />
                                        Ella: <b>{number(month.own_points ?? 0)}</b> pts<br />
                                        Pidieron: <b>{number(month.ordered ?? 0)}</b>
                                    </>
                                ) : <>{periodLabel(month.month)}: aún no carga su reporte</>,
                            }))}
                        />
                    </div>
                ) : (
                    <p className="mt-2 text-[12.5px] text-muted-foreground">Todavía no hay reportes de ventas cargados para su unidad.</p>
                )}
            </div>
        </Section>
    )
}

/** Dónde se mueve: lo que HIZO en la app y la web (acciones con fecha), ordenado de más a menos. */
const Usage = ({ data }: { data: ClientInsights }) => {
    const { activity, usage } = data
    const devices = appDevices(activity.devices)
    const lastActiveAt = activity.last_active_at ?? activity.last_sign_in_at
    const lastActive = ago(lastActiveAt)
    const daysAway = lastActiveAt ? (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000 : Infinity
    /* Verde si entró esta semana, ámbar si este mes, gris si hace más */
    const dot = daysAway <= 7 ? 'bg-emerald-500' : daysAway <= 30 ? 'bg-amber-500' : 'bg-muted-foreground/40'
    const postsIdle = data.trend.every(month => month.posts_shared === 0)
    const assistantIdle = data.trend.every(month => month.assistant_messages === 0)
    /* Los avisos se marcan leídos de golpe (todos con un toque): no dicen dónde se mueve, van aparte */
    const notifications = usage.areas.find(area => area.key === 'notifications')?.total ?? 0
    const areas = usage.areas.filter(area => area.key !== 'notifications')
    const active = areas.filter(area => area.total > 0)
    const idle = areas.filter(area => area.total === 0)
    const max = Math.max(1, ...active.map(area => area.total))
    const assistant = usage.areas.find(area => area.key === 'assistant')
    const requests = usage.areas.find(area => area.key === 'requests')
    const library = usage.areas.find(area => area.key === 'library')

    const detail = (key: string) => {
        if (key === 'assistant' && assistant?.total) return [assistant.app ? `${assistant.app} desde la app` : null, assistant.web ? `${assistant.web} desde la web` : null].filter(Boolean).join(' · ')
        if (key === 'requests' && requests?.via_assistant) return `${requests.via_assistant} por el Asistente`
        if (key === 'library' && library?.total) return [library.shared ? `${library.shared} compartidas` : null, library.saved ? `${library.saved} guardadas` : null].filter(Boolean).join(' · ')
        return null
    }

    return (
        <Section icon={<ActivityIcon className="size-4" />} title="Dónde se mueve" sub={`Lo que hizo en la app y la web en los últimos ${data.usage_days} días, de más a menos.`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-2xl border border-border bg-card/40 px-3.5 py-3 text-[12.5px]">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                    <span className={`size-2 rounded-full ${dot}`} />
                    {lastActive ? `Usó Eyplease+ ${lastActive}` : 'No hay registro de que haya entrado'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <SmartphoneIcon className="size-3.5" />
                    {devices ? `Tiene ${devices}` : 'No tiene la app instalada: entra por la web'}
                </span>
            </div>

            {active.length ? (
                <ul className="grid min-w-0 grid-cols-1 gap-2.5">
                    {active.map(area => (
                        <li key={area.key} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]">
                            <span className="min-w-0">
                                <b className="block truncate text-[13px] font-bold">{area.label}</b>
                                {detail(area.key) && <small className="block truncate text-[11px] text-muted-foreground">{detail(area.key)}</small>}
                            </span>
                            <span className="order-3 col-span-2 block h-2.5 overflow-hidden rounded-full bg-foreground/[.06] sm:order-none sm:col-span-1">
                                <span className="block h-full rounded-full bg-[#6C47FF] dark:bg-[#8F74FF]" style={{ width: `${(area.total / max) * 100}%` }} />
                            </span>
                            <b className="w-10 text-right text-[13.5px] font-extrabold tabular-nums">{area.total}</b>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[12.5px] text-muted-foreground">No hizo nada que deje huella en estos {data.usage_days} días.</p>
            )}

            {idle.length > 0 && active.length > 0 && (
                <p className="text-[12px] text-muted-foreground">Sin movimiento: {idle.map(area => area.label.toLowerCase()).join(', ')}.</p>
            )}

            {(usage.posts_by_section.length > 0 || usage.library_by_section.length > 0) && (
                <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                    {usage.posts_by_section.length > 0 && (
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold">Lo que más comparte</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {usage.posts_by_section.slice(0, 8).map(section => <span key={section.key} className="pulse-tag plain">{section.label} · {section.total}</span>)}
                            </div>
                        </div>
                    )}
                    {usage.library_by_section.length > 0 && (
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold">De la Biblioteca</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {usage.library_by_section.map(section => <span key={section.key} className="pulse-tag plain">{section.label} · {section.total}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                <div className="min-w-0">
                    <p className="text-[12.5px] font-bold">Publicaciones compartidas <span className="font-semibold text-muted-foreground">· por mes</span></p>
                    {postsIdle ? <p className="mt-2 text-[12px] text-muted-foreground">No ha compartido publicaciones en estos {data.trend.length} meses.</p> : <div className="mt-3">
                        <MiniBars caption="Publicaciones compartidas por mes" height={84} bars={data.trend.map(month => ({ key: month.month, label: monthShort(month.month), value: month.posts_shared, tip: <><b className="font-bold">{periodLabel(month.month)}</b>: {month.posts_shared} compartidas</> }))} />
                    </div>}
                </div>
                <div className="min-w-0">
                    <p className="text-[12.5px] font-bold">Mensajes al Asistente <span className="font-semibold text-muted-foreground">· por mes</span></p>
                    {assistantIdle ? <p className="mt-2 text-[12px] text-muted-foreground">No le ha escrito al Asistente en estos {data.trend.length} meses.</p> : <div className="mt-3">
                        <MiniBars caption="Mensajes al Asistente por mes" height={84} bars={data.trend.map(month => ({ key: month.month, label: monthShort(month.month), value: month.assistant_messages, tip: <><b className="font-bold">{periodLabel(month.month)}</b>: {month.assistant_messages} mensajes</> }))} />
                    </div>}
                </div>
            </div>

            {notifications > 0 && <p className="text-[12px] text-muted-foreground">Además leyó {notifications} avisos.</p>}

            <p className="flex gap-2 rounded-xl bg-foreground/[.035] px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                Cuenta acciones (compartir, guardar, pedir, escribir, crear); la plataforma no registra qué pantallas abre ni cuánto tiempo. Biblioteca y entrenamientos sólo se cuentan desde la app nueva.
            </p>
        </Section>
    )
}

const InsightsSkeleton = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4" aria-busy>
        <span className="h-[330px] animate-pulse rounded-3xl bg-foreground/[.05]" />
        <span className="h-[420px] animate-pulse rounded-3xl bg-foreground/[.05]" />
    </div>
)

const Insights = ({ data, loading, failed, country }: { data: ClientInsights | undefined, loading: boolean, failed: boolean, country: Country }) => {
    if (loading && !data) return <InsightsSkeleton />
    if (!data) return (
        <section className="shell-glass rounded-3xl p-5 text-[13px] text-muted-foreground">
            {failed ? 'No se pudieron leer sus indicadores y su uso. Intenta de nuevo en un momento.' : 'Sin datos.'}
        </section>
    )
    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <Business data={data} country={country} />
            <Usage data={data} />
        </div>
    )
}

export default Insights;
