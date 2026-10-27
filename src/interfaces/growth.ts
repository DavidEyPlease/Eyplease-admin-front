/** Crecimiento: lo que manda la API en `admin/growth/*` (ver GrowthService en la API). */

export type GrowthGroup = 'lista' | 'nueva' | 'fria' | 'calentando'

export type GrowthPeriod = 'semana' | 'mes' | 'trimestre'

export interface GrowthContact {
    id: string
    /** written = «ya le escribí» · dropped = «dejarla» · to_sales = pasó a Ventas */
    action: 'written' | 'dropped' | 'to_sales'
    note: string | null
    at: string | null
    by: string | null
}

export interface GrowthProspect {
    /** `user:<id>` o `wa:<número>`: es lo que se manda como `target` a la bitácora */
    key: string
    kind: 'account' | 'whatsapp'
    id: string
    group: GrowthGroup
    name: string
    account: string | null
    profile: 'Directora' | 'Consultora' | null
    rank: string | null
    phone: string | null
    country_code: string | null
    email: string | null
    plan: { name: string, free: boolean, price: number } | null
    on_trial: boolean
    /** instagram, facebook, invitacion, whatsapp, directo (sin etiqueta) o sin (antes de que se guardara) */
    source: string
    registered_at: string
    last_activity_at: string | null
    uses_app: boolean
    signals: string[]
    suggested_plan: { id: string, name: string, price: number } | null
    contact: GrowthContact | null
    bot_stage?: string
}

export interface GrowthProspectsResponse {
    items: GrowthProspect[]
    summary: Record<GrowthGroup, number>
    bot: { allowed: boolean, available: boolean }
    days: number
    generated_at: string
}

export interface GrowthFunnelCounts {
    registered: number
    uses: number
    wants: number
    pays: number
    /** Se registraron y no volvieron después del primer día */
    lost: number
    monthly: number
}

export interface GrowthSourceRow {
    source: string
    registered: number
    uses: number
    pays: number
    monthly: number
}

export interface GrowthFunnelResponse {
    period: GrowthPeriod
    from: string
    to: string
    current: GrowthFunnelCounts & { by_source: GrowthSourceRow[] }
    previous: GrowthFunnelCounts
}

/** Pestaña «Web»: las visitas de eyplease.com.mx (personas distintas por día) */
export interface GrowthWebCounts {
    visits: number
    phone: number
    views: number
    /** Personas que tocaron un botón de WhatsApp */
    whatsapp: number
    /** Personas que dejaron sus datos en el chat de la página */
    chat: number
    /** Personas que tocaron «Registrarme» */
    registro: number
    /** Cuentas que se registraron solas en la ventana (el mismo número del Embudo) */
    signups: number
}

export interface GrowthWebResponse {
    period: GrowthPeriod
    from: string
    to: string
    current: GrowthWebCounts
    previous: GrowthWebCounts
    by_day: Array<{ day: string, visits: number, views: number }>
    by_source: Array<{ source: string, visits: number, phone: number, whatsapp: number }>
    by_page: Array<{ path: string, views: number, visits: number }>
    /** Desde cuándo la web avisa sola; antes, lo reconstruido de los registros del servidor */
    measured_since: string | null
    rebuilt_since: string | null
}

