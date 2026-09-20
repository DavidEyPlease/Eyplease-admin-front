import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { CopilotRole, ICopilotMessage, ICopilotSendPayload, ICopilotSendResponse } from '@/interfaces/copilot'
import { conversationsKey, messagesKey } from './keys'

const HISTORY_STALE_TIME_MS = 60_000

const buildMessage = (role: CopilotRole, text: string): ICopilotMessage => ({
    id: crypto.randomUUID(),
    role,
    text,
    created_at: new Date().toISOString(),
})

/**
 * El hilo activo del Copiloto. Mismo trato que el Asistente de la web de clientas: el front sólo
 * guarda el `conversation_id`; los mensajes viven en estado local (el optimista incluido) y el
 * historial se trae de la API al reabrir una conversación.
 */
const useCopilotChat = () => {
    const queryClient = useQueryClient()

    const [conversationId, setConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ICopilotMessage[]>([])

    /* Refs para no pisar el hilo optimista cuando el historial resuelve a mitad de un envío */
    const sendingRef = useRef(false)
    const messagesRef = useRef(messages)
    messagesRef.current = messages

    const { request, requestState } = useRequestQuery({
        onError: () => {
            toast.error('El Copiloto no pudo contestar. Inténtalo de nuevo.')
        },
    })

    const { request: deleteRequest, requestState: deleteState } = useRequestQuery({
        invalidateQueries: [conversationsKey],
    })

    const { response: history, loading: loadingHistory } = useFetchQuery<ICopilotMessage[]>(
        API_ROUTES.COPILOT.CONVERSATION_MESSAGES.replace('{id}', conversationId ?? ''),
        {
            enabled: !!conversationId,
            customQueryKey: messagesKey(conversationId ?? 'new'),
            staleTime: HISTORY_STALE_TIME_MS,
        },
    )

    /* El historial manda al abrir una conversación */
    useEffect(() => {
        if (!conversationId || sendingRef.current) return
        if (history) setMessages(history)
    }, [conversationId, history])

    const openConversation = (id: string) => {
        if (id === conversationId) return
        setConversationId(id)
        setMessages([])
    }

    const startNewChat = () => {
        setConversationId(null)
        setMessages([])
    }

    /** @returns false si falló, para que la caja de texto devuelva lo escrito */
    const send = async (text: string) => {
        const message = text.trim()
        if (!message || sendingRef.current) return false

        sendingRef.current = true
        setMessages(prev => [...prev, buildMessage('user', message)])

        try {
            const response = await request<ICopilotSendPayload, ICopilotSendResponse>(
                'POST',
                API_ROUTES.COPILOT.SEND,
                { message, conversation_id: conversationId },
            )

            const thread = [...messagesRef.current, buildMessage('assistant', response.data.message)]
            setMessages(thread)

            /* Se siembra la caché del historial para que fijar el id no dispare un refetch */
            queryClient.setQueryData(messagesKey(response.data.conversation_id), thread)
            if (!conversationId) setConversationId(response.data.conversation_id)

            /* La conversación aparece (nueva) o sube al tope del historial */
            queryClient.invalidateQueries({ queryKey: conversationsKey })

            return true
        } catch {
            /* No llegó: se saca del hilo y la caja de texto lo devuelve para reintentar */
            setMessages(prev => prev.slice(0, -1))
            return false
        } finally {
            sendingRef.current = false
        }
    }

    const removeConversation = async (id: string) => {
        await deleteRequest('DELETE', API_ROUTES.COPILOT.DELETE_CONVERSATION.replace('{id}', id))
        queryClient.removeQueries({ queryKey: messagesKey(id) })

        if (id === conversationId) startNewChat()
        toast.success('Conversación eliminada')
    }

    return {
        conversationId,
        messages,
        sending: requestState.loading,
        loadingHistory: loadingHistory && !!conversationId && messages.length === 0,
        deleting: deleteState.loading,
        send,
        openConversation,
        startNewChat,
        removeConversation,
    }
}

export default useCopilotChat
