import { useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon } from "lucide-react"

import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"
import { WaInboxMode } from "@/interfaces/whatsapp"

import ConversationList from "./components/ConversationList"
import ChatThread from "./components/ChatThread"
import ClientStrip from "./components/ClientStrip"
import { useWaActions, useWaClientCard, useWaConversation, useWaConversations } from "./useWhatsApp"

/**
 * Bandeja de WhatsApp.
 *
 * Dos columnas: lista y chat. La ficha de la clienta va arriba, en una línea,
 * en vez de ocupar una tercera columna — el chat es lo que hay que leer, así
 * que se queda con el ancho.
 *
 * En móvil se muestra UNA vista a la vez (lista, o chat con botón de volver):
 * apilarlas deja el chat aplastado, que fue el problema del panel anterior.
 *
 * Las alturas usan dvh y no vh: en iOS Safari la barra de direcciones se
 * encoge al hacer scroll y vh deja el compositor fuera de pantalla.
 */
const WhatsAppInboxPage = () => {
    const [mode, setMode] = useState<WaInboxMode>("all")
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [selectedWaId, setSelectedWaId] = useState<string | null>(null)

    // Sin debounce cada tecla dispara una consulta a la base del bot.
    const debouncedSearch = useDebouncedCallback((value: string) => setSearch(value), 350)

    const { response: list, loading: listLoading } = useWaConversations(mode, search)
    const { response: conversation, loading: threadLoading } = useWaConversation(selectedWaId)
    const { response: clientCard, loading: cardLoading } = useWaClientCard(selectedWaId)
    const { sendText, setTakeover, sending } = useWaActions(selectedWaId)

    const conversations = useMemo(() => list?.items ?? [], [list])

    // Al cambiar de filtro, el chat abierto puede quedar fuera de la lista.
    useEffect(() => {
        if (!selectedWaId || !conversations.length) return
        if (!conversations.some((c) => c.wa_id === selectedWaId)) {
            setSelectedWaId(null)
        }
    }, [conversations, selectedWaId])

    const handleSearchChange = (value: string) => {
        setSearchInput(value)
        debouncedSearch(value)
    }

    const selectedName = conversation?.name || selectedWaId

    const listProps = {
        conversations,
        loading: listLoading,
        mode,
        search: searchInput,
        selectedWaId,
        onModeChange: setMode,
        onSearchChange: handleSearchChange,
        onSelect: setSelectedWaId,
    }

    const threadProps = {
        conversation,
        loading: threadLoading,
        sending,
        onSend: sendText,
        onTakeover: setTakeover,
    }

    return (
        <div className="flex h-[calc(100dvh-140px)] min-h-0 min-w-0 flex-col gap-3">
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2.5">
                    <span
                        className="h-7 w-1.5 rounded-full"
                        style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }}
                    />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">WhatsApp</h1>
                </div>

                {/* La ficha sustituye a los contadores del bot. */}
                {selectedWaId && (
                    <div className="hidden min-w-0 lg:block">
                        <ClientStrip data={clientCard} loading={cardLoading} />
                    </div>
                )}
            </div>

            {/* Escritorio: lista + chat */}
            <div className="hidden min-h-0 flex-1 gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
                <ConversationList {...listProps} />
                <ChatThread {...threadProps} />
            </div>

            {/* Móvil: una vista a la vez */}
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
                {!selectedWaId ? (
                    <ConversationList {...listProps} />
                ) : (
                    <>
                        <div className="mb-2 flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedWaId(null)}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                Chats
                            </button>
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                                {selectedName}
                            </p>
                        </div>

                        <div className="mb-2 -mx-1 shrink-0 overflow-x-auto px-1">
                            <ClientStrip data={clientCard} loading={cardLoading} />
                        </div>

                        <div className="min-h-0 flex-1">
                            <ChatThread {...threadProps} compact />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default WhatsAppInboxPage
