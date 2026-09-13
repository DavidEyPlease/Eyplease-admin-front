import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BotIcon, SendIcon, UserRoundIcon } from "lucide-react"

import { Button } from "@/uishadcn/ui/button"
import { Textarea } from "@/uishadcn/ui/textarea"
import Spinner from "@/components/common/Spinner"
import MediaBubble from "./MediaBubble"
import { cn } from "@/lib/utils"
import { WaConversation } from "@/interfaces/whatsapp"

import { clockTime } from "../whatsapp.utils"

interface Props {
    conversation: WaConversation | undefined
    loading: boolean
    sending: boolean
    /** En movil el nombre ya va en la barra de navegacion: no lo repetimos. */
    compact?: boolean
    /** Devuelve true si el mensaje salio; si no, conservamos el borrador. */
    onSend: (text: string) => Promise<boolean>
    onTakeover: (active: boolean) => Promise<boolean>
}

const ChatThread = ({ conversation, loading, sending, compact = false, onSend, onTakeover }: Props) => {
    const [draft, setDraft] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)

    const history = useMemo(() => conversation?.history ?? [], [conversation])

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ block: "end" })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [history.length, conversation?.wa_id, scrollToBottom])

    if (!conversation && !loading) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl border border-slate-200/80 bg-white">
                <p className="px-6 text-center text-sm text-slate-400">
                    Elige una conversación para ver el hilo.
                </p>
            </div>
        )
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const text = draft.trim()
        if (!text || sending) return
        // Si el envio falla (bot caido, fuera de la ventana de 24 h) NO borramos
        // el borrador: perder lo que la persona escribio es lo peor que podemos
        // hacer justo cuando algo ya salio mal.
        const sent = await onSend(text)
        if (sent) setDraft("")
    }

    const name =
        conversation?.name || conversation?.wa_id

    return (
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                {!compact && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                        <p className="truncate text-xs text-slate-400">{conversation?.wa_id}</p>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-medium",
                            conversation?.human_took_over
                                ? "bg-amber-100 text-amber-700"
                                : "bg-violet-100 text-violet-700"
                        )}
                    >
                        {conversation?.human_took_over ? "Atención manual" : "Bot activo"}
                    </span>
                    <button
                        type="button"
                        disabled={sending}
                        onClick={() => onTakeover(!conversation?.human_took_over)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        {conversation?.human_took_over ? "Devolver al bot" : "Tomar el chat"}
                    </button>
                </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loading && !history.length ? (
                    <div className="flex justify-center py-10">
                        <Spinner />
                    </div>
                ) : !history.length ? (
                    <p className="py-10 text-center text-sm text-slate-400">Sin mensajes todavía.</p>
                ) : (
                    history.map((msg, i) => {
                        const mine = msg.role === "assistant"
                        return (
                            <div key={`${msg.at}-${i}`} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm break-words",
                                        mine
                                            ? "rounded-br-sm bg-violet-600 text-white"
                                            : "rounded-bl-sm bg-slate-100 text-slate-800"
                                    )}
                                >
                                    {msg.media && (
                                        <div className={cn(msg.content && "mb-2")}>
                                            <MediaBubble media={msg.media} mine={mine} onLoaded={scrollToBottom} />
                                        </div>
                                    )}
                                    {msg.content && <span className="whitespace-pre-wrap">{msg.content}</span>}
                                    <span
                                        className={cn(
                                            "mt-1 flex items-center gap-1 text-[10px]",
                                            mine ? "justify-end text-violet-200" : "text-slate-400"
                                        )}
                                    >
                                        {mine && (msg.manual ? <UserRoundIcon className="size-3" /> : <BotIcon className="size-3" />)}
                                        {clockTime(msg.at)}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
                <div className="flex items-end gap-2">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            // En movil Enter debe saltar linea: enviar con el
                            // teclado tactil es justo lo que no quieres.
                            if (compact) return
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                void handleSubmit(e)
                            }
                        }}
                        rows={2}
                        placeholder={compact ? "Escribe un mensaje…" : "Escribe un mensaje… (Enter envía, Shift+Enter salta línea)"}
                        className="min-h-[44px] resize-none text-base sm:text-sm"
                    />
                    <Button type="submit" disabled={!draft.trim() || sending} className="shrink-0">
                        {sending ? <Spinner /> : <SendIcon className="size-4" />}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ChatThread
