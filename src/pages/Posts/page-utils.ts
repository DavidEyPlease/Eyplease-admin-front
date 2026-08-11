import { ISectionCoverage, RunStatus } from '@/interfaces/posts'

/** Estados en los que una ejecución sigue viva → habilita el polling. */
export const ACTIVE_RUN_STATUSES: RunStatus[] = ['queued', 'running']

export const RUNS_POLL_INTERVAL_MS = 5000

export const RUN_STATUS_UI: Record<RunStatus, { label: string, badge: string, bar: 'brand' | 'ok' | 'warn' | 'bad' }> = {
    queued: { label: 'En cola', badge: 'border-border bg-muted/40 text-muted-foreground', bar: 'brand' },
    running: { label: 'En curso', badge: 'border-brand-violet/25 bg-brand-violet-soft text-brand-violet', bar: 'brand' },
    completed: { label: 'Completado', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700', bar: 'ok' },
    partial: { label: 'Con fallos', badge: 'border-amber-200 bg-amber-50 text-amber-700', bar: 'warn' },
    failed: { label: 'Fallido', badge: 'border-rose-200 bg-rose-50 text-rose-700', bar: 'bad' },
}

export const CLIENTS_PER_PAGE = 20

/**
 * En la lista de clientes solo se pintan las secciones con problema; las completas
 * se resumen en el contador y las que el plan no incluye no aparecen (serían ruido).
 */
export const PROBLEM_CELL_UI = {
    empty: { label: 'Sin publicación', chip: 'border-rose-200 bg-rose-50 text-rose-700', legend: 'bg-rose-500' },
    partial: { label: 'Archivos incompletos', chip: 'border-amber-200 bg-amber-50 text-amber-700', legend: 'bg-amber-500' },
} as const

export type ProblemCellState = keyof typeof PROBLEM_CELL_UI

export const NEWSLETTER_LABEL: Record<string, string> = {
    unit_newsletter: 'Unidad',
    national_newsletter: 'Nacional',
}

/** Estado de salud de una sección, derivado solo de datos reales (posts + files). */
export const getSectionHealth = (section: ISectionCoverage) => {
    if (section.posts === 0) return { tone: 'bad' as const, label: 'Sin publicar', badge: 'border-border bg-muted/40 text-muted-foreground' }

    const missingVideo = section.artifacts.includes('video') ? section.posts - section.with_video : 0
    if (missingVideo > 0) return { tone: 'warn' as const, label: `${missingVideo} sin video`, badge: 'border-amber-200 bg-amber-50 text-amber-700' }

    return { tone: 'ok' as const, label: 'Completa', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
}

/** Publicaciones que le faltan video (el mejor proxy de fallo parcial que permite el modelo). */
export const getMissingVideo = (section: ISectionCoverage) =>
    section.artifacts.includes('video') ? section.posts - section.with_video : 0

/**
 * Publicar solo genera lo que falta: `pending` viene del snapshot y ya es el
 * resultado del fetchData() de cada job, que excluye a quien ya tiene el archivo.
 * Si es 0, el botón no generaría nada. Sin snapshot (`null`) no se puede afirmar,
 * así que se deja habilitado.
 *
 * @returns Motivo por el que no hay nada que publicar, o null si sí lo hay.
 */
export const getPublishDisabledReason = (section: ISectionCoverage) => {
    if (section.pending === null || section.pending > 0) return null

    const hasIncompleteFiles = getMissingVideo(section) > 0 || section.with_image < section.posts

    return hasIncompleteFiles
        ? 'No falta nada por crear. Los archivos incompletos son de personas que ya no aparecen en el reporte, así que publicar no los generaría.'
        : 'Todo listo: no falta ningún archivo por crear en este periodo.'
}

/** Las secciones diarias renderizan el día siguiente, así que el conteo va un día por delante. */
export const getCadenceHint = (section: ISectionCoverage) =>
    section.cadence === 'daily'
        ? `Se prepara un día antes: el lote de las ${section.scheduled_at} crea las publicaciones de mañana.`
        : 'Se publica a inicios de mes con los datos del mes anterior.'

export const formatPeriodLabel = (period: string) => {
    const [year, month] = period.split('-').map(Number)
    const label = new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export const shiftPeriod = (period: string, delta: number) => {
    const [year, month] = period.split('-').map(Number)
    const date = new Date(year, month - 1 + delta, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * El periodo es el mes de publicación, siempre el actual por defecto. El desfase
 * lo resuelve el backend: las secciones mensuales se publican a principios de mes
 * con los datos del mes anterior, mientras que cumpleaños, aniversarios (unidad y
 * nacional) y tempraneras trabajan sobre el mes en curso.
 */
export const defaultPeriod = () => currentPeriod()

export const currentPeriod = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const periodToMonthNumber = (period: string) => Number(period.split('-')[1])

/** "hace 12 min" — sobre MAX(posts.updated_at), no created_at (se sobrescribe manualmente). */
export const formatRelativeTime = (iso: string | null) => {
    if (!iso) return 'sin publicaciones este mes'

    const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (diffMinutes < 1) return 'hace un momento'
    if (diffMinutes < 60) return `hace ${diffMinutes} min`

    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `hace ${diffHours} h`

    const diffDays = Math.round(diffHours / 24)
    return diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`
}

export const formatNumber = (value: number) => value.toLocaleString('es-MX')
