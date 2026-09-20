import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ITask, TaskStatusTypes } from '@/interfaces/tasks'
import { TasksService } from '@/services/tasks.service'
import useAuthStore from '@/store/auth'
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from '@/utils/events'

export type StageKey = 'todo' | 'doing' | 'review' | 'fix' | 'done'

/** Las ocho etiquetas de estado de la base, leídas como las cinco etapas por las que pasa un diseño */
export const STAGES: Array<{ key: StageKey, title: string, hint: string, statuses: TaskStatusTypes[], dropTo: TaskStatusTypes }> = [
    { key: 'todo', title: 'Por asignar', hint: 'Nadie lo ha tomado', statuses: [TaskStatusTypes.UNASSIGNED], dropTo: TaskStatusTypes.UNASSIGNED },
    { key: 'doing', title: 'En proceso', hint: 'Alguien lo está haciendo', statuses: [TaskStatusTypes.IN_PROGRESS, TaskStatusTypes.UPLOAD_AE_RESOURCES], dropTo: TaskStatusTypes.IN_PROGRESS },
    { key: 'review', title: 'Por revisar', hint: 'Espera tu visto bueno', statuses: [TaskStatusTypes.READY_FOR_REVIEW], dropTo: TaskStatusTypes.READY_FOR_REVIEW },
    { key: 'fix', title: 'Corrección', hint: 'La clienta pidió un cambio', statuses: [TaskStatusTypes.PENDING_CORRECTION], dropTo: TaskStatusTypes.PENDING_CORRECTION },
    { key: 'done', title: 'Listo', hint: 'Entregado este mes', statuses: [TaskStatusTypes.READY_FOR_PUBLISH, TaskStatusTypes.COMPLETED, TaskStatusTypes.PUBLISHED], dropTo: TaskStatusTypes.COMPLETED },
]

const OPEN_SLUGS: TaskStatusTypes[] = STAGES.filter(stage => stage.key !== 'done').flatMap(stage => stage.statuses)
const OPEN_KEY = ['tasks', 'board', 'open']
const DONE_KEY = ['tasks', 'board', 'done']

export const stageOf = (task: ITask): StageKey => STAGES.find(stage => stage.statuses.includes(task.task_status?.slug as TaskStatusTypes))?.key ?? 'todo'

/**
 * La mesa de trabajo: TODO lo que sigue abierto (sea del mes que sea: lo atrasado del mes pasado es
 * justo lo que no debe esconderse) más lo entregado este mes. Son dos consultas al mismo listado
 * de siempre; mover una tarjeta es el mismo PATCH que hace la ficha de la tarea.
 */
const useTaskBoard = () => {
    const queryClient = useQueryClient()
    const statuses = useAuthStore(state => state.utilData.task_statuses)
    const [moving, setMoving] = useState<string | null>(null)

    const openIds = useMemo(() => statuses.filter(status => OPEN_SLUGS.includes(status.slug)).map(status => status.id), [statuses])
    const doneIds = useMemo(() => statuses.filter(status => !OPEN_SLUGS.includes(status.slug)).map(status => status.id), [statuses])

    const open = useFetchQuery<ITask[]>(API_ROUTES.TASKS.LIST, { queryParams: { statuses: openIds }, customQueryKey: OPEN_KEY, enabled: openIds.length > 0, staleTime: 30_000 })
    const done = useFetchQuery<ITask[]>(API_ROUTES.TASKS.LIST, { queryParams: { statuses: doneIds, month: new Date().getMonth() + 1 }, customQueryKey: DONE_KEY, enabled: doneIds.length > 0, staleTime: 30_000 })

    const tasks = useMemo(() => {
        const all = [...(Array.isArray(open.response) ? open.response : []), ...(Array.isArray(done.response) ? done.response : [])]
        /* Una tarjeta recién movida puede estar un instante en las dos listas */
        return [...new Map(all.map(task => [task.id, task])).values()]
    }, [open.response, done.response])

    /** Reescribe una tarea en las dos listas en caché (o la quita, si `next` es null) */
    const patchCache = useCallback((id: string, next: Partial<ITask> | null) => {
        ;[OPEN_KEY, DONE_KEY].forEach(key => queryClient.setQueryData<ITask[]>(key, current =>
            !Array.isArray(current) ? current : next === null ? current.filter(task => task.id !== id) : current.map(task => task.id === id ? { ...task, ...next } : task)))
    }, [queryClient])

    /* Lo que se guarda desde la ficha de la tarea llega por el mismo evento que ya usa el calendario */
    useEffect(() => {
        const onUpdate = (event: Event) => {
            const detail = (event as BrowserEvent<Partial<ITask> & { id: string, eventType: string }>).detail
            if (!detail?.id) return
            if (detail.eventType === 'delete') return patchCache(detail.id, null)
            if (detail.eventType === 'add') { queryClient.invalidateQueries({ queryKey: OPEN_KEY }); return }
            patchCache(detail.id, detail)
        }
        subscribeEvent('tasks-updated', onUpdate)
        return () => unsubscribeEvent('tasks-updated', onUpdate)
    }, [patchCache, queryClient])

    const save = async (task: ITask, body: { status?: string, user?: string | null }, optimistic: Partial<ITask>, okMessage: string) => {
        const before = { task_status: task.task_status, assigned_to: task.assigned_to }
        setMoving(task.id)
        patchCache(task.id, optimistic)
        try {
            const response = await TasksService.patchTask(task.id, body)
            if (response?.data) patchCache(task.id, response.data)
            toast.success(okMessage)
        } catch (error) {
            patchCache(task.id, before)
            toast.error((error as { message?: string })?.message || 'No se pudo guardar el cambio')
        } finally {
            setMoving(null)
        }
    }

    const moveTo = (task: ITask, stage: StageKey) => {
        if (stageOf(task) === stage) return
        const target = STAGES.find(item => item.key === stage)
        const status = statuses.find(item => item.slug === target?.dropTo)
        if (!target || !status) return
        return save(task, { status: status.id }, { task_status: status }, `#${task.consecutive} pasó a «${target.title}»`)
    }

    const assign = (task: ITask, user: ITask['assigned_to']) =>
        save(task, { user: user?.id ?? null }, { assigned_to: user }, user ? `#${task.consecutive} es de ${user.name.split(' ')[0]}` : `#${task.consecutive} quedó sin asignar`)

    return { tasks, loading: (open.loading && !open.response) || statuses.length === 0, moving, moveTo, assign }
}

export default useTaskBoard
