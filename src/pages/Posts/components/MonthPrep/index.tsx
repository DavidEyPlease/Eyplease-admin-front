import { FormEvent, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, Loader2Icon, PlusIcon, RefreshCwIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { MonthPrepResponse, PrepGroup } from '@/interfaces/monthPrep'
import { cn } from '@/lib/utils'
import { formatRelativeTime, shiftPeriod } from '../../page-utils'
import BoardSkeleton from '../Board/BoardSkeleton'
import ItemRow from './ItemRow'

interface Props {
    data: MonthPrepResponse | undefined
    loading: boolean
    isRefetching: boolean
    refreshing: boolean
    saving: boolean
    period: string
    /** El mes que viene (el que se abre de entrada) */
    nextPeriod: string
    onPeriodChange: (period: string) => void
    onRefresh: () => void
    onMark: (key: string, state: 'done' | 'skip' | null) => void
    onAddCustom: (title: string) => Promise<boolean>
    onToggleCustom: (id: string, done: boolean) => void
    onRemoveCustom: (id: string) => void
}

const monthLabel = (period: string) => {
    const [year, month] = period.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'long' })
}

/**
 * Publicaciones · Próximo mes: lo que tiene que estar listo antes de que empiece el mes que viene, para adelantarlo.
 * Casi todo se palomea solo en cuanto se sube (diseños, plantilla del boletín, Biblioteca, Entérate Ya, revistas); lo
 * demás y los pendientes propios se palomean aquí.
 */
const MonthPrep = ({ data, loading, isRefetching, refreshing, saving, period, nextPeriod, onPeriodChange, onRefresh, onMark, onAddCustom, onToggleCustom, onRemoveCustom }: Props) => {
    const [draft, setDraft] = useState('')

    if (loading || !data) return <BoardSkeleton />

    const { summary } = data
    const percent = summary.total ? Math.round((summary.ready / summary.total) * 100) : 0
    const open = summary.missing + summary.partial

    const addCustom = async (event: FormEvent) => {
        event.preventDefault()
        const title = draft.trim()
        if (!title) return
        if (await onAddCustom(title)) setDraft('')
    }

    const renderGroup = (group: PrepGroup) => {
        const done = group.items.filter(item => item.state === 'ready' || item.state === 'skipped').length
        return (
            <section key={group.key} className="shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl">
                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-[18px] pt-4 pb-3">
                    <h2 className="text-[15px] font-extrabold tracking-tight">{group.title}</h2>
                    {group.items.length > 0 && <span className="text-[12px] font-bold text-muted-foreground">{done} de {group.items.length}</span>}
                    {group.subtitle && <span className="w-full text-[12px] text-muted-foreground">{group.subtitle}</span>}
                </header>

                {group.items.map(item => (
                    <ItemRow
                        key={item.key}
                        item={item}
                        saving={saving}
                        onMark={onMark}
                        onToggleCustom={onToggleCustom}
                        onRemoveCustom={onRemoveCustom}
                    />
                ))}

                {group.key === 'custom' && (
                    <form onSubmit={addCustom} className="prep-add">
                        <input
                            value={draft}
                            maxLength={200}
                            onChange={event => setDraft(event.target.value)}
                            placeholder="Agregar un pendiente: «Pedirle a Astra el arte del Cuadro de Honor»"
                        />
                        <button type="submit" disabled={saving || !draft.trim()} className="vta-btn gro-primary !h-9 !text-[12.5px]">
                            <PlusIcon className="size-3.5" /> Agregar
                        </button>
                    </form>
                )}
            </section>
        )
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <section className="pub-ribbon shell-glass">
                <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                    <div className="grid gap-2">
                        <div className="pub-big">
                            {summary.ready}<small>de {summary.total} listos para {data.label}</small>
                        </div>
                        <p className="pub-todo">
                            {open === 0
                                ? <>Todo listo para <b>{data.label}</b>.</>
                                : <>Faltan <b>{open}</b> {open === 1 ? 'pendiente' : 'pendientes'} y {data.label} empieza en <b>{data.days_left} {data.days_left === 1 ? 'día' : 'días'}</b>. Se palomea solo en cuanto se sube; lo que el sistema no puede ver, lo palomeas tú.</>}
                        </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        {[nextPeriod, shiftPeriod(nextPeriod, 1)].map(option => (
                            <button
                                key={option}
                                type="button"
                                className={cn('prep-chip', option === period && 'on')}
                                onClick={() => onPeriodChange(option)}
                            >
                                {monthLabel(option)}
                            </button>
                        ))}
                    </div>
                </div>
                <span className={cn('pub-prog mt-4', percent === 100 && 'ok')}><i style={{ width: `${percent}%` }} /></span>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        {isRefetching || refreshing ? <Loader2Icon className="size-3 animate-spin" /> : <ClockIcon className="size-3" />}
                        Revisado {formatRelativeTime(data.computed_at)}
                    </span>
                    <button type="button" disabled={refreshing} className="prep-text-btn" onClick={onRefresh}>
                        <RefreshCwIcon className={cn('size-3', refreshing && 'animate-spin')} /> {refreshing ? 'Revisando…' : 'Revisar ahora'}
                    </button>
                    {summary.skipped > 0 && <span>{summary.skipped} marcados como «no va»</span>}
                </div>
            </section>

            {data.current_gaps.length > 0 && (
                <p className="pub-alert">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>
                        <b>Este mes ({data.current_label}) {data.current_gaps.length === 1 ? 'falta 1 diseño' : `faltan ${data.current_gaps.length} diseños`} que los meses pasados sí tuvieron: </b>
                        {data.current_gaps.map(gap => `${gap.label} (${gap.title}${gap.scope_label ? ` · ${gap.scope_label}` : ''})`).join(', ')}.
                        {' '}Esas piezas no están saliendo. Súbelo en <Link className="underline" to={APP_ROUTES.TEMPLATES.POSTS}>Plantillas</Link> o, si ya no va, apágalo en «Qué falta».
                    </span>
                </p>
            )}

            {open === 0 && summary.total > 0 && (
                <p className="ent-ok"><CheckCircle2Icon className="size-4 shrink-0" />Todo listo para {data.label}.</p>
            )}

            {data.groups.map(renderGroup)}

            <p className="px-1 text-[12px] leading-relaxed text-muted-foreground">
                Los diseños se piden igual que el mes en curso. Si una sección ya no va, apágala en «Qué falta» (Apagar a propósito) y deja de pedirse aquí;
                si sólo este mes no va, márcala «No va este mes». Desde el día 20 la torre avisa lo que falte.
            </p>
        </div>
    )
}

export default MonthPrep
