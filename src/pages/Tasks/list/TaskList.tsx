import { useMemo, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, PaperclipIcon, SearchIcon } from 'lucide-react'

import { ITask } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import { MONTH_LABELS } from '@/utils/finance'
import Face from '../Face'
import { KIND, STAGES, StageKey, dueInfo, kindInfo, kindOf, stageInfo, stageOf } from '../lib'
import '@/pages/Hoy/hoy.css'
import '../board/board.css'

type SortKey = 'due' | 'start' | 'number'

interface Props {
    tasks: ITask[]
    loading: boolean
    month: number
    onMonthChange: (month: number) => void
    dateKey: 'started_at' | 'expired_at'
    onOpen: (task: ITask) => void
}

const fullDate = (value: Date | string) => new Date(value).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })

/**
 * La lista con la piel nueva: los pedidos del mes en una tabla que se lee de un vistazo —tipo con su color,
 * etapa con la de la mesa, quién lo hace y la entrega en palabras— y que se ordena con un clic en su
 * encabezado. Mismos datos que el calendario (el mes de la API); un clic abre la ficha.
 */
const TaskList = ({ tasks, loading, month, onMonthChange, dateKey, onOpen }: Props) => {
    const today = new Date()
    const [year, setYear] = useState(() => month > today.getMonth() + 1 ? today.getFullYear() - 1 : today.getFullYear())
    const [stage, setStage] = useState<StageKey | 'all'>('all')
    const [kind, setKind] = useState('all')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<{ key: SortKey, asc: boolean }>({ key: 'due', asc: true })

    const go = (delta: number) => {
        const next = new Date(year, month - 1 + delta, 1)
        setYear(next.getFullYear())
        onMonthChange(next.getMonth() + 1)
    }

    /* La API filtra por número de mes de CUALQUIER año: aquí se queda el del año que se mira */
    const inMonth = useMemo(() => tasks.filter(task => {
        const value = task[dateKey]
        if (!value) return false
        const date = new Date(value)
        return date.getFullYear() === year && date.getMonth() + 1 === month
    }), [tasks, dateKey, year, month])

    const text = search.trim().toLowerCase()
    const base = inMonth.filter(task => (kind === 'all' || kindOf(task) === kind) && (!text || `${task.consecutive} ${task.title} ${task.created_by?.name ?? ''} ${task.assigned_to?.name ?? ''}`.toLowerCase().includes(text)))
    const shown = base
        .filter(task => stage === 'all' || stageOf(task) === stage)
        .sort((a, b) => {
            const value = (task: ITask) => sort.key === 'number' ? task.consecutive : new Date(sort.key === 'due' ? task.expired_at : task.started_at).getTime()
            return (value(a) - value(b)) * (sort.asc ? 1 : -1)
        })

    const kinds = Object.entries(KIND).filter(([slug]) => inMonth.some(task => kindOf(task) === slug))
    const chip = (active: boolean) => cn('inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors disabled:cursor-default disabled:opacity-40', active ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')

    const head = (label: string, sortKey?: SortKey, className?: string) => {
        const active = sortKey && sort.key === sortKey
        const Arrow = sort.asc ? ArrowUpIcon : ArrowDownIcon
        return (
            <th key={label} className={cn('px-3 py-3 text-[10.5px] font-bold tracking-[.08em] text-muted-foreground uppercase', className)}>
                {sortKey ? (
                    <button type="button" onClick={() => setSort(current => ({ key: sortKey, asc: current.key === sortKey ? !current.asc : true }))} className={cn('inline-flex cursor-pointer items-center gap-1 uppercase hover:text-foreground', active && 'text-foreground')}>
                        {label}{active && <Arrow className="size-3" />}
                    </button>
                ) : label}
            </th>
        )
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3.5">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => go(-1)} aria-label="Mes anterior" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground"><ChevronLeftIcon className="size-4" /></button>
                    <h2 className="min-w-[170px] px-2 text-center text-[18px] font-extrabold tracking-tight">{MONTH_LABELS[month - 1]} <span className="text-muted-foreground">{year}</span></h2>
                    <button type="button" onClick={() => go(1)} aria-label="Mes siguiente" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground"><ChevronRightIcon className="size-4" /></button>
                </div>
                <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[280px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Número, título, clienta o diseñadora…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                </label>
                <div className="flex flex-wrap gap-1.5">
                    <button type="button" className={chip(kind === 'all')} onClick={() => setKind('all')}>Todo</button>
                    {kinds.map(([slug, item]) => (
                        <button key={slug} type="button" className={chip(kind === slug)} onClick={() => setKind(kind === slug ? 'all' : slug)}>
                            <i className="size-2 rounded-full" style={{ background: item.color }} />{item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <button type="button" className={chip(stage === 'all')} onClick={() => setStage('all')}>Todas las etapas <b className="text-[11px] font-extrabold opacity-70 tabular-nums">{base.length}</b></button>
                {STAGES.map(item => {
                    const count = base.filter(task => stageOf(task) === item.key).length
                    return (
                        <button key={item.key} type="button" className={chip(stage === item.key)} onClick={() => setStage(stage === item.key ? 'all' : item.key)} disabled={count === 0 && stage !== item.key}>
                            <i className="size-2 rounded-full" style={{ background: item.color }} />{item.title} <b className="text-[11px] font-extrabold opacity-70 tabular-nums">{count}</b>
                        </button>
                    )
                })}
            </div>

            {/* Escritorio: la tabla */}
            <section className="shell-glass hidden overflow-hidden rounded-3xl md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left">
                        <thead className="border-b border-border">
                            <tr>
                                {head('Pedido', 'number', 'pl-5')}
                                {head('Tipo')}
                                {head('Etapa')}
                                {head('Quién')}
                                {head('Entrega', 'due')}
                                {head('Publicación', 'start', 'pr-5')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shown.map(task => {
                                const kindItem = kindInfo(task)
                                const stageItem = stageInfo(task)
                                const due = dueInfo(task)
                                return (
                                    <tr key={task.id} onClick={() => onOpen(task)} className="cursor-pointer transition-colors hover:bg-foreground/[.035]">
                                        <td className="max-w-[420px] py-3 pr-3 pl-5">
                                            <span className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-muted-foreground tabular-nums">#{task.consecutive}</span>
                                                <b className="truncate text-[13.5px] font-bold">{task.title}</b>
                                                {task.files?.length > 0 && <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />}
                                            </span>
                                            {task.created_by?.name && kindOf(task) !== 'tools' && kindOf(task) !== 'trainings' && <small className="block truncate text-[11.5px] text-muted-foreground">de {task.created_by.name}</small>}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap"><span className="mesa-kind" style={{ ['--kind' as string]: kindItem.color }}><i />{kindItem.label}</span></td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-extrabold" style={{ background: `color-mix(in oklab, ${stageItem.color} 16%, transparent)`, color: `color-mix(in oklab, ${stageItem.color} 70%, var(--foreground))` }}>
                                                <i className="size-1.5 rounded-full" style={{ background: stageItem.color }} />{stageItem.title}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className="flex items-center gap-2 text-[12.5px] font-semibold"><Face user={task.assigned_to} size={22} /><span className={cn('truncate', !task.assigned_to && 'text-muted-foreground')}>{task.assigned_to?.name.split(' ')[0] ?? 'Nadie'}</span></span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className={cn('mesa-due', due.tone)}>{due.text}</span>
                                            <small className="block text-[11px] text-muted-foreground">{fullDate(task.expired_at)}</small>
                                        </td>
                                        <td className="py-3 pr-5 pl-3 text-[12.5px] whitespace-nowrap text-muted-foreground">{fullDate(task.started_at)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="grid gap-2 p-4">{Array.from({ length: 5 }, (_, index) => <span key={index} className="h-12 animate-pulse rounded-xl bg-foreground/[.06]" />)}</div>}
                {!loading && !shown.length && <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">{inMonth.length ? 'Ningún pedido con ese filtro.' : `Sin pedidos en ${MONTH_LABELS[month - 1]?.toLowerCase()}.`}</p>}
            </section>

            {/* Celular: tarjetas */}
            <section className="grid gap-2 md:hidden">
                {shown.map(task => {
                    const kindItem = kindInfo(task)
                    const stageItem = stageInfo(task)
                    const due = dueInfo(task)
                    return (
                        <button key={task.id} type="button" onClick={() => onOpen(task)} style={{ ['--kind' as string]: kindItem.color }} className="mesa-card cursor-pointer">
                            <span className="flex items-center gap-2">
                                <span className="mesa-kind"><i />{kindItem.label}</span>
                                <span className="ml-auto text-[10.5px] font-bold text-muted-foreground tabular-nums">#{task.consecutive}</span>
                            </span>
                            <b className="line-clamp-2 text-[13px] leading-snug font-bold">{task.title}</b>
                            <span className="flex items-center justify-between gap-2">
                                <span className={cn('mesa-due', due.tone)}>{due.text}</span>
                                <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: stageItem.color }}><i className="size-1.5 rounded-full" style={{ background: stageItem.color }} />{stageItem.title}<Face user={task.assigned_to} size={20} /></span>
                            </span>
                        </button>
                    )
                })}
                {!loading && !shown.length && <p className="shell-glass rounded-2xl px-4 py-8 text-center text-[13px] text-muted-foreground">{inMonth.length ? 'Ningún pedido con ese filtro.' : `Sin pedidos en ${MONTH_LABELS[month - 1]?.toLowerCase()}.`}</p>}
            </section>
        </div>
    )
}

export default TaskList
