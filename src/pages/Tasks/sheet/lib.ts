import { ITask, ITaskActivity, ITaskFile, TaskStatusTypes, TaskTypes } from '@/interfaces/tasks'
import { titleCase } from '@/pages/Clients/List/names'
import { CLONE_REEL, STAGES, StageKey, kindOf, startOfDay, stageOf } from '../lib'

/* Lo que sólo usa la ficha de un pedido: quién lo pidió, qué ofrece cada etapa, el siguiente paso y la
   conversación contada en palabras. Las etapas y los tipos son los mismos de la mesa (../lib). */

/** Un pedido de una clienta (o su reel con clon): lo pidió ella y lo que sube el equipo es lo que le llega */
export const isClientRequest = (task: ITask) => ([TaskTypes.SERVICE, CLONE_REEL] as string[]).includes(kindOf(task))

/** La clienta que lo pidió, con su nombre como se lee (el padrón los trae en mayúsculas) */
export const clientOf = (task: ITask) => isClientRequest(task) && task.created_by?.name ? { ...task.created_by, name: titleCase(task.created_by.name) } : null

export const firstName = (name?: string | null) => name ? titleCase(name).split(' ')[0] : ''

/** Completado es el final: la ficha ya no se edita (así era antes y así lo espera el equipo) */
export const isLocked = (task: ITask) => task.task_status?.slug === TaskStatusTypes.COMPLETED

/**
 * Los estados que ofrece cada etapa. Subir recursos de AE, lista para publicar y publicada son pasos de la
 * Biblioteca; en un pedido de clienta «En proceso» es sólo eso y «Listo» es «Completada».
 */
export const stageStatuses = (task: ITask, stage: StageKey): TaskStatusTypes[] => {
    const statuses = STAGES.find(item => item.key === stage)?.statuses ?? []
    if (!isClientRequest(task)) return statuses
    if (stage === 'doing') return [TaskStatusTypes.IN_PROGRESS]
    if (stage === 'done') return [TaskStatusTypes.COMPLETED]
    return statuses
}

/**
 * Las entregas y lo que mandó la clienta. Entrega es lo que sube alguien que NO es quien lo pidió: la misma
 * regla con la que la API decide qué le llega a ella (DesignDeliveryService::deliveredImages). En lo de
 * Biblioteca y Entrenamiento todo es del equipo: una sola lista, en el orden en que se publica.
 */
export const splitFiles = (task: ITask, files: ITaskFile[]) => {
    const creator = isClientRequest(task) ? task.created_by?.id : null
    const fromClient = creator ? files.filter(file => file.uploaded_by?.id === creator) : []
    return { designs: files.filter(file => !fromClient.includes(file)), fromClient }
}

export type NextStep = { label: string, status: TaskStatusTypes, needsDesigns: boolean }

/** El paso que sigue, en un botón. Sólo donde el camino es claro; lo demás se mueve con las etapas. */
export const nextStepOf = (task: ITask): NextStep | null => {
    if (isLocked(task)) return null
    const stage = stageOf(task)
    const client = clientOf(task)
    if (stage === 'doing' || stage === 'fix') {
        return client
            ? { label: `Entregar a ${firstName(client.name)}`, status: TaskStatusTypes.READY_FOR_REVIEW, needsDesigns: true }
            : { label: 'Pasar a revisión', status: TaskStatusTypes.READY_FOR_REVIEW, needsDesigns: false }
    }
    if (stage === 'review' && client) return { label: 'Marcar como listo', status: TaskStatusTypes.COMPLETED, needsDesigns: false }
    return null
}

/** Qué pasa en esta etapa y qué pasará al mover el pedido. Sólo lo que la plataforma hace de verdad. */
export const stageHint = (task: ITask): string | null => {
    if (isLocked(task)) return 'Completado: la ficha ya no se edita.'
    const stage = stageOf(task)
    const client = clientOf(task)
    const who = client ? firstName(client.name) : ''
    if (stage === 'todo') return 'Nadie lo ha tomado: asígnalo en «Lo hace».'
    if (client && (stage === 'doing' || stage === 'fix')) return `Al pasarlo a «Por revisar», a ${who} le llega el aviso de que ya están sus diseños.`
    if (client && stage === 'review') return `Ya se le entregó a ${who}. Si pide un cambio, pasa solo a «Corrección».`
    if (stage === 'review') return 'Espera tu visto bueno.'
    if (task.task_status?.slug === TaskStatusTypes.PUBLISHED) return 'Publicado en la biblioteca de las clientas.'
    if (task.task_status?.slug === TaskStatusTypes.READY_FOR_PUBLISH) return 'Listo para publicar en la biblioteca.'
    return null
}

/* ── Fechas en palabras ─────────────────────────────────────────────────────────────────────────── */

const DAY = 86_400_000
const thisYear = (date: Date) => date.getFullYear() === new Date().getFullYear()

/** «mié 1 oct» (con el año si no es este) */
export const dayOf = (value: Date | string) => {
    const date = new Date(value)
    return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', ...(thisYear(date) ? {} : { year: 'numeric' }) }).replace(/,/g, '').replace(/\./g, '').replace(/ de /g, ' ')
}

export const hourOf = (value: Date | string) => new Date(value).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })

/** Cuándo pasó algo de la conversación: «hoy · 10:32 a. m.», «ayer · …», «24 sept» */
export const whenOf = (value: Date | string) => {
    const date = new Date(value)
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY)
    if (days === 0) return `hoy · ${hourOf(date)}`
    if (days === 1) return `ayer · ${hourOf(date)}`
    const day = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', ...(thisYear(date) ? {} : { year: 'numeric' }) }).replace(/\./g, '')
    return days < 7 ? `${day} · ${hourOf(date)}` : day
}

/* ── La conversación ────────────────────────────────────────────────────────────────────────────── */

export type SystemIcon = 'created' | 'stage' | 'person' | 'date' | 'upload' | 'delete' | 'other'

export type TimelineEntry =
    | { kind: 'message', activity: ITaskActivity, correction: boolean }
    | { kind: 'system', activity: ITaskActivity, text: string, icon: SystemIcon, names: string[] }

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\u00A0/g, ' ').replace(/\s+/g, ' ').trim()

/** Lo que escribe la API en cada movimiento, dicho como lo diría una persona */
const SYSTEM: Array<[RegExp, SystemIcon, (match: RegExpMatchArray) => string]> = [
    [/^ha creado esta tarea$/i, 'created', () => 'creó el pedido'],
    [/^ha cambiado el estado de la tarea a (.+)$/i, 'stage', match => `lo movió a «${match[1]}»`],
    [/^ha cambiado el responsable de la tarea a (.+)$/i, 'person', match => `se lo asignó a ${titleCase(match[1])}`],
    [/^ha eliminado el responsable de la tarea$/i, 'person', () => 'lo dejó sin asignar'],
    [/^establecio que la fecha de vencimiento de la tarea fuera: (.+)$/i, 'date', match => `cambió la entrega al ${match[1]}`],
    [/^ha cambiado el tipo de tarea a (.+)$/i, 'other', match => `cambió el tipo a ${match[1]}`],
    [/^ha actualizado la tarea$/i, 'other', () => 'actualizó el pedido'],
    [/^ha agregado el adjunto (.+)$/i, 'upload', match => match[1]],
    [/^ha eliminado el archivo adjunto (.+)$/i, 'delete', match => match[1]],
]

const describe = (activity: ITaskActivity): { text: string, icon: SystemIcon } => {
    const text = plain(activity.activity_description ?? '')
    for (const [pattern, icon, say] of SYSTEM) {
        const match = text.match(pattern)
        if (match) return { text: say(match), icon }
    }
    return { text, icon: 'other' }
}

const GROUP_WINDOW = 15 * 60_000

/**
 * La conversación en orden (lo más nuevo arriba, como la manda la API). Los comentarios y las correcciones
 * van en globo; lo demás es una línea. Varios archivos subidos seguidos por la misma persona son UNA línea
 * («subió 4 archivos»), no cuatro.
 */
export const timelineOf = (activities: ITaskActivity[]): TimelineEntry[] => {
    const entries: TimelineEntry[] = []
    for (const activity of activities) {
        if (activity.activity_type === 'comment' || activity.activity_type === 'request_correction') {
            entries.push({ kind: 'message', activity, correction: activity.activity_type === 'request_correction' })
            continue
        }
        const { text, icon } = describe(activity)
        const last = entries[entries.length - 1]
        const groupable = icon === 'upload' || icon === 'delete'
        if (groupable && last?.kind === 'system' && last.icon === icon && last.activity.user?.id === activity.user?.id
            && Math.abs(new Date(last.activity.created_at).getTime() - new Date(activity.created_at).getTime()) < GROUP_WINDOW) {
            last.names.push(text)
            continue
        }
        entries.push({ kind: 'system', activity, text, icon, names: groupable ? [text] : [] })
    }
    return entries
}

/** «subió "invitacion.png"» o «subió 4 archivos» */
export const systemText = (entry: Extract<TimelineEntry, { kind: 'system' }>) => {
    if (entry.icon !== 'upload' && entry.icon !== 'delete') return entry.text
    const verb = entry.icon === 'upload' ? 'subió' : 'borró'
    return entry.names.length > 1 ? `${verb} ${entry.names.length} archivos` : `${verb} «${entry.names[0]}»`
}
