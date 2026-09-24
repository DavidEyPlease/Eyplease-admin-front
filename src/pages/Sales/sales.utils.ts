/** Ventas: lo que hace falta para hablarle a quien está esperando — la liga, el mensaje y desde cuándo. */

import { DirectorProspect, PlanGift, PlanInterest } from '@/interfaces/sales'
import { titleCase } from '@/pages/Clients/List/names'

/** Liga de WhatsApp con el mensaje listo. Los teléfonos se guardan a 10 dígitos: sin lada se asume México. */
export const waLink = (phone: string | null | undefined, text: string): string | null => {
    const digits = (phone ?? '').replace(/\D+/g, '')
    if (!digits) return null
    const full = digits.length === 10 ? `52${digits}` : digits
    return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
}

/** El padrón guarda los nombres en mayúsculas: en un WhatsApp «Hola BLANCA» se lee como un regaño. */
export const firstName = (name: string | null | undefined) => {
    const first = (name ?? '').trim().split(/\s+/)[0]
    return first ? titleCase(first) : ''
}

/** Las señales tibias del interés, en palabras. */
const SIGNAL_LABELS: Record<string, string> = {
    lock: 'tocó un candado',
    sheet: 'abrió el aviso',
    plan_card: 'miró la tarjeta del plan',
    plans_page: 'entró a Planes',
    request: 'pidió «Me interesa»',
}
export const signalsText = (signals: Record<string, number> | null | undefined) =>
    Object.entries(signals ?? {})
        .filter(([, count]) => count > 0)
        .map(([key, count]) => `${SIGNAL_LABELS[key] ?? key}${count > 1 ? ` ×${count}` : ''}`)
        .join(' · ')

/** "unity:early" → "Mi unidad · early"; "stay_informed" → "stay informed". Es de qué hablarle. */
export const featureText = (feature: string | null | undefined) => (feature ?? '').replace(/[:_]/g, ' · ').trim()

/** Días completos que lleva esperando. Es lo que ordena la fila: primero quien lleva más. */
export const waitDays = (iso: string | null | undefined) => {
    const ts = Date.parse(iso ?? '')
    return Number.isNaN(ts) ? 0 : Math.max(0, Math.floor((Date.now() - ts) / 86_400_000))
}

export const waitText = (iso: string | null | undefined) => {
    const days = waitDays(iso)
    if (days === 0) return 'llegó hoy'
    if (days === 1) return 'lleva 1 día esperando'
    if (days < 31) return `lleva ${days} días esperando`
    return `lleva ${Math.round(days / 30)} ${Math.round(days / 30) === 1 ? 'mes' : 'meses'} esperando`
}

/** Para lo tibio: nadie está esperando respuesta, así que sólo se dice cuándo fue. */
export const agoText = (iso: string | null | undefined) => {
    const days = waitDays(iso)
    if (days === 0) return 'hoy'
    if (days === 1) return 'ayer'
    if (days < 31) return `hace ${days} días`
    return `hace ${Math.round(days / 30)} ${Math.round(days / 30) === 1 ? 'mes' : 'meses'}`
}

/** El color del tiempo: dos días es normal, una semana ya es una venta enfriándose. */
export const waitTone = (iso: string | null | undefined): 'plain' | 'warn' | 'bad' => {
    const days = waitDays(iso)
    return days >= 7 ? 'bad' : days >= 2 ? 'warn' : 'plain'
}

/* ── Los mensajes de WhatsApp ───────────────────────────────────────────────────────────────── */

export const giftMessage = (gift: PlanGift) => {
    const directora = firstName(gift.user?.network_person?.name ?? gift.user?.name)
    return gift.kind === 'gift'
        ? `Hola ${directora} 💜 Vimos que quieres regalarle Eyplease+ a ${firstName(gift.person?.name)}. Te ayudo a activarlo: `
        : `Hola ${directora} 💜 Vimos que quieres Eyplease+ para ${gift.quantity} consultoras de tu unidad. Te paso cómo lo activamos: `
}

export const interestMessage = (item: PlanInterest) => {
    const name = firstName(item.user?.network_person?.name ?? item.user?.name)
    return `Hola ${name} 💜 Vimos que te interesa el ${item.plan?.name ?? 'siguiente plan'} en Eyplease+. Te cuento qué incluye y cómo lo activamos: `
}

export const prospectDirectorMessage = (item: DirectorProspect) =>
    `Hola ${firstName(item.director_name)} 💜 ${firstName(item.invited_by?.name)}, de tu unidad, ya usa Eyplease+ y te invitó. Te cuento cómo funciona y cómo crear tu cuenta gratis: `

export const prospectConsultantMessage = (item: DirectorProspect) =>
    `Hola ${firstName(item.invited_by?.name)} 💜 Vimos que invitaste a tu Directora ${firstName(item.director_name)} a Eyplease+. ¿Te ayudamos a que entre? Recuerda que al hacerlo te regalamos ${item.reward_months} meses.`
