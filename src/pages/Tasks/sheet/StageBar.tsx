import { useEffect, useRef } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { ITask, TaskStatusTypes } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import { STAGES, stageOf } from '../lib'
import { stageStatuses } from './lib'

interface StageBarProps {
    task: ITask
    disabled: boolean
    onPick: (slug: TaskStatusTypes) => void
}

/**
 * Las cinco etapas de la mesa, en la ficha: la del pedido encendida y las demás a un clic. Donde una etapa
 * junta varios estados (en Biblioteca: «Lista para publicar», «Completada», «Publicada»), el clic abre la
 * lista para elegir el exacto, y el exacto se lee junto a la etapa.
 */
const StageBar = ({ task, disabled, onPick }: StageBarProps) => {
    const statuses = useAuthStore(state => state.utilData.task_statuses)
    const current = stageOf(task)
    const nameOf = (slug: TaskStatusTypes) => statuses.find(status => status.slug === slug)?.name ?? slug
    const bar = useRef<HTMLDivElement>(null)

    /* En el celular la barra se desliza de lado: la etapa del pedido siempre a la vista */
    useEffect(() => {
        const box = bar.current
        const on = box?.querySelector<HTMLElement>('.ficha-stage.on')
        if (box && on && box.scrollWidth > box.clientWidth) box.scrollTo({ left: on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' })
    }, [current])

    return (
        <div ref={bar} className={cn('ficha-stages', disabled && 'locked')} role="group" aria-label="Etapa del pedido">
            {STAGES.map(stage => {
                const active = stage.key === current
                const options = stageStatuses(task, stage.key)
                /* El estado exacto sólo se dice donde la etapa junta varios y no se llama igual que ella */
                const exact = active && stage.statuses.length > 1 && task.task_status?.name && task.task_status.name !== stage.title ? task.task_status.name : null
                const style = { ['--stage' as string]: stage.color }
                const body = <>
                    <i />
                    <span>{stage.title}</span>
                    {exact && <small>· {exact}</small>}
                    {options.length > 1 && !disabled && <ChevronDownIcon className="size-3.5 opacity-50" />}
                </>

                if (options.length > 1) {
                    return (
                        <DropdownMenu key={stage.key}>
                            <DropdownMenuTrigger disabled={disabled} className={cn('ficha-stage', active && 'on')} style={style} aria-current={active ? 'step' : undefined}>
                                {body}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-56 rounded-2xl p-1.5">
                                <DropdownMenuLabel className="text-[11px] text-muted-foreground">{stage.title}</DropdownMenuLabel>
                                {options.map(slug => {
                                    const here = task.task_status?.slug === slug
                                    return (
                                        <DropdownMenuItem key={slug} disabled={here} className="cursor-pointer gap-2 rounded-xl text-[13px] font-semibold" onClick={() => onPick(slug)}>
                                            <span className="grid size-4 place-items-center">{here && <CheckIcon className="size-4" />}</span>
                                            {nameOf(slug)}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }

                return (
                    <button key={stage.key} type="button" className={cn('ficha-stage', active && 'on')} style={style} disabled={disabled || active} aria-current={active ? 'step' : undefined} onClick={() => onPick(options[0])}>
                        {body}
                    </button>
                )
            })}
        </div>
    )
}

export default StageBar
