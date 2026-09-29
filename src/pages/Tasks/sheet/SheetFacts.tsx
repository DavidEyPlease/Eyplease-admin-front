import { useEffect, useRef, useState } from 'react'
import { CalendarClockIcon, CalendarIcon, CheckIcon, ChevronDownIcon, Clock3Icon, LayersIcon, ShapesIcon, UserRoundIcon, UsersIcon } from 'lucide-react'

import { TOOLS_TYPES } from '@/constants/app'
import { ITask, ITaskUpdate, TaskTypes } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { Calendar } from '@/uishadcn/ui/calendar'
import { es } from 'react-day-picker/locale/es'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/uishadcn/ui/popover'
import { toLocalDateFromUtc } from '@/utils/dates'
import Face from '../Face'
import { dueInfo, kindInfo, stageOf } from '../lib'
import { dayOf, firstName, hourOf, isClientRequest } from './lib'

type Save = (body: ITaskUpdate, optimistic?: Partial<ITask>, okMessage?: string) => Promise<boolean>

const Fact = ({ icon: Icon, label, children }: { icon: typeof UserRoundIcon, label: string, children: React.ReactNode }) => (
    <div className="ficha-fact">
        <dt><Icon className="size-4 shrink-0" />{label}</dt>
        <dd className="min-w-0">{children}</dd>
    </div>
)

const pad = (value: number) => String(value).padStart(2, '0')

/** El día de un `Date` con la hora de otro, como ISO: para ver la entrega nueva antes de que conteste la API */
const withTime = (day: Date, time: string) => {
    const [hours, minutes, seconds = '0'] = time.split(':')
    const next = new Date(day)
    next.setHours(Number(hours), Number(minutes), Number(seconds), 0)
    return next
}

/** La entrega: día en calendario y hora. La hora se guarda al dejar de moverla, no con cada número. */
const DueField = ({ task, disabled, save }: { task: ITask, disabled: boolean, save: Save }) => {
    const due = new Date(task.expired_at)
    const savedTime = `${pad(due.getHours())}:${pad(due.getMinutes())}`
    const [time, setTime] = useState(savedTime)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const info = dueInfo(task)
    const late = info.tone === 'late' || info.tone === 'today'

    useEffect(() => setTime(savedTime), [savedTime])
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

    const pickDay = (day: Date | undefined) => {
        if (!day) return
        save({ expired_at: day }, { expired_at: withTime(day, savedTime) })
    }

    const changeTime = (value: string) => {
        setTime(value)
        if (timer.current) clearTimeout(timer.current)
        if (!/^\d{2}:\d{2}$/.test(value) || value === savedTime) return
        timer.current = setTimeout(() => save({ expired_at_time: `${value}:00` }, { expired_at: withTime(due, value) }), 700)
    }

    return (
        <Popover>
            <PopoverTrigger disabled={disabled} className="ficha-control">
                {/* Lo atrasado ya lo dice la cabecera; aquí, en rojo o ámbar */}
                <span className={cn('truncate', late && stageOf(task) !== 'done' && `ficha-late ${info.tone}`)}>{dayOf(due)} · {hourOf(due)}</span>
                <ChevronDownIcon className="chev size-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-2xl p-0">
                <Calendar mode="single" locale={es} weekStartsOn={1} selected={due} defaultMonth={due} onSelect={pickDay} required />
                <label className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-[12.5px] font-semibold text-muted-foreground">
                    Hora de entrega
                    <input type="time" value={time} onChange={event => changeTime(event.target.value)} className="h-9 rounded-xl border border-border bg-transparent px-2.5 text-[13px] font-bold text-foreground tabular-nums outline-none focus:border-[#6C47FF]" />
                </label>
            </PopoverContent>
        </Popover>
    )
}

interface SheetFactsProps {
    task: ITask
    locked: boolean
    save: Save
}

/**
 * Los datos del pedido, en la columna: quién lo hace, cuándo se entrega y cuándo sale; en Biblioteca, dónde
 * se publica y para qué planes. Cada uno se cambia en su lugar y se guarda solo.
 */
const SheetFacts = ({ task, locked, save }: SheetFactsProps) => {
    const { designers, plans } = useAuthStore(state => state.utilData)
    const metadata = task.metadata ?? {}
    const kind = kindInfo(task)
    const stage = stageOf(task)
    const started = toLocalDateFromUtc(task.started_at)
    const isTools = task.task_type?.slug === TaskTypes.TOOLS
    const planIds = metadata.plan_ids ?? []
    const section = TOOLS_TYPES.find(item => item.value === metadata.tools_section)

    /* La metadata de Biblioteca se valida completa en la API: se manda entera con el tipo */
    const saveMetadata = (next: Partial<ITask['metadata']>, okMessage: string) => {
        const merged = { ...metadata, ...next }
        return save({ metadata: merged, type: task.task_type?.slug }, { metadata: merged }, okMessage)
    }

    const assign = (user: ITask['assigned_to']) => save(
        { user: user?.id ?? null },
        { assigned_to: user },
        user ? `#${task.consecutive} es de ${firstName(user.name)}` : `#${task.consecutive} quedó sin asignar`,
    )

    const togglePlan = (id: string, on: boolean) => saveMetadata({ plan_ids: on ? [...planIds, id] : planIds.filter(plan => plan !== id) }, on ? 'Plan agregado' : 'Plan quitado')

    return (
        <section className="ficha-card">
            <h3 className="ficha-h">Datos</h3>
            <dl className="ficha-facts">
                <Fact icon={UserRoundIcon} label="Lo hace">
                    <DropdownMenu>
                        <DropdownMenuTrigger disabled={locked} className="ficha-control">
                            <Face user={task.assigned_to} size={22} />
                            <span className={cn('truncate', !task.assigned_to && 'text-muted-foreground')}>{task.assigned_to?.name ?? 'Sin asignar'}</span>
                            <ChevronDownIcon className="chev size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-60 rounded-2xl p-1.5">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">¿Quién lo hace?</DropdownMenuLabel>
                            {designers.map(designer => (
                                <DropdownMenuItem key={designer.id} className="cursor-pointer gap-2 rounded-xl" disabled={designer.id === task.assigned_to?.id} onClick={() => assign(designer)}>
                                    <Face user={designer} /> <span className="truncate text-[13px] font-semibold">{designer.name}</span>
                                    {designer.id === task.assigned_to?.id && <CheckIcon className="ml-auto size-4" />}
                                </DropdownMenuItem>
                            ))}
                            {!designers.length && <p className="px-2 py-2 text-[12px] text-muted-foreground">No hay diseñadores dados de alta.</p>}
                            {task.assigned_to && <><DropdownMenuSeparator /><DropdownMenuItem className="cursor-pointer rounded-xl text-[13px]" onClick={() => assign(null)}>Dejar sin asignar</DropdownMenuItem></>}
                            {/* La API regresa a «En proceso» todo pedido al que se le asigna alguien */}
                            {(stage === 'review' || stage === 'fix' || stage === 'done') && (
                                <p className="max-w-60 px-2 pt-2 pb-1 text-[11px] leading-snug text-muted-foreground">Asignarlo a alguien lo regresa a «En proceso».</p>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Fact>

                <Fact icon={CalendarClockIcon} label="Entrega">
                    <DueField task={task} disabled={locked} save={save} />
                </Fact>

                <Fact icon={CalendarIcon} label="Publicación">
                    <Popover>
                        <PopoverTrigger disabled={locked} className="ficha-control">
                            <span className="truncate">{dayOf(started)}</span>
                            <ChevronDownIcon className="chev size-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-auto rounded-2xl p-0">
                            <Calendar mode="single" locale={es} weekStartsOn={1} selected={started} defaultMonth={started} required onSelect={day => day && save({ started_at: day }, { started_at: day })} />
                        </PopoverContent>
                    </Popover>
                </Fact>

                {metadata.tools_section && (
                    <Fact icon={LayersIcon} label="Sección">
                        <DropdownMenu>
                            <DropdownMenuTrigger disabled={locked} className="ficha-control">
                                <span className="truncate">{section?.label ?? metadata.tools_section}</span>
                                <ChevronDownIcon className="chev size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-60 rounded-2xl p-1.5">
                                <DropdownMenuLabel className="text-[11px] text-muted-foreground">Dónde sale en la biblioteca</DropdownMenuLabel>
                                {TOOLS_TYPES.map(item => (
                                    <DropdownMenuItem key={item.value} className="cursor-pointer gap-2 rounded-xl text-[13px] font-semibold" disabled={item.value === metadata.tools_section} onClick={() => saveMetadata({ tools_section: item.value }, `Sección: ${item.label}`)}>
                                        <span className="grid size-4 place-items-center">{item.value === metadata.tools_section && <CheckIcon className="size-4" />}</span>
                                        {item.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Fact>
                )}

                {metadata.plan_ids && (
                    <Fact icon={UsersIcon} label="Planes">
                        <DropdownMenu>
                            <DropdownMenuTrigger disabled={locked} className="ficha-control !h-auto min-h-9 py-1.5">
                                <span className="flex min-w-0 flex-wrap gap-1">
                                    {planIds.length && planIds.length === plans.length
                                        ? <span className="ficha-plan">Todos ({plans.length})</span>
                                        : planIds.length
                                            ? planIds.map(id => {
                                                const plan = plans.find(item => item.id === id)
                                                return <span key={id} className="ficha-plan"><i style={{ background: plan?.color ?? '#94A3B8' }} />{plan?.name.replace(/^Plan\s+/i, '') ?? 'Plan'}</span>
                                            })
                                            : <span className="text-muted-foreground">Ninguno</span>}
                                </span>
                                <ChevronDownIcon className="chev size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-60 rounded-2xl p-1.5">
                                <DropdownMenuLabel className="text-[11px] text-muted-foreground">Qué planes lo reciben</DropdownMenuLabel>
                                {plans.map(plan => {
                                    const on = planIds.includes(plan.id)
                                    /* En Biblioteca la API pide al menos uno: el último no se puede quitar */
                                    const last = on && planIds.length === 1 && isTools
                                    return (
                                        <DropdownMenuCheckboxItem key={plan.id} checked={on} disabled={last} className="cursor-pointer rounded-xl text-[13px] font-semibold" onSelect={event => event.preventDefault()} onCheckedChange={value => togglePlan(plan.id, Boolean(value))}>
                                            <i className="size-2 shrink-0 rounded-full" style={{ background: plan.color ?? '#94A3B8' }} />{plan.name}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Fact>
                )}

                <Fact icon={ShapesIcon} label="Tipo">
                    <span className="flex h-9 items-center gap-2 px-2.5 text-[13px] font-semibold"><i className="size-2 shrink-0 rounded-full" style={{ background: kind.color }} />{kind.label}</span>
                </Fact>

                <Fact icon={Clock3Icon} label="Pedido">
                    <span className="flex h-9 min-w-0 items-center px-2.5 text-[13px] font-semibold">
                        <span className="truncate">{dayOf(task.created_at)}{task.created_by?.name && !isClientRequest(task) ? ` · ${firstName(task.created_by.name)}` : ''}</span>
                    </span>
                </Fact>
            </dl>
        </section>
    )
}

export default SheetFacts
