/** Utilidades de formato del modulo de WhatsApp. */

/**
 * "hace 5 min", "ayer", "12 sep".
 *
 * Las fechas del bot son ISO-8601 en texto; si viniera algo no parseable
 * devolvemos cadena vacia en lugar de "Invalid Date".
 */
export function relativeTime(iso: string | null | undefined): string {
    if (!iso) return ""

    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ""

    const diffMs = Date.now() - ts
    const minutes = Math.floor(diffMs / 60_000)

    if (minutes < 1) return "ahora"
    if (minutes < 60) return `hace ${minutes} min`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `hace ${hours} h`

    const days = Math.floor(hours / 24)
    if (days === 1) return "ayer"
    if (days < 7) return `hace ${days} d`

    return new Date(ts).toLocaleDateString("es-MX", { day: "numeric", month: "short" })
}

/** Hora corta para las burbujas del chat. */
export function clockTime(iso: string | null | undefined): string {
    if (!iso) return ""
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ""
    return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
}

/**
 * La ventana de servicio de WhatsApp: fuera de 24 h desde el ultimo mensaje
 * del cliente, Meta solo deja enviar plantillas aprobadas.
 */
const WINDOW_MS = 24 * 60 * 60 * 1000

export function isWithinServiceWindow(lastClientMessageAt: string | null | undefined): boolean {
    if (!lastClientMessageAt) return false
    const ts = Date.parse(lastClientMessageAt)
    if (Number.isNaN(ts)) return false
    return Date.now() - ts < WINDOW_MS
}
