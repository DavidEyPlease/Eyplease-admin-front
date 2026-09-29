import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from 'lucide-react'

import { ITask } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/uishadcn/ui/popover'
import { MONTH_LABELS } from '@/utils/finance'
import Face from '../Face'
import { KIND, STAGES, daysLeft, isTeamWork, kindInfo, kindOf, stageInfo, stageOf } from '../lib'
import '@/pages/Hoy/hoy.css'
import './calendar.css'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const VISIBLE = 3

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

/** Las semanas del mes, de lunes a domingo, completando con los días de los meses vecinos */
const weeksOf = (year: number, month: number) => {
    const first = new Date(year, month - 1, 1)
    const start = new Date(first)
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7))
    const last = new Date(year, month, 0)
    const end = new Date(last)
    end.setDate(last.getDate() + (6 - ((last.getDay() + 6) % 7)))
    const days: Date[] = []
    for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) days.push(new Date(day))
    return days
}

interface Props {
    tasks: ITask[]
    loading: boolean
    /** El mes que pide la API (sólo su número: el año lo pone la pantalla) */
    month: number
    onMonthChange: (month: number) => void
    /** En qué fecha va cada pedido: la dirección lo ve por su fecha de inicio; quien diseña, por su entrega */
    dateKey: 'started_at' | 'expired_at'
    onOpen: (task: ITask) => void
    onCreate: (date: Date) => void
    /** Arrastrar a otro día le cambia la fecha de inicio (sólo la dirección) */
    onMove?: (task: ITask, date: Date) => void
}

const Chip = ({ task, draggable, dragging, onOpen, onDragState }: { task: ITask, draggable: boolean, dragging: boolean, onOpen: (task: ITask) => void, onDragState: (id: string | null) => void }) => {
    const kind = kindInfo(task)
    const stage = stageInfo(task)
    const late = isTeamWork(task) && daysLeft(task) < 0
    return (
        <button
            type="button"
            draggable={draggable}
            onDragStart={event => { event.dataTransfer.setData('text/task', task.id); event.dataTransfer.effectAllowed = 'move'; onDragState(task.id) }}
            onDragEnd={() => onDragState(null)}
            onClick={() => onOpen(task)}
            title={`#${task.consecutive} · ${task.title}\n${kind.label} · ${stage.title}${task.assigned_to ? ` · ${task.assigned_to.name}` : ''}`}
            style={{ ['--kind' as string]: kind.color }}
            className={cn('cal-chip', stageOf(task) === 'done' && 'done', late && 'late', dragging && 'dragging')}
        >
            <span className="cal-chip__title">{task.title}</span>
            <i className="cal-chip__stage" style={{ background: stage.color }} />
        </button>
    )
}

/**
 * El calendario con la piel nueva: el mes en una rejilla de lunes a domingo, cada pedido con el color de
 * su tipo y un puntito del color de su etapa (las mismas de la mesa). Un clic abre la ficha; el «+» de
 * cada día crea un pedido para esa fecha; arrastrar lo cambia de día. En el celular, el mes se lee como
 * agenda: sólo los días que tienen algo.
 */
const TaskCalendar = ({ tasks, loading, month, onMonthChange, dateKey, onOpen, onCreate, onMove }: Props) => {
    const today = new Date()
    /* La API filtra por número de mes de CUALQUIER año: el año lo lleva la pantalla y se recorta aquí */
    const [year, setYear] = useState(() => month > today.getMonth() + 1 ? today.getFullYear() - 1 : today.getFullYear())
    const [kind, setKind] = useState('all')
    const [search, setSearch] = useState('')
    const [dragId, setDragId] = useState<string | null>(null)
    const [over, setOver] = useState<string | null>(null)

    const go = (delta: number) => {
        const next = new Date(year, month - 1 + delta, 1)
        setYear(next.getFullYear())
        onMonthChange(next.getMonth() + 1)
    }
    const goToday = () => { setYear(today.getFullYear()); onMonthChange(today.getMonth() + 1) }

    const days = useMemo(() => weeksOf(year, month), [year, month])
    const text = search.trim().toLowerCase()

    const byDay = useMemo(() => {
        const map = new Map<string, ITask[]>()
        tasks.forEach(task => {
            const value = task[dateKey]
            if (!value) return
            const date = new Date(value)
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month) return
            if (kind !== 'all' && kindOf(task) !== kind) return
            if (text && !`${task.consecutive} ${task.title} ${task.created_by?.name ?? ''}`.toLowerCase().includes(text)) return
            const key = dayKey(date)
            map.set(key, [...(map.get(key) ?? []), task])
        })
        /* Lo pendiente arriba y lo entregado al final */
        map.forEach(list => list.sort((a, b) => Number(stageOf(a) === 'done') - Number(stageOf(b) === 'done') || a.consecutive - b.consecutive))
        return map
    }, [tasks, dateKey, year, month, kind, text])

    const inMonth = [...byDay.values()].flat()
    const lateCount = inMonth.filter(task => isTeamWork(task) && daysLeft(task) < 0).length
    const kinds = Object.entries(KIND).filter(([slug]) => tasks.some(task => kindOf(task) === slug))
    const chip = (active: boolean) => cn('inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', active ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')

    const drop = (date: Date) => {
        const task = tasks.find(item => item.id === dragId)
        setDragId(null); setOver(null)
        if (!task || !onMove) return
        const current = new Date(task[dateKey])
        if (dayKey(current) === dayKey(date)) return
        /* Sólo cambia el día: la hora se queda */
        onMove(task, new Date(date.getFullYear(), date.getMonth(), date.getDate(), current.getHours(), current.getMinutes()))
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3.5">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => go(-1)} aria-label="Mes anterior" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground"><ChevronLeftIcon className="size-4" /></button>
                    <h2 className="min-w-[170px] px-2 text-center text-[18px] font-extrabold tracking-tight">{MONTH_LABELS[month - 1]} <span className="text-muted-foreground">{year}</span></h2>
                    <button type="button" onClick={() => go(1)} aria-label="Mes siguiente" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground"><ChevronRightIcon className="size-4" /></button>
                    <button type="button" onClick={goToday} className="ml-1 h-9 cursor-pointer rounded-xl border border-border bg-card/60 px-3 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">Hoy</button>
                </div>
                <span className="text-[12.5px] text-muted-foreground">
                    {loading ? 'Cargando…' : `${inMonth.length} ${inMonth.length === 1 ? 'pedido' : 'pedidos'}`}{lateCount > 0 && <> · <b className="text-rose-500">{lateCount} {lateCount === 1 ? 'atrasado' : 'atrasados'}</b></>}
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    <label className="flex h-8 w-[200px] items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[12.5px]">
                        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                    </label>
                    <button type="button" className={chip(kind === 'all')} onClick={() => setKind('all')}>Todo</button>
                    {kinds.map(([slug, item]) => (
                        <button key={slug} type="button" className={chip(kind === slug)} onClick={() => setKind(kind === slug ? 'all' : slug)}>
                            <i className="size-2 rounded-full" style={{ background: item.color }} />{item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Escritorio: la rejilla del mes */}
            <section className="cal shell-glass hidden sm:block">
                <div className="cal-head">{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
                <div className="cal-grid">
                    {days.map(date => {
                        const key = dayKey(date)
                        const list = byDay.get(key) ?? []
                        const outside = date.getMonth() + 1 !== month
                        const isToday = key === dayKey(today)
                        const weekend = date.getDay() === 0 || date.getDay() === 6
                        return (
                            <div
                                key={key}
                                className={cn('cal-day', outside && 'out', weekend && !outside && 'weekend', isToday && 'today', over === key && 'over')}
                                onDragOver={event => { if (!dragId || !onMove) return; event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(key) }}
                                onDragLeave={() => setOver(current => current === key ? null : current)}
                                onDrop={event => { event.preventDefault(); drop(date) }}
                            >
                                <div className="cal-day__top">
                                    <span className="cal-num">{date.getDate()}</span>
                                    <button type="button" className="cal-add" onClick={() => onCreate(date)} aria-label={`Nuevo pedido para el ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]?.toLowerCase()}`}><PlusIcon className="size-3.5" /></button>
                                </div>
                                {list.slice(0, VISIBLE).map(task => <Chip key={task.id} task={task} draggable={!!onMove} dragging={dragId === task.id} onOpen={onOpen} onDragState={setDragId} />)}
                                {list.length > VISIBLE && (
                                    <Popover>
                                        <PopoverTrigger className="cal-more">+{list.length - VISIBLE} más</PopoverTrigger>
                                        <PopoverContent align="start" className="w-72 rounded-2xl p-2">
                                            <p className="px-1.5 pt-1 pb-2 text-[12px] font-extrabold">{date.getDate()} de {MONTH_LABELS[date.getMonth()]?.toLowerCase()} · {list.length} pedidos</p>
                                            <div className="grid max-h-80 gap-1 overflow-y-auto">
                                                {list.map(task => <Chip key={task.id} task={task} draggable={false} dragging={false} onOpen={onOpen} onDragState={setDragId} />)}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Celular: el mes como agenda, sólo los días que tienen algo */}
            <section className="grid gap-2.5 sm:hidden">
                {days.filter(date => date.getMonth() + 1 === month && byDay.get(dayKey(date))?.length).map(date => (
                    <div key={dayKey(date)} className="shell-glass rounded-2xl p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <b className={cn('text-[13px] font-extrabold', dayKey(date) === dayKey(today) && 'text-primary')}>{WEEKDAYS[(date.getDay() + 6) % 7]} {date.getDate()}</b>
                            <button type="button" onClick={() => onCreate(date)} className="grid size-7 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5" aria-label="Nuevo pedido para este día"><PlusIcon className="size-4" /></button>
                        </div>
                        <div className="grid gap-1.5">
                            {(byDay.get(dayKey(date)) ?? []).map(task => (
                                <button key={task.id} type="button" onClick={() => onOpen(task)} style={{ ['--kind' as string]: kindInfo(task).color }} className={cn('cal-chip py-2', stageOf(task) === 'done' && 'done')}>
                                    <span className="cal-chip__title">{task.title}</span>
                                    <Face user={task.assigned_to} size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {!loading && !inMonth.length && <p className="shell-glass rounded-2xl px-4 py-8 text-center text-[13px] text-muted-foreground">Sin pedidos en {MONTH_LABELS[month - 1]?.toLowerCase()}.</p>}
            </section>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground">
                <span className="font-semibold">Etapas:</span>
                {STAGES.map(stage => <span key={stage.key} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: stage.color }} />{stage.title}</span>)}
                <span className="ml-auto">{onMove ? 'Arrastra un pedido a otro día para cambiarle la fecha. El «+» de cada día crea uno nuevo.' : 'El «+» de cada día crea un pedido nuevo.'}</span>
            </div>
        </div>
    )
}

export default TaskCalendar
