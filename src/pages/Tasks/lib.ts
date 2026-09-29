import { ITask, TaskStatusTypes, TaskTypes, isCloneReel } from '@/interfaces/tasks'

/* Lo que comparten las tres vistas de Pedidos de diseño (la mesa, el calendario y la lista): etapas, tipos,
   fechas en palabras y la foto de quien lo hace. */

export type StageKey = 'todo' | 'doing' | 'review' | 'fix' | 'done'

/** Las ocho etiquetas de estado de la base, leídas como las cinco etapas por las que pasa un diseño */
export const STAGES: Array<{ key: StageKey, title: string, hint: string, color: string, statuses: TaskStatusTypes[], dropTo: TaskStatusTypes }> = [
    { key: 'todo', title: 'Por asignar', hint: 'Nadie lo ha tomado', color: '#94A3B8', statuses: [TaskStatusTypes.UNASSIGNED], dropTo: TaskStatusTypes.UNASSIGNED },
    { key: 'doing', title: 'En proceso', hint: 'Alguien lo está haciendo', color: '#F59E0B', statuses: [TaskStatusTypes.IN_PROGRESS, TaskStatusTypes.UPLOAD_AE_RESOURCES], dropTo: TaskStatusTypes.IN_PROGRESS },
    { key: 'review', title: 'Por revisar', hint: 'Espera tu visto bueno', color: '#22D3EE', statuses: [TaskStatusTypes.READY_FOR_REVIEW], dropTo: TaskStatusTypes.READY_FOR_REVIEW },
    { key: 'fix', title: 'Corrección', hint: 'La clienta pidió un cambio', color: '#F43F5E', statuses: [TaskStatusTypes.PENDING_CORRECTION], dropTo: TaskStatusTypes.PENDING_CORRECTION },
    { key: 'done', title: 'Listo', hint: 'Entregado este mes', color: '#10B981', statuses: [TaskStatusTypes.READY_FOR_PUBLISH, TaskStatusTypes.COMPLETED, TaskStatusTypes.PUBLISHED], dropTo: TaskStatusTypes.COMPLETED },
]

export const stageOf = (task: ITask): StageKey => STAGES.find(stage => stage.statuses.includes(task.task_status?.slug as TaskStatusTypes))?.key ?? 'todo'
export const stageInfo = (task: ITask) => STAGES.find(stage => stage.key === stageOf(task)) ?? STAGES[0]

/** Las etapas donde el trabajo es del equipo: ahí sí cuenta la fecha de entrega. En «Por revisar» el
    diseño ya se entregó y la pelota está en tu cancha; en «Listo» ya terminó. */
export const isTeamWork = (task: ITask) => ['todo', 'doing', 'fix'].includes(stageOf(task))

export const CLONE_REEL = 'clone-reel'

export const KIND: Record<string, { label: string, color: string }> = {
    [TaskTypes.SERVICE]: { label: 'De clienta', color: '#A855F7' },
    [TaskTypes.TOOLS]: { label: 'Biblioteca', color: '#14B8A6' },
    [TaskTypes.TRAININGS]: { label: 'Entrenamiento', color: '#6366F1' },
    [CLONE_REEL]: { label: 'Reel con clon', color: '#0EA5E9' },
}

/** El reel con clon es un pedido de clienta más (mismo tipo); se distingue por su metadata */
export const kindOf = (task: ITask) => isCloneReel(task) ? CLONE_REEL : task.task_type?.slug
export const kindInfo = (task: ITask) => KIND[kindOf(task)] ?? { label: task.task_type?.name ?? 'Tarea', color: '#94A3B8' }

const DAY = 86_400_000
export const startOfDay = (value: Date | string) => { const d = new Date(value); d.setHours(0, 0, 0, 0); return d.getTime() }
export const daysLeft = (task: ITask) => Math.round((startOfDay(task.expired_at) - startOfDay(new Date())) / DAY)
const daysSince = (value: Date | string) => Math.max(0, Math.round((startOfDay(new Date()) - startOfDay(value)) / DAY))

const shortDate = (value: Date | string) => new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
const ago = (days: number) => days === 0 ? 'hoy' : days === 1 ? 'ayer' : days < 45 ? `hace ${days} días` : `hace ${Math.round(days / 30)} meses`

export type DueTone = '' | 'late' | 'today' | 'review' | 'stale' | 'done'

/**
 * La fecha en palabras, según la etapa. Lo del equipo cuenta contra su entrega («atrasada 3 días»,
 * «vence hoy»); lo que espera tu visto bueno cuenta desde que se entregó, no como atraso del equipo;
 * y lo terminado dice cuándo se entregó.
 */
export const dueInfo = (task: ITask): { text: string, tone: DueTone } => {
    const stage = stageOf(task)
    if (stage === 'done') return { text: `entregado ${shortDate(task.completed_at ?? task.expired_at)}`, tone: 'done' }
    if (stage === 'review') {
        const waiting = daysSince(task.last_activity_at ?? task.expired_at)
        /* Corto a propósito: en la tarjeta lo que importa es desde cuándo espera, y un texto largo se cortaba justo ahí */
        return { text: `esperando · ${ago(waiting)}`, tone: waiting > 30 ? 'stale' : 'review' }
    }
    const left = daysLeft(task)
    const hour = new Date(task.expired_at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
    if (left < 0) return { text: left === -1 ? 'venció ayer' : `atrasada ${-left} días`, tone: 'late' }
    if (left === 0) return { text: `vence hoy · ${hour}`, tone: 'today' }
    if (left === 1) return { text: `mañana · ${hour}`, tone: '' }
    return { text: left < 7 ? `en ${left} días · ${shortDate(task.expired_at)}` : shortDate(task.expired_at), tone: '' }
}

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('')

type Person = { name: string, photo?: string | null, profile_picture?: { url?: string | null } | null }

/**
 * La foto de una persona. `profile_picture.url` ya es la dirección completa; `photo` es la LLAVE del archivo
 * («public/users/…»), y pintarla tal cual pedía la imagen al propio panel: por eso salían rotas en la carga.
 */
export const photoOf = (person: Person | null | undefined): string | null => {
    if (!person) return null
    if (person.profile_picture?.url) return person.profile_picture.url
    const key = person.photo?.trim()
    if (!key) return null
    if (/^https?:\/\//.test(key)) return key
    const cdn = import.meta.env.VITE_CDN_URL as string | undefined
    return cdn ? `${cdn.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}` : null
}
