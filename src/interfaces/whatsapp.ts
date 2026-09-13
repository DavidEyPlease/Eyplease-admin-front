/**
 * Tipos del modulo de WhatsApp. Reflejan lo que devuelve
 * /admin/whatsapp/* en la API, que a su vez lee la base del bot.
 */

export type WaChannel = 'whatsapp' | 'facebook' | 'instagram'

export type WaRole = 'user' | 'assistant'

export type WaMediaKind = "image" | "video" | "audio" | "document"

/** Adjunto que mandó la clienta: el bot lo guarda y lo sirve la API. */
export interface WaMedia {
    kind: WaMediaKind
    /** Ruta del bot, "/admin/media/<archivo>". */
    url: string
    /** Nombre original, cuando WhatsApp lo manda (documentos). */
    filename?: string
}

export interface WaMessage {
    role: WaRole
    content: string
    at: string
    /** true cuando lo escribio una persona del equipo, no el bot. */
    manual?: boolean
    media?: WaMedia
}

/** Lo que el bot guarda tras identificar a la clienta contra la API. */
export interface WaIdentity {
    name?: string
    consultantCode?: string
    networkPersonId?: string
    role?: string
    photoUrl?: string | null
    active?: boolean
    isClient?: boolean
    found?: boolean
}

/** Fila del listado: sin el historial completo. */
export interface WaConversationSummary {
    wa_id: string
    channel: WaChannel
    stage: string
    human_took_over: boolean
    profile_name: string | null
    display_name: string | null
    last_message: string | null
    notas_count: number
    identity: WaIdentity | null
    /** Derivados que calcula la API para no repetir la lógica en el front. */
    name: string | null
    account: string | null
    network_person_id: string | null
    created_at: string
    updated_at: string
}

/** Detalle: incluye el hilo. */
export interface WaConversation extends WaConversationSummary {
    history: WaMessage[]
    notas: unknown[] | null
    qualification: Record<string, unknown> | null
}

/** Veredicto de cobranza en una palabra, para la ficha del chat. */
export type WaPaymentStatus = "al_corriente" | "retraso" | "por_validar"

export interface WaClientPaymentSummary {
    year: number
    status: WaPaymentStatus
    paid_periods: number
    overdue_periods: number
    /** Subió comprobante y espera validación: no es lo mismo que no pagar. */
    in_review_periods: number
    pending_periods: number
    last_payment: {
        period: string
        status: string
        amount: number
        paid_at: string | null
    } | null
}

/** Ficha del cliente: el cruce que antes no existia en el panel. */
export interface WaClientCard {
    id: string
    account: string
    name: string
    email: string
    active: boolean
    photo: string | null
    country_code: string | null
    rank: string | null
    plan: string | null
    payments: WaClientPaymentSummary
}

export interface WaClientCardResponse {
    identified: boolean
    client: WaClientCard | null
    /** Último mensaje DE LA CLIENTA: marca la ventana de 24 h de WhatsApp. */
    last_client_message_at: string | null
}

export type WaTicketStatus = 'abierto' | 'en_proceso' | 'resuelto'

export interface WaTicket {
    id: string
    wa_id: string
    client_name: string | null
    client_role: string | null
    channel: WaChannel
    problem: string
    severity: 'baja' | 'media' | 'alta'
    status: WaTicketStatus
    created_at: string
    updated_at: string
}

export interface WaStats {
    conversations: number
    manual: number
    bot: number
    open_tickets: number
    delivery_failures: number
}

/** Tal como las devuelve el bot (que las lee de Meta), no de la base. */
export interface WaTemplate {
    name: string
    status: string
    category: string
    language: string
    body: string
    /** Cuántos {{n}} trae el cuerpo: sin params la plantilla sale incompleta. */
    varCount: number
}

export type WaInboxMode = 'all' | 'bot' | 'manual'
