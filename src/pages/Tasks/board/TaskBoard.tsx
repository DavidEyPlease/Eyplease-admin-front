import { useMemo, useState } from 'react'
import { CalendarClockIcon, CheckCircle2Icon, EyeIcon, PaperclipIcon, SearchIcon, XIcon } from 'lucide-react'

import useAuth from '@/hooks/useAuth'
import { RoleKeys } from '@/interfaces/common'
import { ITask } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import Face from '../Face'
import { KIND, STAGES, StageKey, daysLeft, dueInfo, isTeamWork, kindInfo, kindOf, stageOf, startOfDay } from '../lib'
import useTaskBoard from './useTaskBoard'
import '@/pages/Hoy/hoy.css'
import './board.css'

type Horizon = 'week' | 'month' | 'all'
type Focus = 'review' | 'late' | 'today' | 'unassigned' | 'fix'

/** Las cifras de arriba: cada una es también el filtro que enseña esas tarjetas */
const FOCUS: Array<{ key: Focus, label: string, tone: string, test: (task: ITask) => boolean }> = [
    { key: 'review', label: 'Esperan tu visto bueno', tone: 'text-cyan-600 dark:text-cyan-300', test: task => stageOf(task) === 'review' },
    { key: 'late', label: 'Atrasadas', tone: 'text-rose-500', test: task => isTeamWork(task) && daysLeft(task) < 0 },
    { key: 'today', label: 'Vencen hoy', tone: 'text-amber-500', test: task => isTeamWork(task) && daysLeft(task) === 0 },
    { key: 'unassigned', label: 'Sin asignar', tone: 'text-foreground', test: task => stageOf(task) !== 'done' && !task.assigned_to },
    { key: 'fix', label: 'En corrección', tone: 'text-rose-500', test: task => stageOf(task) === 'fix' },
]

const DUE_ICON = { review: EyeIcon, stale: EyeIcon, done: CheckCircle2Icon } as const

interface CardProps {
    task: ITask
    busy: boolean
    canAssign: boolean
    compact: boolean
    dragging: boolean
    onOpen: (task: ITask) => void
    onAssign: (task: ITask, user: ITask['assigned_to']) => void
    onDragState: (id: string | null) => void
}

const Card = ({ task, busy, canAssign, compact, dragging, onOpen, onAssign, onDragState }: CardProps) => {
    const designers = useAuthStore(state => state.utilData.designers)
    const kind = kindInfo(task)
    const finished = stageOf(task) === 'done'
    const due = dueInfo(task)
    const DueIcon = DUE_ICON[due.tone as keyof typeof DUE_ICON] ?? CalendarClockIcon
    const client = task.created_by?.name && kindOf(task) !== 'tools' && kindOf(task) !== 'trainings' ? task.created_by.name : null

    return (
        <article
            draggable={!busy}
            onDragStart={event => { event.dataTransfer.setData('text/task', task.id); event.dataTransfer.effectAllowed = 'move'; onDragState(task.id) }}
            onDragEnd={() => onDragState(null)}
            onClick={() => onOpen(task)}
            style={{ ['--kind' as string]: kind.color }}
            className={cn('mesa-card', compact && 'compact', dragging && 'dragging', busy && 'busy')}
        >
            <div className="flex items-center gap-2">
                <span className="mesa-kind"><i />{kind.label}</span>
                <span className="ml-auto flex shrink-0 items-center gap-2 text-[10.5px] font-bold text-muted-foreground tabular-nums">
                    {task.files?.length > 0 && <span className="inline-flex items-center gap-0.5"><PaperclipIcon className="size-3" />{task.files.length}</span>}
                    #{task.consecutive}
                </span>
            </div>

            <h3 className={cn('text-[13px] leading-snug font-bold', compact ? 'line-clamp-1' : 'line-clamp-2')} title={task.title}>{task.title}</h3>
            {/* Sólo en pedidos de clienta: en lo de Biblioteca quien «creó» la tarea es alguien del equipo */}
            {client && !compact && <p className="-mt-0.5 truncate text-[11.5px] text-muted-foreground">de {client}</p>}

            <div className="flex items-center justify-between gap-2">
                <span className={cn('mesa-due', due.tone)}><DueIcon className="size-3.5 shrink-0" /><span className="truncate">{due.text}</span></span>

                {canAssign && !finished ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={event => event.stopPropagation()} className="cursor-pointer rounded-full outline-none transition-transform hover:scale-110" aria-label={task.assigned_to ? `Lo hace ${task.assigned_to.name}. Cambiar` : 'Asignar'}>
                            <Face user={task.assigned_to} size={compact ? 20 : 24} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-56 rounded-2xl p-1.5" onClick={event => event.stopPropagation()}>
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">¿Quién lo hace?</DropdownMenuLabel>
                            {designers.map(designer => (
                                <DropdownMenuItem key={designer.id} className="cursor-pointer gap-2 rounded-xl" onClick={() => onAssign(task, designer)}>
                                    <Face user={designer} /> <span className="truncate text-[13px] font-semibold">{designer.name}</span>
                                </DropdownMenuItem>
                            ))}
                            {!designers.length && <p className="px-2 py-2 text-[12px] text-muted-foreground">No hay diseñadores dados de alta.</p>}
                            {task.assigned_to && <><DropdownMenuSeparator /><DropdownMenuItem className="cursor-pointer rounded-xl text-[13px]" onClick={() => onAssign(task, null)}>Dejar sin asignar</DropdownMenuItem></>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : <Face user={task.assigned_to} size={compact ? 20 : 24} />}
            </div>
        </article>
    )
}

/**
 * «La mesa»: el trabajo de diseño ordenado por ETAPA y no por día del mes. La pregunta del equipo es
 * «¿qué muevo hoy?», no «¿qué cae el 14?». Arrastrar una tarjeta a otra columna le cambia la etapa; la
 * carita asigna; un clic abre la ficha de siempre (comentarios, archivos, fechas).
 *
 * Cada columna mide lo que trae: la vacía se hace angosta (y sigue recibiendo tarjetas), así las que
 * tienen trabajo caben sin salirse de la pantalla. «Listo» va en tarjetas compactas: es lo entregado.
 */
const TaskBoard = ({ onOpen }: { onOpen: (task: ITask) => void }) => {
    const { user } = useAuth()
    const { tasks, loading, moving, moveTo, assign } = useTaskBoard()
    const designers = useAuthStore(state => state.utilData.designers)

    const [kind, setKind] = useState<string>('all')
    const [who, setWho] = useState<string>('all')
    const [horizon, setHorizon] = useState<Horizon>('week')
    const [focus, setFocus] = useState<Focus | null>(null)
    const [search, setSearch] = useState('')
    const [dragId, setDragId] = useState<string | null>(null)
    const [over, setOver] = useState<StageKey | null>(null)

    const canAssign = user?.role?.role_key === RoleKeys.SUPER_ADMIN
    const focused = FOCUS.find(item => item.key === focus) ?? null

    const shown = useMemo(() => {
        const text = search.trim().toLowerCase()
        const limit = horizon === 'week' ? 7 : horizon === 'month' ? 31 : Infinity
        return tasks.filter(task => {
            if (focused && !focused.test(task)) return false
            if (kind !== 'all' && kindOf(task) !== kind) return false
            if (who === 'none' ? !!task.assigned_to : who !== 'all' && task.assigned_to?.id !== who) return false
            if (text && !`${task.consecutive} ${task.title} ${task.created_by?.name ?? ''}`.toLowerCase().includes(text)) return false
            /* El horizonte sólo recorta el trabajo del equipo que aún no vence: lo atrasado, lo que espera
               tu visto bueno y lo ya entregado siempre se ven */
            if (!focused && isTeamWork(task) && daysLeft(task) > limit) return false
            return true
        })
    }, [tasks, focused, kind, who, horizon, search])

    const open = tasks.filter(task => stageOf(task) !== 'done')
    const load = designers
        .map(designer => ({ designer, count: open.filter(task => task.assigned_to?.id === designer.id).length }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
    const unassigned = open.filter(task => !task.assigned_to).length
    const kinds = Object.entries(KIND).filter(([slug]) => tasks.some(task => kindOf(task) === slug))

    const columns = STAGES.map(stage => ({
        stage,
        cards: shown
            .filter(task => stageOf(task) === stage.key)
            /* Lo entregado, lo más reciente arriba; lo demás, lo más urgente arriba */
            .sort((a, b) => stage.key === 'done' ? startOfDay(b.completed_at ?? b.expired_at) - startOfDay(a.completed_at ?? a.expired_at) : new Date(a.expired_at).getTime() - new Date(b.expired_at).getTime()),
    }))
    /* Con los mínimos caben las cinco en una laptop de 1000 px; si no alcanza, la mesa se desliza de lado */
    const template = columns.map(({ stage, cards }) => !cards.length && !loading ? 'minmax(124px, .45fr)' : stage.key === 'done' ? 'minmax(212px, .85fr)' : 'minmax(232px, 1fr)').join(' ')

    const chip = (active: boolean) => cn('inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', active ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3.5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                {FOCUS.map(item => {
                    const count = open.filter(item.test).length
                    return (
                        <button key={item.key} type="button" onClick={() => setFocus(focus === item.key ? null : item.key)} className={cn('mesa-tile shell-glass', focus === item.key && 'on')} title={focus === item.key ? 'Quitar el filtro' : `Ver sólo: ${item.label.toLowerCase()}`}>
                            <span className="text-[12px] leading-tight font-semibold text-muted-foreground">{item.label}</span>
                            <b className={cn('text-[24px] leading-none font-extrabold tracking-tight tabular-nums', count > 0 ? item.tone : 'text-muted-foreground/60')}>{count}</b>
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[260px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Número, título o clienta…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                </label>

                <button type="button" className={chip(kind === 'all')} onClick={() => setKind('all')}>Todo</button>
                {kinds.map(([slug, item]) => (
                    <button key={slug} type="button" className={chip(kind === slug)} onClick={() => setKind(kind === slug ? 'all' : slug)}>
                        <i className="size-2 rounded-full" style={{ background: item.color }} />{item.label}
                    </button>
                ))}

                <span className="mx-0.5 hidden h-7 w-px bg-border md:block" />
                {([['week', 'Esta semana'], ['month', 'Este mes'], ['all', 'Todo lo que viene']] as Array<[Horizon, string]>).map(([key, label]) => (
                    <button key={key} type="button" className={chip(horizon === key)} onClick={() => setHorizon(key)} disabled={!!focused}>{label}</button>
                ))}

                {canAssign && (load.length > 0 || unassigned > 0) && (
                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                        <span className="hidden text-[11.5px] font-semibold text-muted-foreground xl:inline">Quién tiene qué</span>
                        {load.map(({ designer, count }) => (
                            <button key={designer.id} type="button" title={`${designer.name}: ${count} abiertas`} onClick={() => setWho(who === designer.id ? 'all' : designer.id)} className={cn('flex cursor-pointer items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-[12px] font-bold transition-colors', who === designer.id ? 'border-[#6C47FF] bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                                <Face user={designer} />{designer.name.split(' ')[0]} <span className="tabular-nums opacity-70">{count}</span>
                            </button>
                        ))}
                        {unassigned > 0 && (
                            <button type="button" onClick={() => setWho(who === 'none' ? 'all' : 'none')} className={cn('flex cursor-pointer items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-[12px] font-bold transition-colors', who === 'none' ? 'border-[#6C47FF] bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                                <Face user={null} />Nadie <span className="tabular-nums opacity-70">{unassigned}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {focused && (
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                    Viendo sólo: <b className="text-foreground">{focused.label.toLowerCase()}</b>
                    <button type="button" onClick={() => setFocus(null)} className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-bold text-primary hover:bg-primary/10"><XIcon className="size-3.5" />Quitar</button>
                </div>
            )}

            <div className="mesa" style={{ gridTemplateColumns: template }}>
                {columns.map(({ stage, cards }) => (
                    <section
                        key={stage.key}
                        style={{ ['--stage' as string]: stage.color }}
                        className={cn('mesa-col', over === stage.key && 'over')}
                        onDragOver={event => { if (!dragId) return; event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(stage.key) }}
                        onDragLeave={() => setOver(current => current === stage.key ? null : current)}
                        onDrop={event => {
                            event.preventDefault()
                            const task = tasks.find(item => item.id === event.dataTransfer.getData('text/task'))
                            setOver(null); setDragId(null)
                            if (task) moveTo(task, stage.key)
                        }}
                    >
                        <header className="mesa-col__head">
                            <i className="mesa-col__dot" />
                            <b className="truncate text-[13px] font-extrabold tracking-tight">{stage.title}</b>
                            <span className="text-[12px] font-bold text-muted-foreground tabular-nums">{cards.length}</span>
                        </header>
                        {loading ? (
                            <div className="mesa-col__body">{Array.from({ length: 2 }, (_, index) => <span key={index} className="h-[92px] animate-pulse rounded-2xl bg-foreground/[.06]" />)}</div>
                        ) : cards.length ? (
                            <div className="mesa-col__body">
                                {cards.map(task => <Card key={task.id} task={task} compact={stage.key === 'done'} busy={moving === task.id} dragging={dragId === task.id} canAssign={canAssign} onOpen={onOpen} onAssign={assign} onDragState={setDragId} />)}
                            </div>
                        ) : (
                            <p className="mesa-col__empty">{dragId ? 'Suéltala aquí' : `${stage.hint}.`}</p>
                        )}
                    </section>
                ))}
            </div>

            <p className="text-[11.5px] text-muted-foreground">Arrastra una tarjeta a otra columna para cambiarle la etapa. La carita asigna. Un clic abre la ficha con comentarios, archivos y fechas.</p>
        </div>
    )
}

export default TaskBoard
