import { MessageCircleIcon, SearchIcon, UserRoundIcon } from "lucide-react"

import { Input } from "@/uishadcn/ui/input"
import Spinner from "@/components/common/Spinner"
import { cn } from "@/lib/utils"
import { WaConversationSummary, WaInboxGroup, WaInboxMode } from "@/interfaces/whatsapp"

import { isClientConversation, relativeTime } from "../whatsapp.utils"

/**
 * Clientas y prospectos en pestañas aparte: con los anuncios del Buen Fin, de los
 * 50 chats que caben en la lista 45 eran prospectos y las clientas no se veían.
 */
const GROUPS: { key: WaInboxGroup; label: string; empty: string }[] = [
    { key: "clients", label: "Clientas", empty: "No hay chats de clientas." },
    { key: "prospects", label: "Prospectos", empty: "No hay chats de prospectos." },
    { key: "all", label: "Todas", empty: "No hay conversaciones." },
]

const MODES: { key: WaInboxMode; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "manual", label: "Manual" },
    { key: "bot", label: "Bot" },
]

interface Props {
    conversations: WaConversationSummary[]
    loading: boolean
    group: WaInboxGroup
    mode: WaInboxMode
    search: string
    selectedWaId: string | null
    onGroupChange: (group: WaInboxGroup) => void
    onModeChange: (mode: WaInboxMode) => void
    onSearchChange: (search: string) => void
    onSelect: (waId: string) => void
}

const ConversationList = ({
    conversations,
    loading,
    group,
    mode,
    search,
    selectedWaId,
    onGroupChange,
    onModeChange,
    onSearchChange,
    onSelect,
}: Props) => {
    const searching = search.trim() !== ""

    return (
        <div className="flex min-h-0 flex-col gap-3">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o código"
                    className="pl-9"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="inline-flex w-full gap-1 rounded-full border border-border bg-card/70 p-1">
                    {GROUPS.map((g) => {
                        const active = group === g.key && !searching
                        return (
                            <button
                                key={g.key}
                                onClick={() => {
                                    onGroupChange(g.key)
                                    if (searching) onSearchChange("")
                                }}
                                className={cn(
                                    "flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
                                    active ? "text-white" : "text-muted-foreground hover:text-foreground"
                                )}
                                style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {g.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-1.5 px-1 text-xs">
                    <span className="mr-0.5 text-muted-foreground">Atiende</span>
                    {MODES.map((m) => {
                        const active = mode === m.key
                        return (
                            <button
                                key={m.key}
                                onClick={() => onModeChange(m.key)}
                                className={cn(
                                    "rounded-full border px-2.5 py-0.5 font-medium transition",
                                    active
                                        ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-400/15 dark:text-violet-300"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {m.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card">
                {searching && (
                    <p className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
                        Buscando en todos los chats, clientas y prospectos.
                    </p>
                )}
                {loading && !conversations.length ? (
                    <div className="flex items-center justify-center py-10">
                        <Spinner />
                    </div>
                ) : !conversations.length ? (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {searching ? "Sin resultados para esa búsqueda." : GROUPS.find((g) => g.key === group)?.empty}
                    </p>
                ) : (
                    <ul className="divide-y divide-border">
                        {conversations.map((conv) => {
                            const active = conv.wa_id === selectedWaId
                            // `name` y `account` los calcula la API: no repetimos la lógica aquí.
                            const name = conv.name || conv.wa_id
                            const client = isClientConversation(conv)
                            // En la pestaña de prospectos no hace falta decir «Prospecto»; al mezclarlos, sí.
                            const tag = client
                                ? conv.account
                                : group === "prospects" && !searching
                                  ? conv.from_ad ? "Anuncio" : null
                                  : conv.from_ad ? "Prospecto · anuncio" : "Prospecto"
                            return (
                                <li key={conv.wa_id}>
                                    <button
                                        onClick={() => onSelect(conv.wa_id)}
                                        className={cn(
                                            "flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-muted/40",
                                            active && "bg-violet-50/70 dark:bg-violet-400/15 hover:bg-violet-50 dark:bg-violet-400/10"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                                                conv.human_took_over ? "bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300" : "bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300"
                                            )}
                                            title={conv.human_took_over ? "Atención manual" : "Lo atiende el bot"}
                                        >
                                            {conv.human_took_over ? <UserRoundIcon className="size-4" /> : <MessageCircleIcon className="size-4" />}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-baseline justify-between gap-2">
                                                <span className="truncate text-sm font-semibold text-foreground">{name}</span>
                                                <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(conv.last_at ?? conv.updated_at)}</span>
                                            </span>
                                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                {conv.last_message || "Sin mensajes"}
                                            </span>
                                            {tag && (
                                                <span
                                                    className={cn(
                                                        "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                        client
                                                            ? "bg-muted text-muted-foreground"
                                                            : "bg-teal-50 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300"
                                                    )}
                                                >
                                                    {tag}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ConversationList
