import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { NotificationCenter, NotificationChannel } from "@/interfaces/notifications"

export const NOTIFICATIONS_KEY = ["admin", "notifications"] as const

/** Cada minuto: lo bastante seguido para enterarse, sin machacar la API. */
const POLL_MS = 60_000

/**
 * Avisos del panel.
 *
 * Vive en el layout, así que el contador del menú se ve desde cualquier
 * pantalla y no solo desde el Inicio.
 */
export function useNotificationCenter() {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery()
    const [marking, setMarking] = useState(false)

    const { response, loading } = useFetchQuery<NotificationCenter>("/notifications/center", {
        customQueryKey: NOTIFICATIONS_KEY,
        refetchInterval: POLL_MS,
        staleTime: 30_000,
    })

    const markSeen = useCallback(
        async (channel?: NotificationChannel) => {
            setMarking(true)
            try {
                await request("POST", "/notifications/center/seen", channel ? { channel } : {})
                await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
            } catch {
                // El toast de useRequestQuery ya avisó; no dejamos la promesa suelta.
            } finally {
                setMarking(false)
            }
        },
        [request, queryClient]
    )

    return { data: response, loading, markSeen, marking }
}
