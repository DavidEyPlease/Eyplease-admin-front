/** Redes: nombres, colores y fechas del calendario. */

import { SocialChannel, SocialFormat, SocialPost, SocialStatus } from '@/interfaces/social'

export const STATUS: Record<SocialStatus, { label: string, tone: string, dot: string }> = {
    idea: { label: 'Idea', tone: '', dot: '#8A87A6' },
    production: { label: 'En producción', tone: 'warn', dot: '#F59E0B' },
    review: { label: 'Por aprobar', tone: 'live', dot: '#E5077D' },
    scheduled: { label: 'Programada', tone: 'plain', dot: '#6C47FF' },
    publishing: { label: 'Publicando…', tone: 'plain', dot: '#6C47FF' },
    published: { label: 'Publicada', tone: 'ok', dot: '#10B981' },
    failed: { label: 'No salió', tone: 'bad', dot: '#E11D48' },
}

/** Los pasos que se pintan en la ficha (publicando y fallida caen en su lugar). */
export const FLOW: SocialStatus[] = ['idea', 'production', 'review', 'scheduled', 'published']
export const flowStep = (status: SocialStatus) =>
    status === 'publishing' ? 3 : status === 'failed' ? 2 : FLOW.indexOf(status)

export const FORMATS: Array<{ key: SocialFormat, label: string, hint: string }> = [
    { key: 'post', label: 'Post', hint: 'Una imagen (o un video) en el feed' },
    { key: 'carousel', label: 'Carrusel', hint: 'De 2 a 10 láminas, en orden' },
    { key: 'story', label: 'Historia', hint: 'Dura 24 horas; cada imagen es una historia' },
    { key: 'reel', label: 'Reel', hint: 'Un video vertical' },
]
export const formatLabel = (format: SocialFormat) => FORMATS.find(item => item.key === format)?.label ?? format

export const CHANNELS: Array<{ key: SocialChannel, label: string }> = [
    { key: 'ig', label: 'Instagram' },
    { key: 'fb', label: 'Facebook' },
]
export const channelsText = (channels: SocialChannel[]) =>
    CHANNELS.filter(item => channels.includes(item.key)).map(item => item.label).join(' + ') || 'Sin red'

const pad = (n: number) => String(n).padStart(2, '0')

/** Lunes de la semana de `date`, a medianoche. */
export const weekStart = (date = new Date()) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d
}
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const ymd = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
export const sameDay = (a: Date, b: Date) => ymd(a) === ymd(b)

/** ISO de la API ↔ el valor de un <input type="datetime-local"> (hora local). */
export const toLocalInput = (iso: string | null | undefined) => {
    if (!iso) return ''
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? '' : `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const fromLocalInput = (value: string) => value ? new Date(value).toISOString() : null

export const timeText = (iso: string | null | undefined) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const dayText = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin fecha'

export const reachOf = (post: Pick<SocialPost, 'metrics'>) =>
    Number(post.metrics?.ig?.reach ?? 0) + Number(post.metrics?.fb?.reach ?? 0)

/** Lo que falta para poder aprobarla, en palabras; vacío = lista. */
export const missingToApprove = (post: SocialPost): string[] => [
    !post.media.length && 'la imagen o el video',
    !post.channels.length && 'en qué red sale',
    !post.scheduled_at && 'fecha y hora',
    post.format !== 'story' && !(post.caption ?? '').trim() && 'el texto',
    post.format === 'reel' && !post.media.some(item => item.type === 'video') && 'un video (es reel)',
].filter((item): item is string => !!item)
