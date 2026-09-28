import { ChallengeType, TemplateState } from '@/interfaces/challenges'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-09-30" → "30 de septiembre" (es un día de calendario, no un instante: sin pasar por Date). */
export const dayLabel = (date: string) => {
    const [, month, day] = date.slice(0, 10).split('-').map(Number)
    return `${day} de ${MONTHS[month - 1] ?? ''}`
}

export const TYPE_LABEL: Record<ChallengeType, string> = {
    unit_points: 'Puntos',
    unit_hearts: 'Corazones',
    unit_reactivation: 'Reactivación',
}

/** Cómo se lee cada estado de la base, y qué tan urgente es (orden de la lista: lo que pide acción, arriba). */
export const STATE: Record<TemplateState, { label: string, hint: string, tone: string, order: number }> = {
    por_medir: { label: 'Por medir', hint: 'Llegó la base: falta marcar dónde van la cara y el nombre', tone: 'hot', order: 0 },
    esperando: { label: 'Esperando su base', hint: 'Sus ganadoras esperan: nadie la ha pedido a diseño', tone: 'warn', order: 1 },
    pedida: { label: 'Pedida a diseño', hint: 'La base está en Pedidos de diseño', tone: 'plain', order: 2 },
    sin_base: { label: 'Sin base', hint: 'Sus ganadoras salen como pedido de diseño, una por una', tone: 'plain', order: 3 },
    lista: { label: 'Lista', hint: 'Cada ganadora sale sola', tone: 'ok', order: 4 },
}

/** Hex ↔ [r, g, b] para los colores del nombre. */
export const toHex = ([r, g, b]: [number, number, number]) => `#${[r, g, b].map(n => Math.round(n).toString(16).padStart(2, '0')).join('')}`
export const fromHex = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '')
    return [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16) || 0) as [number, number, number]
}
