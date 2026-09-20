import { PulseLane } from '@/interfaces/pulse'

const pad = (n: number) => String(n).padStart(2, '0')

/** "HH:mm" de un instante, en la hora de quien mira (el equipo opera desde México). */
export const clock = (value: string | Date | null | undefined) => {
    if (!value) return ''
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const dayKey = (value: string | Date) => {
    const d = new Date(value)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isToday = (value: string | null | undefined) => !!value && dayKey(value) === dayKey(new Date())

export const money = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`

export const monthName = (period: string) => {
    const [y, m] = period.split('-').map(Number)
    if (!y || !m) return ''
    return new Date(y, m - 1, 1).toLocaleDateString('es-MX', { month: 'long' })
}

export const longToday = () => {
    const text = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * El calendario cuando la API todavía no lo entrega (`/pulse` sin desplegar): sólo lo que el Inicio
 * de siempre ya sabe — las secciones diarias con su hora. Es incompleto a propósito: no se inventan
 * carriles que el servidor no confirmó.
 */
export const lanesFromDaily = (daily: Array<{ key: string, name: string, scheduled_at: string }>): PulseLane[] =>
    daily.map(section => ({ time: section.scheduled_at, key: section.key, label: section.name, hint: 'Publicación diaria', kind: 'publishing' as const, sections: [section.key] }))
        .sort((a, b) => a.time.localeCompare(b.time))
