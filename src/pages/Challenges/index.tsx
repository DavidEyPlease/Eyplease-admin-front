import { useMemo } from 'react'
import { Link } from 'react-router'
import { TrophyIcon } from 'lucide-react'

import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { initials, titleCase } from '@/pages/Clients/List/names'
import { APP_ROUTES } from '@/constants/app'
import { ChallengeListItem } from '@/interfaces/challenges'

import { STATE, TYPE_LABEL, dayLabel } from './retos.utils'
import { useChallengeList } from './useChallenges'
import '@/pages/Hoy/hoy.css'
import './retos.css'

const Card = ({ item, index }: { item: ChallengeListItem, index: number }) => {
    const state = STATE[item.template_state]
    const progress = item.progress
    const percent = progress && progress.goal ? Math.min(100, Math.round(100 * progress.current / progress.goal)) : 0
    const closed = item.is_open === false

    return (
        <Link
            to={APP_ROUTES.CHALLENGES.DETAIL.replace(':id', item.id)}
            data-tone={state.tone}
            style={{ '--i': Math.min(index, 8) + 1 } as React.CSSProperties}
            className={cn('rt-card shell-glass pulse-rise', closed && 'is-closed')}
        >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-[12.5px] font-extrabold text-primary">{initials(item.client.name)}</span>
                    <div className="min-w-0">
                        <b className="block truncate text-[14.5px] leading-tight font-extrabold">{item.title}</b>
                        <small className="block truncate text-[11.5px] text-muted-foreground">
                            {titleCase(item.client.name)} · {item.client.username}
                        </small>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rt-tag plain">{TYPE_LABEL[item.type] ?? item.type}</span>
                    <span className={cn('rt-tag', state.tone)}>{state.label}</span>
                </div>
            </div>

            {progress && (
                <div className="mt-3">
                    <div className="flex items-baseline justify-between gap-3 text-[12px]">
                        <span className="font-semibold">{progress.detail ?? `${progress.current} de ${progress.goal}`}</span>
                        <span className="text-muted-foreground tabular-nums">{closed ? `cerró el ${dayLabel(item.ends_on)}` : `hasta el ${dayLabel(item.ends_on)}`}</span>
                    </div>
                    <div className="rt-bar mt-1.5"><i style={{ width: `${Math.max(percent, 3)}%` }} /></div>
                </div>
            )}

            <p className="mt-2.5 text-[11.5px] leading-snug text-muted-foreground">
                {state.hint}
                {item.celebrated_count > 0 && <> · <b className="text-foreground">{item.published_count} de {item.celebrated_count}</b> piezas publicadas</>}
            </p>
        </Link>
    )
}

/**
 * Retos: los que las Directoras le ponen a su unidad. Cada uno lleva una BASE —el diseño de sus ganadoras sin persona
 * ni nombre— que se mide aquí una vez; de ahí cada ganadora sale sola. Arriba, lo que pide acción: la base que llegó
 * y falta medir, y los retos cuyas ganadoras esperan.
 */
const ChallengesPage = () => {
    const { response, loading } = useChallengeList()
    const items = useMemo(() => [...(response ?? [])].sort((a, b) =>
        STATE[a.template_state].order - STATE[b.template_state].order || b.period.localeCompare(a.period)), [response])

    const toMeasure = items.filter(item => item.template_state === 'por_medir').length
    const waiting = items.filter(item => item.template_state === 'esperando').length
    const verdict = toMeasure > 0
        ? `${toMeasure} ${toMeasure === 1 ? 'base por medir' : 'bases por medir'}.`
        : waiting > 0 ? `${waiting} ${waiting === 1 ? 'espera su base' : 'esperan su base'}.` : items.length ? 'Todo al día.' : 'Sin retos.'

    return (
        <div className="mx-auto grid w-full max-w-[860px] min-w-0 grid-cols-1 gap-[18px]">
            {isNewShell() ? (
                <PageHead
                    eyebrow="Operación · Retos"
                    title={<>Retos. <em className={cn(toMeasure === 0 && waiting === 0 && '!bg-none !text-emerald-600 dark:!text-emerald-400')}>{verdict}</em></>}
                    sub="Los retos que las Directoras le ponen a su unidad. Cada uno lleva una base: el diseño de sus ganadoras sin persona ni nombre. Se mide aquí una vez y de ahí cada ganadora sale sola en Mi unidad → Retos."
                />
            ) : (
                <div className="flex items-center gap-2.5">
                    <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: 'linear-gradient(180deg,#5B47E0,#5DD9D2)' }} />
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Retos · {verdict}</h1>
                </div>
            )}

            {loading && <p className="text-[13px] text-muted-foreground">Cargando retos…</p>}

            {!loading && items.length === 0 && (
                <div className="shell-glass grid place-items-center gap-2 rounded-[22px] px-6 py-12 text-center">
                    <TrophyIcon className="size-7 text-primary" />
                    <b className="text-[15px]">Todavía no hay retos a la unidad</b>
                    <p className="max-w-[46ch] text-[12.5px] text-muted-foreground">Cuando una Directora le ponga un reto a su unidad, aparece aquí con su avance y la base de sus ganadoras.</p>
                </div>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-3">
                {items.map((item, index) => <Card key={item.id} item={item} index={index} />)}
            </div>
        </div>
    )
}

export default ChallengesPage
