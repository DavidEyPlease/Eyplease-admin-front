import { MessageCircleIcon, SearchIcon, UserRoundIcon } from "lucide-react"

import { Input } from "@/uishadcn/ui/input"
import Spinner from "@/components/common/Spinner"
import { cn } from "@/lib/utils"
import { WaConversationSummary, WaInboxMode } from "@/interfaces/whatsapp"

import { relativeTime } from "../whatsapp.utils"

const MODES: { key: WaInboxMode; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "manual", label: "Manual" },
    { key: "bot", label: "Bot" },
]

interface Props {
    conversations: WaConversationSummary[]
    loading: boolean
    mode: WaInboxMode
    search: string
    selectedWaId: string | null
    onModeChange: (mode: WaInboxMode) => void
    onSearchChange: (search: string) => void
    onSelect: (waId: string) => void
}

const ConversationList = ({
    conversations,
    loading,
    mode,
    search,
    selectedWaId,
    onModeChange,
    onSearchChange,
    onSelect,
}: Props) => {
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

            <div className="inline-flex w-full gap-1 rounded-full border border-border bg-card/70 p-1">
                {MODES.map((m) => {
                    const active = mode === m.key
                    return (
                        <button
                            key={m.key}
                            onClick={() => onModeChange(m.key)}
                            className={cn(
                                "flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
                                active ? "text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                            style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                        >
                            {m.label}
                        </button>
                    )
                })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card">
                {loading && !conversations.length ? (
                    <div className="flex items-center justify-center py-10">
                        <Spinner />
                    </div>
                ) : !conversations.length ? (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {search ? "Sin resultados para esa búsqueda." : "No hay conversaciones."}
                    </p>
                ) : (
                    <ul className="divide-y divide-border">
                        {conversations.map((conv) => {
                            const active = conv.wa_id === selectedWaId
                            // `name` y `account` los calcula la API: no repetimos la lógica aquí.
                            const name = conv.name || conv.wa_id
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
                                                <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(conv.updated_at)}</span>
                                            </span>
                                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                {conv.last_message || "Sin mensajes"}
                                            </span>
                                            {conv.account && (
                                                <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                    {conv.account}
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
