import { Link } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { LiveNews } from '@/interfaces/liveNews'
import { AdminOverview } from '@/interfaces/overview'

const Row = ({ value, label, tone }: { value: number, label: string, tone?: string }) => (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
        <span className="text-[12.5px] text-muted-foreground">{label}</span>
        <b className={`text-[15px] font-extrabold tabular-nums ${tone ?? ''}`}>{value}</b>
    </div>
)

/** Lo que el detector vio hoy en los reportes (todavía en validación: no publica solo) y las mensuales que faltan. */
const RailExtras = ({ liveNews, monthly, clients }: { liveNews?: LiveNews, monthly: AdminOverview['publishing']['monthly'], clients: AdminOverview['clients'] }) => (
    <>
        {monthly.missing.length > 0 && (
            <section className="shell-glass pulse-rise rounded-3xl border-amber-400/40 p-[18px]" style={{ '--i': 2 } as React.CSSProperties}>
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[14.5px] font-extrabold tracking-tight">Mensuales sin publicar</h2>
                    <span className="pulse-tag warn">{monthly.covered} de {monthly.total}</span>
                </div>
                <ul className="mt-2 grid gap-1 text-[12.5px]">
                    {monthly.missing.map(section => <li key={section.key} className="flex gap-2"><span aria-hidden className="text-amber-500">•</span><span className="min-w-0 flex-1 font-semibold">{section.name}</span></li>)}
                </ul>
                <Link to={APP_ROUTES.POSTS.DASHBOARD} className="mt-2.5 inline-block text-[12px] font-bold text-primary hover:underline">Publicarlas</Link>
            </section>
        )}

        <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 3 } as React.CSSProperties}>
            <h2 className="text-[14.5px] font-extrabold tracking-tight">Novedades que vio el detector</h2>
            <div className="mt-1.5 divide-y divide-border">
                <Row value={liveNews?.totals.star_level_up ?? 0} label="Subieron de estrella hoy" tone="text-[#DB2777] dark:text-[#F472B6]" />
                <Row value={liveNews?.totals.star_close ?? 0} label="A un paso de la siguiente" />
                <Row value={liveNews?.totals.new_beginning ?? 0} label="Nuevos inicios" />
            </div>
        </section>

        <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 4 } as React.CSSProperties}>
            <h2 className="text-[14.5px] font-extrabold tracking-tight">Clientas</h2>
            <div className="mt-1.5 divide-y divide-border">
                <Row value={clients.active} label="Activas" />
                <Row value={clients.new_this_month} label="Nuevas este mes" tone="text-emerald-600 dark:text-emerald-400" />
                <Row value={clients.inactive} label="Inactivas" />
            </div>
            <Link to={APP_ROUTES.CLIENTS.LIST} className="mt-2 inline-block text-[12px] font-bold text-primary hover:underline">Ver el padrón</Link>
        </section>
    </>
)

export default RailExtras
