import { useMemo, useState } from 'react'
import { CalendarClockIcon, PaperclipIcon, SearchIcon } from 'lucide-react'

import useAuth from '@/hooks/useAuth'
import { RoleKeys } from '@/interfaces/common'
import { ITask, TaskTypes } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import useTaskBoard, { STAGES, StageKey, stageOf } from './useTaskBoard'
import '@/pages/Hoy/hoy.css'
import './board.css'

const KIND: Record<string, { label: string, css: string }> = {
    [TaskTypes.SERVICE]: { label: 'De clienta', css: 'kind-request' },
    [TaskTypes.TOOLS]: { label: 'Biblioteca', css: 'kind-tools' },
    [TaskTypes.TRAININGS]: { label: 'Entrenamiento', css: 'kind-trainings' },
}

type Horizon = 'week' | 'month' | 'all'

const DAY = 86_400_000
const startOfDay = (value: Date | string) => { const d = new Date(value); d.setHours(0, 0, 0, 0); return d.getTime() }
const daysLeft = (task: ITask) => Math.round((startOfDay(task.expired_at) - startOfDay(new Date())) / DAY)

const dueLabel = (task: ITask, finished: boolean): { text: string, tone: '' | 'late' | 'today' } => {
    const left = daysLeft(task)
    const hour = new Date(task.expired_at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
    const date = new Date(task.expired_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    if (finished) return { text: date, tone: '' }
    if (left < 0) return { text: left === -1 ? 'venció ayer' : `atrasada ${-left} días`, tone: 'late' }
    if (left === 0) return { text: `vence hoy · ${hour}`, tone: 'today' }
    if (left === 1) return { text: `mañana · ${hour}`, tone: '' }
    return { text: left < 7 ? `en ${left} días · ${date}` : date, tone: '' }
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('')

const Face = ({ user }: { user: ITask['assigned_to'] }) => {
    if (!user) return <span className="mesa-face none" title="Sin asignar">?</span>
    const photo = (user as unknown as { photo?: string | null }).photo ?? user.profile_picture?.url
    return photo ? <img src={photo} alt="" title={user.name} className="mesa-face" /> : <span className="mesa-face" title={user.name}>{initials(user.name)}</span>
}

interface CardProps {
    task: ITask
    busy: boolean
    canAssign: boolean
    onOpen: (task: ITask) => void
    onAssign: (task: ITask, user: ITask['assigned_to']) => void
    onDragState: (id: string | null) => void
    dragging: boolean
}

const Card = ({ task, busy, canAssign, onOpen, onAssign, onDragState, dragging }: CardProps) => {
    const designers = useAuthStore(state => state.utilData.designers)
    const kind = KIND[task.task_type?.slug] ?? { label: task.task_type?.name ?? 'Tarea', css: '' }
    const finished = stageOf(task) === 'done'
    const due = dueLabel(task, finished)

    return (
        <article
            draggable={!busy}
            onDragStart={event => { event.dataTransfer.setData('text/task', task.id); event.dataTransfer.effectAllowed = 'move'; onDragState(task.id) }}
            onDragEnd={() => onDragState(null)}
            onClick={() => onOpen(task)}
            className={cn('mesa-card shell-glass', kind.css, dragging && 'dragging', busy && 'busy')}
        >
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-muted-foreground">
                <span className="tabular-nums">#{task.consecutive}</span>
                <span className="opacity-50">·</span>
                <span className="truncate">{kind.label}</span>
                {task.files?.length > 0 && <span className="ml-auto inline-flex items-center gap-0.5"><PaperclipIcon className="size-3" />{task.files.length}</span>}
            </div>

            <h3 className="line-clamp-2 text-[13px] leading-snug font-bold">{task.title}</h3>

            <div className="flex items-center justify-between gap-2">
                <span className={cn('mesa-due', due.tone)}><CalendarClockIcon className="size-3.5" />{due.text}</span>

                {canAssign && !finished ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={event => event.stopPropagation()} className="cursor-pointer rounded-full outline-none transition-transform hover:scale-110" aria-label="Asignar">
                            <Face user={task.assigned_to} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="shell-drop min-w-52 rounded-2xl p-1.5" onClick={event => event.stopPropagation()}>
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
                ) : <Face user={task.assigned_to} />}
            </div>
        </article>
    )
}

/**
 * «La mesa»: el trabajo de diseño ordenado por ETAPA y no por día del mes. La pregunta del equipo
 * es «¿qué muevo hoy?», no «¿qué cae el 14?». Arrastrar una tarjeta a otra columna le cambia el
 * estado; la carita asigna; un clic abre la ficha de siempre (comentarios, archivos, fechas).
 */
const TaskBoard = ({ onOpen }: { onOpen: (task: ITask) => void }) => {
    const { user } = useAuth()
    const { tasks, loading, moving, moveTo, assign } = useTaskBoard()
    const designers = useAuthStore(state => state.utilData.designers)

    const [kind, setKind] = useState<string>('all')
    const [who, setWho] = useState<string>('all')
    const [horizon, setHorizon] = useState<Horizon>('week')
    const [search, setSearch] = useState('')
    const [dragId, setDragId] = useState<string | null>(null)
    const [over, setOver] = useState<StageKey | null>(null)

    const canAssign = user?.role?.role_key === RoleKeys.SUPER_ADMIN

    const shown = useMemo(() => {
        const text = search.trim().toLowerCase()
        const limit = horizon === 'week' ? 7 : horizon === 'month' ? 31 : Infinity
        return tasks.filter(task => {
            if (kind !== 'all' && task.task_type?.slug !== kind) return false
            if (who === 'none' ? !!task.assigned_to : who !== 'all' && task.assigned_to?.id !== who) return false
            if (text && !`${task.consecutive} ${task.title}`.toLowerCase().includes(text)) return false
            /* El horizonte sólo recorta lo que viene: lo atrasado y lo ya entregado siempre se ven */
            if (stageOf(task) !== 'done' && daysLeft(task) > limit) return false
            return true
        })
    }, [tasks, kind, who, horizon, search])

    const open = tasks.filter(task => stageOf(task) !== 'done')
    const counters = [
        { label: 'Por asignar', value: open.filter(task => !task.assigned_to).length, tone: 'plain' },
        { label: 'Vencen hoy', value: open.filter(task => daysLeft(task) === 0).length, tone: 'warn' },
        { label: 'Atrasadas', value: open.filter(task => daysLeft(task) < 0).length, tone: 'bad' },
        { label: 'En corrección', value: open.filter(task => stageOf(task) === 'fix').length, tone: 'bad' },
        { label: 'Por revisar', value: open.filter(task => stageOf(task) === 'review').length, tone: 'live' },
    ]

    const load = designers.map(designer => ({ designer, count: open.filter(task => task.assigned_to?.id === designer.id).length })).sort((a, b) => b.count - a.count)
    const kinds = Object.entries(KIND).filter(([slug]) => tasks.some(task => task.task_type?.slug === slug))

    const chip = (active: boolean) => cn('inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', active ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3.5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {counters.map(item => (
                    <div key={item.label} className="shell-glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                        <span className="text-[12px] font-semibold text-muted-foreground">{item.label}</span>
                        <b className={cn('text-[22px] leading-none font-extrabold tracking-tight tabular-nums', item.value > 0 && item.tone === 'bad' && 'text-rose-500', item.value > 0 && item.tone === 'warn' && 'text-amber-500')}>{item.value}</b>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[260px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Número o título…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                </label>

                <button type="button" className={chip(kind === 'all')} onClick={() => setKind('all')}>Todo</button>
                {kinds.map(([slug, item]) => <button key={slug} type="button" className={chip(kind === slug)} onClick={() => setKind(kind === slug ? 'all' : slug)}>{item.label}</button>)}

                <span className="mx-0.5 hidden h-7 w-px bg-border md:block" />
                {([['week', 'Esta semana'], ['month', 'Este mes'], ['all', 'Todo lo que viene']] as Array<[Horizon, string]>).map(([key, label]) => <button key={key} type="button" className={chip(horizon === key)} onClick={() => setHorizon(key)}>{label}</button>)}

                {canAssign && load.length > 0 && (
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="hidden text-[11.5px] font-semibold text-muted-foreground xl:inline">Carga</span>
                        {load.map(({ designer, count }) => (
                            <button key={designer.id} type="button" title={`${designer.name}: ${count} abiertas`} onClick={() => setWho(who === designer.id ? 'all' : designer.id)} className={cn('flex cursor-pointer items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-[12px] font-bold transition-colors', who === designer.id ? 'border-[#6C47FF] bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                                <Face user={designer} />{count}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mesa">
                {STAGES.map(stage => {
                    const cards = shown.filter(task => stageOf(task) === stage.key).sort((a, b) => stage.key === 'done' ? startOfDay(b.expired_at) - startOfDay(a.expired_at) : new Date(a.expired_at).getTime() - new Date(b.expired_at).getTime())
                    return (
                        <section
                            key={stage.key}
                            className={cn('mesa-col', stage.key, over === stage.key && 'over')}
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
                                <b className="text-[13px] font-extrabold tracking-tight">{stage.title}</b>
                                <span className="text-[12px] font-bold text-muted-foreground tabular-nums">{cards.length}</span>
                            </header>
                            <div className="mesa-col__body">
                                {cards.map(task => <Card key={task.id} task={task} busy={moving === task.id} dragging={dragId === task.id} canAssign={canAssign} onOpen={onOpen} onAssign={assign} onDragState={setDragId} />)}
                                {loading && Array.from({ length: 2 }, (_, index) => <span key={index} className="h-[86px] animate-pulse rounded-2xl bg-foreground/[.06]" />)}
                                {!loading && !cards.length && <p className="px-2 py-6 text-center text-[11.5px] leading-snug text-muted-foreground">{stage.hint}.<br />Nada aquí{horizon !== 'all' ? ' en este rango' : ''}.</p>}
                            </div>
                        </section>
                    )
                })}
            </div>

            <p className="text-[11.5px] text-muted-foreground">Arrastra una tarjeta a otra columna para cambiarle la etapa. La carita asigna. Un clic abre la ficha con comentarios, archivos y fechas.</p>
        </div>
    )
}

export default TaskBoard
