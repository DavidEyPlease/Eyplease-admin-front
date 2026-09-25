/** Centro de avisos: /admin/notifications/center. */

export type NotificationChannel =
    | "whatsapp"
    | "service_requests"
    | "corrections"
    | "delivery_failures"
    /** Cobros con tarjeta domiciliada que Stripe no pudo hacer (con el porqué). */
    | "card_failures"

export interface NotificationItem {
    id: string
    channel: NotificationChannel
    title: string
    detail: string | null
    at: string | null
    /** Cuántos mensajes trae ese aviso (WhatsApp agrupa por conversación). */
    count: number
    /** wa_id o id de tarea, para abrir el destino. */
    ref: string | null
}

export interface NotificationCenter {
    unread: Record<NotificationChannel, number>
    unread_total: number
    seen_at: Record<NotificationChannel, string | null>
    items: NotificationItem[]
}
