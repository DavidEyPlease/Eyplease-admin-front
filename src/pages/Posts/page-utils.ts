import { RunStatus } from '@/interfaces/posts'

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

export const NEWSLETTER_LABEL: Record<string, string> = {
    unit_newsletter: 'Unidad',
    national_newsletter: 'Nacional',
}

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
