import { useState } from "react"

import Spinner from "@/components/common/Spinner"
import { cn } from "@/lib/utils"
import { WaTicketStatus } from "@/interfaces/whatsapp"

import { relativeTime } from "./whatsapp.utils"
import { useWaTicketActions, useWaTickets } from "./useWhatsApp"

const FILTERS: { key: WaTicketStatus | "todos"; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "abierto", label: "Abiertos" },
    { key: "en_proceso", label: "En proceso" },
    { key: "resuelto", label: "Resueltos" },
]

const SEVERITY_STYLES: Record<string, string> = {
    alta: "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300",
    media: "bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300",
    baja: "bg-muted text-muted-foreground",
}

const WhatsAppTicketsPage = () => {
    const [filter, setFilter] = useState<WaTicketStatus | "todos">("abierto")

    const { response, loading } = useWaTickets(filter === "todos" ? undefined : filter)
    const { setStatus, updating } = useWaTicketActions()

    const tickets = response?.items ?? []

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5">
            <div className="flex items-center gap-2.5">
                <span
                    className="h-7 w-1.5 rounded-full"
                    style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }}
                />
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Tickets de WhatsApp
                </h1>
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
                <div className="inline-flex w-max gap-1 rounded-full border border-border bg-white/70 p-1">
                    {FILTERS.map((f) => {
                        const active = filter === f.key
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={cn(
                                    "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5",
                                    active ? "text-white" : "text-muted-foreground hover:text-foreground"
                                )}
                                style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {f.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {loading && !tickets.length ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : !tickets.length ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                    No hay tickets en este estado.
                </p>
            ) : (
                <div className="grid gap-3">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                        >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            {ticket.client_name || ticket.wa_id}
                                        </span>
                                        <span
                                            className={cn(
                                                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                                                SEVERITY_STYLES[ticket.severity] ?? SEVERITY_STYLES.baja
                                            )}
                                        >
                                            {ticket.severity}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{relativeTime(ticket.created_at)}</span>
                                    </div>
                                    <p className="mt-1.5 text-sm text-muted-foreground">{ticket.problem}</p>
                                </div>

                                <div className="flex gap-2">
                                    {ticket.status !== "resuelto" ? (
                                        <button
                                            type="button"
                                            disabled={updating}
                                            onClick={() => setStatus(ticket.id, "resuelto")}
                                            title="Al resolver, el bot avisa a la clienta si la ventana de 24 h sigue abierta"
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
                                            style={{ backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" }}
                                        >
                                            Marcar resuelto
                                        </button>
                                    ) : (
                                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                            Resuelto
                                        </span>
                                    )}
                                </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default WhatsAppTicketsPage
