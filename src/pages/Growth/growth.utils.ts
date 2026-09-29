/** Crecimiento: los nombres de cada origen y grupo, y el mensaje que se le sugiere a cada prospecto. */

import { GrowthGroup, GrowthProspect } from '@/interfaces/growth'
import { firstName } from '@/pages/Sales/sales.utils'

export const SOURCE_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    invitacion: 'La invitó una consultora',
    whatsapp: 'WhatsApp',
    directo: 'Directo, sin etiqueta',
    sin: 'Sin dato (antes del 30 sep)',
}
export const sourceLabel = (source: string) =>
    SOURCE_LABELS[source] ?? source.charAt(0).toUpperCase() + source.slice(1).replace(/[-_]/g, ' ')

/** El color de la etiqueta de cada origen (clases de `pulse-tag`) */
export const sourceTone = (source: string) =>
    ({ instagram: 'plain', facebook: 'plain', invitacion: 'live', whatsapp: 'ok' } as Record<string, string>)[source] ?? ''

export const GROUPS: Array<{ key: GrowthGroup, title: string, hint: string, color: string }> = [
    { key: 'lista', title: 'Listas para pagar', hint: 'Tocaron el tope, pidieron un plan o preguntaron precio', color: '#E5077D' },
    { key: 'nueva', title: 'Nuevas', hint: 'Se registraron en las últimas 48 horas: bienvenida el mismo día', color: '#2CD4D9' },
    { key: 'fria', title: 'Se enfriaron', hint: 'Se registraron y no volvieron: un solo rescate', color: '#5B8DEF' },
    { key: 'calentando', title: 'Calentando', hint: 'Usan la app, sin señal de compra: acompañar', color: '#F59E0B' },
]

/** Por qué escribirle hoy, en una línea. */
export const whyNow = (row: GrowthProspect): string => {
    const text = row.signals.join(' ').toLowerCase()
    if (row.group === 'lista') {
        if (text.includes('tope')) return 'Llegó al tope del plan gratis y lo usa: es el momento más caliente que hay.'
        if (text.includes('pidió')) return 'Pidió el plan ella misma. Sólo falta que alguien le responda.'
        if (row.kind === 'whatsapp') return 'El bot ya la calificó como interesada: sigue una persona.'
        return 'Anda viendo los planes: una respuesta directa hoy la decide.'
    }
    if (row.group === 'nueva') return 'Una bienvenida personal el mismo día es la que más se agradece.'
    if (row.group === 'fria') return 'Un solo intento de rescate, con un paso concreto. Si no contesta, se deja en paz.'
    return 'Todavía no toca vender: un empujón útil para que siga usando la app.'
}

/** El mensaje de WhatsApp con la voz de David. Nunca «¿qué te pareció?»: siempre un paso concreto. */
export const suggestedMessage = (row: GrowthProspect): string => {
    const name = firstName(row.name)
    const hello = `Hola${name ? ` ${name}` : ''}, soy David de Eyplease+.`
    const plan = row.suggested_plan?.name ? `el Plan ${row.suggested_plan.name.replace(/^Plan\s+/i, '')}` : 'un plan de paga'
    const text = row.signals.join(' ').toLowerCase()
    const isDirector = row.profile === 'Directora'

    if (row.group === 'lista') {
        if (text.includes('tope')) return `${hello}\nVi que ya llenaste tus clientas del plan gratis: te está funcionando.\nEl plan gratis llega hasta ahí; con ${plan} sigues sin tope. ¿Te lo activo hoy?`
        if (text.includes('pidió')) return `${hello}\nVi que te interesa ${plan}. ¿Te lo activo hoy o prefieres que lo veamos en 5 minutos por llamada?`
        if (row.kind === 'whatsapp') return `${hello}\nGracias por escribirnos. ¿Te llamo 5 minutos y te enseño cómo quedaría con tu unidad?`
        return `${hello}\nVi que estuviste viendo los planes. Si me dices qué quieres resolver, te digo cuál te conviene, sin rodeos.`
    }
    if (row.group === 'nueva') {
        const step = isDirector
            ? 'sube tu reporte del mes para que la app arme lo de tu unidad'
            : 'registra a tus 3 clientas más frecuentes'
        return `${hello} Bienvenida.\nCualquier duda de estos primeros días, me escribes aquí directo. Primer paso que te recomiendo: ${step}.`
    }
    if (row.group === 'fria') {
        return `${hello}\nTe registraste hace unos días y no te vi volver. ¿Te ayudo con el primer paso? Si quieres, lo hacemos por videollamada en 5 minutos.`
    }
    if (isDirector && text.includes('sin reporte')) {
        return `${hello}\nVi que ya andas usando la app. Para que te dé los números de tu unidad sólo falta un paso: subir tu reporte del mes. ¿Te mando cómo, en un video de un minuto?`
    }
    return `${hello}\nVi que ya andas usando la app. Cualquier cosa que no te quede clara, aquí estoy.`
}

/** Días desde una fecha ISO (0 = hoy). */
export const daysSince = (iso: string | null | undefined) => {
    const ts = Date.parse(iso ?? '')
    return Number.isNaN(ts) ? null : Math.max(0, Math.floor((Date.now() - ts) / 86_400_000))
}

export const registeredText = (iso: string) => {
    const days = daysSince(iso) ?? 0
    if (days === 0) return 'se registró hoy'
    if (days === 1) return 'se registró ayer'
    return `hace ${days} días`
}

/** «Ya le escribí» deja de contar a los 2 días sin respuesta: la fila la vuelve a subir. */
export const CONTACT_STALE_DAYS = 2
export const recentlyWritten = (row: GrowthProspect) =>
    row.contact?.action === 'written' && (daysSince(row.contact.at) ?? 99) < CONTACT_STALE_DAYS
