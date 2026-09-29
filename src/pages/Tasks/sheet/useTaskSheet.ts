import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ITask, ITaskDetail, ITaskUpdate } from '@/interfaces/tasks'
import HttpService from '@/services/http'
import { TasksService } from '@/services/tasks.service'
import { publishEvent } from '@/utils/events'
import { queryKeys } from '@/utils/queryKeys'

/** Las consultas de la ficha: la conversación, los archivos y las plantillas de Nexrender de UN pedido */
export const sheetKeys = {
    activity: (id: string) => ['task-sheet', id, 'activity'],
    files: (id: string) => ['task-sheet', id, 'files'],
    templates: (id: string) => ['task-sheet', id, 'templates'],
}

/** El motivo que da la API (el primero de la validación, si lo hay) o uno nuestro */
export const errorText = (error: unknown, fallback: string) => {
    const body = error as { message?: string, errors?: Record<string, string[]> } | null
    const first = body?.errors ? Object.values(body.errors).flat()[0] : null
    return first || body?.message || fallback
}

/**
 * La ficha de un pedido: su estado vivo y cómo se guarda. Cada cambio es el mismo PATCH de siempre; se ve al
 * instante y, si la API lo rechaza, regresa como estaba con el motivo. Lo guardado se avisa con el mismo
 * evento que ya escuchan la mesa, el calendario y la lista, así la tarjeta cambia sin recargar.
 */
const useTaskSheet = (task: ITask) => {
    const queryClient = useQueryClient()
    const [current, setCurrent] = useState<ITask>(task)
    const currentRef = useRef(current)
    currentRef.current = current
    const [pending, setPending] = useState(0)
    const [savedAt, setSavedAt] = useState<number | null>(null)

    /* El detalle trae el evento (fechas, lugar, liga) de las invitaciones; lo demás ya venía en la lista */
    const { response: detail, loading: loadingDetail } = useFetchQuery<ITaskDetail>(API_ROUTES.TASKS.DETAIL.replace('{id}', task.id), {
        customQueryKey: queryKeys.detail('task', task.id),
        enabled: Boolean(task.id),
    })

    /* Cada movimiento deja su línea en la conversación: se vuelve a pedir para que aparezca */
    const refreshActivity = useCallback(() => queryClient.invalidateQueries({ queryKey: sheetKeys.activity(task.id) }), [queryClient, task.id])

    const save = async (body: ITaskUpdate, optimistic?: Partial<ITask>, okMessage?: string) => {
        const keys = Object.keys(optimistic ?? {}) as Array<keyof ITask>
        const before = Object.fromEntries(keys.map(key => [key, currentRef.current[key]])) as Partial<ITask>
        if (optimistic) setCurrent(value => ({ ...value, ...optimistic }))
        setPending(count => count + 1)
        try {
            const response = await TasksService.patchTask(task.id, body)
            const next = response?.data
            if (next) {
                /* La respuesta no trae quién lo pidió: se queda el de la lista */
                setCurrent(value => ({ ...value, ...next, created_by: value.created_by }))
                publishEvent('tasks-updated', { ...next, eventType: 'update' })
            }
            setSavedAt(Date.now())
            if (okMessage) toast.success(okMessage)
            refreshActivity()
            return true
        } catch (error) {
            if (optimistic) setCurrent(value => ({ ...value, ...before }))
            toast.error(errorText(error, 'No se pudo guardar el cambio'))
            return false
        } finally {
            setPending(count => count - 1)
        }
    }

    const remove = async () => {
        try {
            await HttpService.delete(API_ROUTES.TASKS.DELETE.replace('{id}', task.id))
            publishEvent('tasks-updated', { id: task.id, eventType: 'delete' })
            toast.success(`Se eliminó el pedido #${task.consecutive}`)
            return true
        } catch (error) {
            toast.error(errorText(error, 'No se pudo eliminar el pedido'))
            return false
        }
    }

    return { current, detail, loadingDetail, saving: pending > 0, savedAt, save, remove, refreshActivity }
}

export type TaskSheetState = ReturnType<typeof useTaskSheet>

export default useTaskSheet
