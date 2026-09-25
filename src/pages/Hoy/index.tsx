import { useMemo } from 'react'

import Spinner from '@/components/common/Spinner'
import { countryInfo } from '@/constants/countries'
import { cn } from '@/lib/utils'
import MoneyCard from './components/MoneyCard'
import PulseFeed from './components/PulseFeed'
import RailExtras from './components/RailExtras'
import ReportsCard from './components/ReportsCard'
import ScheduleCard from './components/ScheduleCard'
import { clock, longToday } from './lib'
import usePulse from './usePulse'
import './hoy.css'

const Kpi = ({ label, value, suffix, sub, index }: { label: string, value: number, suffix?: string, sub: string, index: number }) => (
    <div className="shell-glass pulse-rise rounded-[20px] p-4" style={{ '--i': index + 1 } as React.CSSProperties}>
        <small className="block text-[10.5px] leading-tight font-bold tracking-[.08em] text-muted-foreground uppercase">{label}</small>
        <b className="mt-2 block text-[28px] leading-none font-extrabold tracking-[-.03em] tabular-nums">{value.toLocaleString('es-MX')}{suffix && <span className="text-[15px] font-bold text-muted-foreground"> {suffix}</span>}</b>
        <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{sub}</p>
    </div>
)

/**
 * El Inicio nuevo del panel: la torre de control contada como un feed. A la izquierda el contexto
 * (reportes y calendario de carriles, con scroll propio); al centro, lo que la plataforma HIZO hoy,
 * en orden — cada tarjeta es un hecho, no una métrica. El Copiloto lo pone el marco, a la derecha.
 *
 * No reutiliza la pantalla del Inicio de siempre (sigue intacta tras el interruptor), sólo sus datos.
 */
const HoyPage = () => {
    const { loading, country, machinery, overview, dailyReports, schedule, scheduleIsPartial, liveNews, events } = usePulse()

    const ranKeys = useMemo(() => new Set(events.filter(event => event.id.startsWith('run-')).map(event => event.id.slice(4).split('|')[0])), [events])

    if (loading || !overview) return <div className="flex justify-center py-24"><Spinner /></div>

    const today = events.filter(event => !event.carried)
    const urgent = events.filter(event => event.tone === 'bad').length
    const attention = events.filter(event => event.tone === 'warn').length
    const verdict = urgent > 0 ? `${urgent} ${urgent === 1 ? 'cosa urgente' : 'cosas urgentes'}.` : attention > 0 ? `${attention} por atender.` : 'Todo al día.'

    const reportsDone = dailyReports.filter(report => report.loaded >= report.usual).length
    /* El robot sólo entra al portal de México: en otro país no visita a nadie */
    const robotAccounts = machinery ? dailyReports.reduce((max, report) => Math.max(max, report.usual), 0) : 0
    const runEvents = today.filter(event => event.group === 'live' || event.group === 'publishing')
    const pendingDesign = overview.service_requests.new + overview.corrections.count

    return (
        <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[290px_minmax(0,1fr)]">
            {/* Fija y con su propio scroll: se lee sin tener que bajar todo el feed */}
            <aside className="pulse-rail grid gap-3.5 xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-106px)] xl:overflow-y-auto xl:pr-0.5">
                <ReportsCard reports={dailyReports} />
                <ScheduleCard lanes={schedule} daily={overview.publishing.daily} ranKeys={ranKeys} partial={scheduleIsPartial} />
                <RailExtras liveNews={liveNews} monthly={overview.publishing.monthly} clients={overview.clients} />
            </aside>

            <div className="mx-auto grid w-full max-w-[780px] min-w-0 gap-[18px]">
                <header className="pulse-rise">
                    <div className="text-[11px] font-extrabold tracking-[.14em] text-primary uppercase">{countryInfo(country).label} · {longToday()} · {clock(new Date())}</div>
                    <h1 className="shell-title mt-1.5 text-[30px] leading-[1.08] font-extrabold tracking-[-.035em]">
                        Torre de control. <em className={cn(urgent > 0 && '!bg-none !text-rose-500')}>{verdict}</em>
                    </h1>
                    <p className="mt-2 max-w-[560px] text-[13.5px] leading-relaxed text-muted-foreground">
                        Lo que la plataforma hizo hoy, en orden. Cada tarjeta es un hecho, no una métrica: qué corrió, qué salió y qué hubo que rescatar.
                    </p>
                </header>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Kpi index={0} label="Reportes descargados" value={reportsDone} suffix={`/ ${dailyReports.length}`} sub="los diarios, completos" />
                    <Kpi index={1} label="Cuentas que visita el robot" value={robotAccounts} sub={machinery ? 'con derecho y contraseña' : 'sólo entra al portal de México'} />
                    <Kpi index={2} label="Carriles que ya corrieron" value={runEvents.length} sub={runEvents.length ? 'publicaciones y en vivo' : 'todavía ninguno hoy'} />
                    <Kpi index={3} label="Diseño por atender" value={pendingDesign} sub={`${overview.service_requests.new} ${overview.service_requests.new === 1 ? 'nueva' : 'nuevas'} · ${overview.corrections.count} ${overview.corrections.count === 1 ? 'corrección' : 'correcciones'}`} />
                </div>

                <MoneyCard revenue={overview.revenue} />
                <PulseFeed events={events} />
            </div>
        </div>
    )
}

export default HoyPage
