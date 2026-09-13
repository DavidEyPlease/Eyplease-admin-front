/**
 * Hooks del modulo de WhatsApp.
 *
 * Todo pasa por /admin/whatsapp/*: la API lee la base del bot y le delega los
 * envios. El navegador nunca ve la clave interna del bot.
 */
import { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import {
    WaClientCardResponse,
    WaConversation,
    WaConversationSummary,
    WaInboxMode,
    WaStats,
    WaTemplate,
    WaTicket,
    WaTicketStatus,
} from "@/interfaces/whatsapp"

/** Un chat abierto se refresca solo; sin esto habria que recargar a mano. */
const LIVE_REFRESH_MS = 15_000

export interface Paginated<T> {
    current_page: number
    items: T[]
    per_page: number
    total_items: number
    last_page: number
    is_last_page: boolean
}


/**
 * HttpService lanza el cuerpo JSON del error, no un Error: el mensaje que puso
 * la API viene en `.message`. Sin esto el usuario solo ve "error interno" y no
 * se entera de que el problema es el bot, la ventana de 24 h o el permiso.
 */
function showServerError(error: unknown) {
    const message =
        typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: unknown }).message ?? "")
            : ""
    toast.error(message || "No se pudo completar la acción.")
}

export const WA_KEYS = {
    conversations: (filters: object) => ["wa", "conversations", filters] as const,
    conversation: (waId: string) => ["wa", "conversation", waId] as const,
    client: (waId: string) => ["wa", "client", waId] as const,
    tickets: (filters: object) => ["wa", "tickets", filters] as const,
    stats: ["wa", "stats"] as const,
    templates: ["wa", "templates"] as const,
}

export function useWaStats() {
    return useFetchQuery<WaStats>("/whatsapp/stats", {
        customQueryKey: WA_KEYS.stats,
        refetchInterval: LIVE_REFRESH_MS,
    })
}

export function useWaConversations(mode: WaInboxMode, search: string) {
    const queryParams = useMemo(
        () => ({
            ...(mode === "all" ? {} : { mode }),
            ...(search ? { search } : {}),
            per_page: 50,
        }),
        [mode, search]
    )

    return useFetchQuery<Paginated<WaConversationSummary>>("/whatsapp/conversations", {
        queryParams,
        customQueryKey: WA_KEYS.conversations(queryParams),
        refetchInterval: LIVE_REFRESH_MS,
    })
}

export function useWaConversation(waId: string | null) {
    return useFetchQuery<WaConversation>(`/whatsapp/conversations/${waId}`, {
        enabled: !!waId,
        customQueryKey: WA_KEYS.conversation(waId ?? ""),
        refetchInterval: waId ? LIVE_REFRESH_MS : false,
    })
}

/** Ficha del cliente: quien es, su plan y como va de pagos. */
export function useWaClientCard(waId: string | null) {
    return useFetchQuery<WaClientCardResponse>(`/whatsapp/conversations/${waId}/client`, {
        enabled: !!waId,
        customQueryKey: WA_KEYS.client(waId ?? ""),
        staleTime: 60_000,
    })
}

export function useWaTickets(status?: WaTicketStatus) {
    const queryParams = useMemo(() => (status ? { status } : {}), [status])

    return useFetchQuery<Paginated<WaTicket>>("/whatsapp/tickets", {
        queryParams,
        customQueryKey: WA_KEYS.tickets(queryParams),
    })
}

export function useWaTemplates() {
    return useFetchQuery<WaTemplate[]>("/whatsapp/templates", {
        customQueryKey: WA_KEYS.templates,
        staleTime: 5 * 60_000,
    })
}

/** Acciones que escriben: van al bot a traves de la API. */
export function useWaActions(waId: string | null) {
    const queryClient = useQueryClient()
    const [busy, setBusy] = useState(false)
    const { request } = useRequestQuery({ onError: showServerError })

    const refreshThread = useCallback(() => {
        if (!waId) return
        queryClient.invalidateQueries({ queryKey: WA_KEYS.conversation(waId) })
        queryClient.invalidateQueries({ queryKey: ["wa", "conversations"] })
    }, [queryClient, waId])

    /** Devuelve true solo si la acción llegó al bot: quien llama decide qué
     *  hacer (p. ej. no borrar el mensaje que la persona escribió). */
    const run = useCallback(
        async (url: string, body?: object): Promise<boolean> => {
            if (!waId) return false
            setBusy(true)
            try {
                await request("POST", url, body)
                refreshThread()
                return true
            } catch {
                // onError ya avisó al usuario; aquí solo evitamos que la
                // promesa quede sin manejar y rompa la vista.
                return false
            } finally {
                setBusy(false)
            }
        },
        [request, refreshThread, waId]
    )

    const sendText = useCallback(
        (text: string) => run(`/whatsapp/conversations/${waId}/send`, { text }),
        [run, waId]
    )

    const setTakeover = useCallback(
        (active: boolean) => run(`/whatsapp/conversations/${waId}/takeover`, { active }),
        [run, waId]
    )

    const sendTemplate = useCallback(
        (name: string) => run(`/whatsapp/conversations/${waId}/send-template`, { name }),
        [run, waId]
    )

    return { sendText, setTakeover, sendTemplate, sending: busy }
}

export function useWaTicketActions() {
    const queryClient = useQueryClient()
    const [busy, setBusy] = useState(false)
    const { request } = useRequestQuery({ onError: showServerError })

    const setStatus = useCallback(
        async (id: string, status: WaTicketStatus) => {
            setBusy(true)
            try {
                await request("POST", `/whatsapp/tickets/${id}/status`, { status })
                queryClient.invalidateQueries({ queryKey: ["wa", "tickets"] })
                queryClient.invalidateQueries({ queryKey: WA_KEYS.stats })
            } catch {
                // onError ya avisó; no dejamos la promesa sin manejar.
            } finally {
                setBusy(false)
            }
        },
        [request, queryClient]
    )

    return { setStatus, updating: busy }
}
