import { DeliveryStatus } from '@/interfaces/deliveries'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** «2026-11-03» → «3-nov» */
export const shortDate = (date: string | null | undefined) => {
    if (!date) return '—'
    const [, month, day] = date.split('-').map(Number)
    return `${day}-${MONTHS[month - 1]}`
}

/** «2026-10» → «octubre» */
export const monthName = (period: string) => {
    const [year, month] = period.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'long' })
}

export const dayOf = (date: string) => Number(date.slice(8, 10))

/** La píldora de estado: reusa los colores de «Qué falta» */
export const statusPill = (status: DeliveryStatus) => {
    if (status.code === 'no_design') return 'art'
    if (status.tone === 'ok') return 'done'
    if (status.tone === 'bad') return 'bad'
    if (status.tone === 'warn') return 'day'
    if (status.code === 'running') return 'run'
    if (status.code === 'ready') return 'ready'
    return 'off'
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
