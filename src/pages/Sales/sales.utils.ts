/** Liga de WhatsApp con el mensaje listo. Los teléfonos se guardan a 10 dígitos: sin lada se asume México. */
export const waLink = (phone: string | null | undefined, text: string): string | null => {
    const digits = (phone ?? '').replace(/\D+/g, '')
    if (!digits) return null
    const full = digits.length === 10 ? `52${digits}` : digits
    return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
}

export const firstName = (name: string | null | undefined) => (name ?? '').trim().split(/\s+/)[0] || ''

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
