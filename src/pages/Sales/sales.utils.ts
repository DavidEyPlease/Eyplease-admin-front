/** Ventas: lo que hace falta para hablarle a quien está esperando — la liga, el mensaje y desde cuándo. */

import { DirectorProspect, PlanGift, PlanInterest, SalesDeal } from '@/interfaces/sales'
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
    crecimiento: 'la pasó el equipo desde Crecimiento',
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

/* ── Los mensajes listos para copiar (y para la liga de WhatsApp) ─────────────────────────────── */
/* En la voz de David con sus clientas: de usted, cálido, sin emojis y con una pregunta que se contesta con un sí
   (David, 21-oct: «Buenos días, Directora, ¿cómo está? Veo que quiere regalar el plan…, ¿me puede confirmar para que
   hagamos su activación?»). El saludo va con la hora del día en que se arma la fila. */

/** «Buenos días» hasta mediodía, «Buenas tardes» hasta las 7 de la noche y «Buenas noches» después. */
export const greeting = (date = new Date()) => {
    const hour = date.getHours()
    return hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
}

/** A una Directora: «Buenos días, Directora Gloria, ¿cómo está?» */
export const helloDirector = (name: string | null | undefined) => {
    const first = firstName(name)
    return `${greeting()}, Directora${first ? ` ${first}` : ''}, ¿cómo está?`
}

/** A una consultora, por su nombre: «Buenos días, Ana, ¿cómo está?» */
const helloConsultant = (name: string | null | undefined) => {
    const first = firstName(name)
    return `${greeting()}${first ? `, ${first}` : ''}, ¿cómo está?`
}

export const giftMessage = (gift: PlanGift) => {
    const hello = helloDirector(gift.user?.network_person?.name ?? gift.user?.name)
    const plan = gift.plan?.name ?? 'plan'
    return gift.kind === 'gift'
        ? `${hello} Veo que quiere regalarle el ${plan} a ${firstName(gift.person?.name) || 'una consultora de su unidad'}. ¿Me confirma para que hagamos su activación?`
        : `${hello} Veo que quiere el ${plan} para ${gift.quantity} consultoras de su unidad. ¿Me confirma para que hagamos su activación?`
}

export const interestMessage = (item: PlanInterest) =>
    `${helloDirector(item.user?.network_person?.name ?? item.user?.name)} Veo que le interesa el ${item.plan?.name ?? 'siguiente plan'}. ¿Me confirma para que hagamos su cambio de plan?`

export const prospectDirectorMessage = (item: DirectorProspect) =>
    `${helloDirector(item.director_name)} ${firstName(item.invited_by?.name) || 'Una consultora'}, de su unidad, la invitó a Eyplease+. ¿Le gustaría que le enseñe cómo funciona? Puede empezar con un mes gratis.`

export const prospectConsultantMessage = (item: DirectorProspect) =>
    `${helloConsultant(item.invited_by?.name)} Vi que invitó a su Directora ${firstName(item.director_name)} a Eyplease+. ¿Le ayudamos a que entre? Cuando ella cree su cuenta con ese correo, usted recibe ${item.reward_months} meses de regalo.`

/** Al trato no se le vende nada: sólo el saludo, para escribirle desde su propio WhatsApp. */
export const dealMessage = (deal: SalesDeal) =>
    helloDirector(deal.user.network_person?.name ?? deal.user.name)
