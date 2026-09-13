import { useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon, UserRoundIcon } from "lucide-react"

import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"
import { WaInboxMode } from "@/interfaces/whatsapp"

import ConversationList from "./components/ConversationList"
import ChatThread from "./components/ChatThread"
import ClientCard from "./components/ClientCard"
import {
    useWaActions,
    useWaClientCard,
    useWaConversation,
    useWaConversations,
    useWaStats,
} from "./useWhatsApp"

/**
 * Bandeja de WhatsApp.
 *
 * En escritorio son tres columnas (lista · chat · ficha). En movil eso no cabe:
 * apilarlas deja el chat aplastado entre la lista y la ficha, que fue justo el
 * problema del panel anterior. Aqui el movil muestra UNA vista a la vez —
 * lista, o chat con boton de volver — y la ficha se abre a peticion.
 *
 * Las alturas usan dvh y no vh: en iOS Safari la barra de direcciones se
 * encoge al hacer scroll y vh deja el compositor fuera de pantalla.
 */
const WhatsAppInboxPage = () => {
    const [mode, setMode] = useState<WaInboxMode>("all")
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [selectedWaId, setSelectedWaId] = useState<string | null>(null)
    const [showCardOnMobile, setShowCardOnMobile] = useState(false)

    // Sin debounce cada tecla dispara una consulta a la base del bot.
    const debouncedSearch = useDebouncedCallback((value: string) => setSearch(value), 350)

    const { response: stats } = useWaStats()
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

    const handleSelect = (waId: string) => {
        setSelectedWaId(waId)
        setShowCardOnMobile(false)
    }

    const selectedName =
        conversation?.display_name ||
        conversation?.identity?.nombre ||
        conversation?.profile_name ||
        selectedWaId

    const listProps = {
        conversations,
        loading: listLoading,
        mode,
        search: searchInput,
        selectedWaId,
        onModeChange: setMode,
        onSearchChange: handleSearchChange,
        onSelect: handleSelect,
    }

    const threadProps = {
        conversation,
        loading: threadLoading,
        sending,
        onSend: sendText,
        onTakeover: setTakeover,
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-2.5">
                    <span
                        className="h-7 w-1.5 rounded-full"
                        style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }}
                    />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">WhatsApp</h1>
                </div>

                {stats && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                            <strong className="text-slate-900">{stats.manual}</strong> en manual
                        </span>
                        <span>
                            <strong className="text-slate-900">{stats.bot}</strong> con el bot
                        </span>
                        <span>
                            <strong className="text-slate-900">{stats.open_tickets}</strong> tickets abiertos
                        </span>
                    </div>
                )}
            </div>

            {/* Escritorio: lista · chat · ficha */}
            <div className="hidden h-[calc(100dvh-220px)] min-h-0 gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)_280px]">
                <ConversationList {...listProps} />
                <ChatThread {...threadProps} />
                <div className="min-w-0 overflow-y-auto">
                    {selectedWaId ? (
                        <ClientCard data={clientCard} loading={cardLoading} />
                    ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                            La ficha de la clienta aparece aquí al abrir un chat.
                        </p>
                    )}
                </div>
            </div>

            {/* Móvil: una vista a la vez */}
            <div className="flex h-[calc(100dvh-190px)] min-h-0 flex-col lg:hidden">
                {!selectedWaId ? (
                    <ConversationList {...listProps} />
                ) : (
                    <>
                        <div className="mb-3 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedWaId(null)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                Chats
                            </button>
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                                {selectedName}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCardOnMobile((v) => !v)}
                                aria-pressed={showCardOnMobile}
                                title="Ver la ficha de la clienta"
                                className={
                                    "rounded-lg border px-2.5 py-1.5 " +
                                    (showCardOnMobile
                                        ? "border-violet-200 bg-violet-50 text-violet-700"
                                        : "border-slate-200 bg-white text-slate-600")
                                }
                            >
                                <UserRoundIcon className="size-4" />
                            </button>
                        </div>

                        {showCardOnMobile ? (
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <ClientCard data={clientCard} loading={cardLoading} />
                            </div>
                        ) : (
                            <div className="min-h-0 flex-1">
                                <ChatThread {...threadProps} compact />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default WhatsAppInboxPage
