import { Link } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { AdminOverview } from '@/interfaces/overview'
import { useFinanceSummary } from '@/pages/Finance/useFinanceSummary'
import { money, monthName } from '../lib'

/** La curva del año, con lo cobrado por mes. Sin datos no se pinta: nada de curvas de adorno. */
const Sparkline = ({ values }: { values: number[] }) => {
    if (values.length < 2) return null
    const w = 240, h = 58, max = Math.max(...values, 1), min = Math.min(...values)
    const span = Math.max(max - min, 1)
    const points = values.map((value, index) => [(index / (values.length - 1)) * w, h - 6 - ((value - min) / span) * (h - 14)] as const)
    const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    const [lastX, lastY] = points[points.length - 1]

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[58px] w-full max-w-[240px]" aria-hidden>
            <defs>
                <linearGradient id="money-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6C47FF" stopOpacity=".35" /><stop offset="1" stopColor="#6C47FF" stopOpacity="0" /></linearGradient>
                <linearGradient id="money-line" x1="0" x2="1"><stop offset="0" stopColor="#6C47FF" /><stop offset="1" stopColor="#2CD4D9" /></linearGradient>
            </defs>
            <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#money-fill)" />
            <path d={line} fill="none" stroke="url(#money-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r="3.5" fill="#2CD4D9" />
        </svg>
    )
}

const MoneyCard = ({ revenue }: { revenue: AdminOverview['revenue'] }) => {
    const { current, previous } = revenue
    const [year, month] = current.period.split('-').map(Number)
    const { summary } = useFinanceSummary(year, month)

    const expected = current.collected + current.outstanding
    const pct = expected > 0 ? Math.round((current.collected / expected) * 100) : 0
    const months = (summary?.months ?? []).filter(item => item.month <= month).map(item => item.income)

    return (
        <section className="shell-glass pulse-rise rounded-3xl p-[20px]" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <small className="text-[11px] font-bold tracking-[.08em] text-muted-foreground uppercase">Dinero de {monthName(current.period)}</small>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <b className="text-[34px] leading-none font-extrabold tracking-[-.035em] tabular-nums">{money(current.collected)}</b>
                        <span className={`pulse-tag ${pct >= 85 ? 'ok' : pct >= 60 ? 'plain' : 'warn'}`}>{pct} % cobrado</span>
                    </div>
                </div>
                <Sparkline values={months} />
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-muted-foreground">
                <span><b className="text-foreground">{current.paid_count}</b> al corriente</span>
                <span><b className="text-amber-600 dark:text-amber-400">{current.pending_count}</b> por vencer</span>
                <span><b className="text-rose-600 dark:text-rose-400">{current.overdue_count}</b> vencidas</span>
                {current.in_review_count > 0 && <span><b className="text-primary">{current.in_review_count}</b> por validar</span>}
                <span>faltan <b className="text-foreground">{money(current.outstanding)}</b></span>
                <span className="ml-auto">{monthName(previous.period)} cerró en <b className="text-foreground">{money(previous.collected)}</b></span>
            </div>

            <Link to={APP_ROUTES.FINANCES.DASHBOARD} className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">Abrir cobranza <ArrowRightIcon className="size-3.5" /></Link>
        </section>
    )
}

export default MoneyCard
