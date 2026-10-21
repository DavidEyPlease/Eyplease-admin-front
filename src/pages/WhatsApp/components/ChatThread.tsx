import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BotIcon, FileTextIcon, PaperclipIcon, SendIcon, UserRoundIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

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
    /** Un archivo con el texto escrito como pie. Igual: true si salio. */
    onSendFile?: (file: File, caption: string) => Promise<boolean>
    onTakeover: (active: boolean) => Promise<boolean>
}

/* Lo que WhatsApp acepta y su tope en MB (la API vuelve a revisarlo). Fuera quedan los que Meta rechaza
   aunque el teléfono los deje elegir: videos .mov del iPhone, fotos .heic o .webp. */
const FILE_LIMITS: Record<string, number> = {
    jpg: 5, jpeg: 5, png: 5,
    mp4: 16, "3gp": 16,
    mp3: 16, m4a: 16, aac: 16, ogg: 16, amr: 16,
    pdf: 25, txt: 25, doc: 25, docx: 25, xls: 25, xlsx: 25, ppt: 25, pptx: 25,
}
const FILE_ACCEPT = Object.keys(FILE_LIMITS).map((ext) => `.${ext}`).join(",")

const sizeLabel = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

/** El motivo si WhatsApp no lo va a aceptar; null si se puede mandar. */
function fileProblem(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const maxMb = FILE_LIMITS[ext]
    if (!maxMb) {
        return ext === "mov"
            ? "WhatsApp no acepta videos .mov (los del iPhone). Conviértelo a MP4."
            : "WhatsApp no acepta ese tipo de archivo. Manda fotos JPG o PNG, videos MP4, audios o documentos PDF, Word, Excel, PowerPoint o texto."
    }
    if (file.size > maxMb * 1024 * 1024) return `El archivo pesa ${sizeLabel(file.size)} y WhatsApp acepta hasta ${maxMb} MB para este tipo.`
    return null
}

const ChatThread = ({ conversation, loading, sending, compact = false, onSend, onSendFile, onTakeover }: Props) => {
    const [draft, setDraft] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    // El archivo elegido es de ESA conversación: al cambiar de chat se suelta (el borrador de texto ya se quedaba).
    useEffect(() => {
        setFile(null)
    }, [conversation?.wa_id])

    const history = useMemo(() => conversation?.history ?? [], [conversation])

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ block: "end" })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [history.length, conversation?.wa_id, scrollToBottom])

    if (!conversation && !loading) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card">
                <p className="px-6 text-center text-sm text-muted-foreground">
                    Elige una conversación para ver el hilo.
                </p>
            </div>
        )
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const text = draft.trim()
        if (sending) return
        // Con archivo, lo escrito viaja como su pie (puede ir vacío)
        if (file && onSendFile) {
            const sent = await onSendFile(file, text)
            if (sent) {
                setFile(null)
                setDraft("")
            }
            return
        }
        if (!text) return
        // Si el envio falla (bot caido, fuera de la ventana de 24 h) NO borramos
        // el borrador: perder lo que la persona escribio es lo peor que podemos
        // hacer justo cuando algo ya salio mal.
        const sent = await onSend(text)
        if (sent) setDraft("")
    }

    const pickFile = (picked: File | undefined) => {
        if (!picked) return
        const problem = fileProblem(picked)
        if (problem) {
            toast.error(problem)
            return
        }
        setFile(picked)
    }

    const name =
        conversation?.name || conversation?.wa_id

    return (
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                {!compact && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">{conversation?.wa_id}</p>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-medium",
                            conversation?.human_took_over
                                ? "bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300"
                                : "bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300"
                        )}
                    >
                        {conversation?.human_took_over ? "Atención manual" : "Bot activo"}
                    </span>
                    <button
                        type="button"
                        disabled={sending}
                        onClick={() => onTakeover(!conversation?.human_took_over)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/40 disabled:opacity-50"
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
                    <p className="py-10 text-center text-sm text-muted-foreground">Sin mensajes todavía.</p>
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
                                            : "rounded-bl-sm bg-muted text-foreground"
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
                                            mine ? "justify-end text-violet-200" : "text-muted-foreground"
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

            <form onSubmit={handleSubmit} className="border-t border-border p-3">
                {file && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                        <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate font-medium text-foreground">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">{sizeLabel(file.size)}</span>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            disabled={sending}
                            title="Quitar archivo"
                            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-foreground/[.07] hover:text-foreground disabled:opacity-50"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    {onSendFile && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={FILE_ACCEPT}
                                className="hidden"
                                onChange={(e) => {
                                    pickFile(e.target.files?.[0])
                                    // Para poder volver a elegir el mismo archivo después de quitarlo
                                    e.target.value = ""
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={sending}
                                onClick={() => fileInputRef.current?.click()}
                                title="Adjuntar archivo (PDF, foto, video, audio, Word, Excel…)"
                                className="shrink-0"
                            >
                                <PaperclipIcon className="size-4" />
                            </Button>
                        </>
                    )}
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
                        placeholder={
                            file
                                ? "Agrega un mensaje para acompañar el archivo (opcional)…"
                                : compact ? "Escribe un mensaje…" : "Escribe un mensaje… (Enter envía, Shift+Enter salta línea)"
                        }
                        className="min-h-[44px] resize-none text-base sm:text-sm"
                    />
                    <Button type="submit" disabled={(!draft.trim() && !file) || sending} className="shrink-0">
                        {sending ? <Spinner /> : <SendIcon className="size-4" />}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ChatThread
