import { Country } from "@/constants/countries";

/** «entró hoy», «hace 3 días»…; lo que importa es cuánto lleva sin entrar, no la hora exacta */
export const lastSeen = (value: Date | string | null) => {
    if (!value) return 'Nunca ha entrado'
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
    if (days <= 0) return 'Entró hoy'
    if (days === 1) return 'Entró ayer'
    if (days < 60) return `Entró hace ${days} días`
    return `Entró hace ${Math.round(days / 30)} meses`
}

/** El país de la cuenta como lo maneja el panel; lo que no sea Colombia se ve como México */
export const countryOf = (code?: string | null): Country => ['COL', 'CO'].includes((code || '').toUpperCase()) ? 'COL' : 'MEX'

export const FLAGS: Record<Country, string> = { MEX: '🇲🇽', COL: '🇨🇴' }

/** Liga de WhatsApp con su lada: los teléfonos se guardan a 10 dígitos */
export const whatsappLink = (phone: string | null | undefined, country: Country) => {
    const digits = (phone || '').replace(/\D/g, '')
    if (digits.length < 10) return null
    const full = digits.length === 10 ? `${country === 'COL' ? '57' : '52'}${digits}` : digits
    return `https://wa.me/${full}`
}

/** «27 feb 2026» sin hora: para fechas de calendario (inicio en Mary Kay, último pedido) */
export const dayLabel = (value: Date | string | null | undefined) => {
    if (!value) return null
    /* «2026-02-27» llega sin hora: se lee como día local, no como medianoche UTC (que en México es el día anterior) */
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** De dónde salió la cuenta, en palabras */
export const signupOrigin = (value?: string | null) => {
    if (!value) return null
    if (value === 'admin') return 'La dio de alta el equipo'
    if (value === 'signup' || value === 'web' || value === 'app') return 'Se registró ella'
    return `Origen: ${value}`
}
