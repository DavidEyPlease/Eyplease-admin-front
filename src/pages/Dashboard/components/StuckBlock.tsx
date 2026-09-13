import { Link } from "react-router"
import { MessageCircleIcon, TicketIcon, WrenchIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { OverviewStuck } from "@/interfaces/overview"
import { days } from "../overview.utils"

/**
 * Trabajo que ya está hecho o esperando, y que nadie ha movido.
 *
 * Es la otra mitad del dinero: una pieza terminada que no se publica es trabajo
 * ya pagado que el cliente nunca recibió.
 */
const StuckBlock = ({ stuck }: { stuck: OverviewStuck }) => {
    const buckets = Object.entries(stuck.tasks).sort((a, b) => b[1].stale - a[1].stale)
    const nothing =
        !buckets.length && !stuck.unanswered_chats && !stuck.open_tickets

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Qué está frenado</h2>

            {nothing ? (
                <p className="mt-3 text-sm text-emerald-700">Nada pendiente. Todo entregado y contestado.</p>
            ) : (
                <div className="mt-3 grid gap-2.5">
                    {buckets.map(([name, bucket]) => (
                        <Link
                            key={name}
                            to={APP_ROUTES.TASKS.LIST}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                        >
                            <WrenchIcon className="size-4 shrink-0 text-slate-400" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-slate-900">
                                    {/* El nombre del estado va tal cual: "12 lista para
                                        revisión" no concuerda en plural. */}
                                    <strong>{bucket.count}</strong> en «{name}»
                                </span>
                                {bucket.stale > 0 && (
                                    <span className="block text-xs text-amber-700">
                                        {bucket.stale} {bucket.stale === 1 ? "lleva" : "llevan"} más de una semana · la más
                                        vieja, {days(bucket.oldest_days)}
                                    </span>
                                )}
                            </span>
                        </Link>
                    ))}

                    {stuck.unanswered_chats > 0 && (
                        <Link
                            to={APP_ROUTES.WHATSAPP.INBOX}
                            className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5 transition hover:bg-amber-50"
                        >
                            <MessageCircleIcon className="size-4 shrink-0 text-amber-600" />
                            <span className="text-sm font-medium text-slate-900">
                                {stuck.unanswered_chats}{" "}
                                {stuck.unanswered_chats === 1 ? "clienta espera" : "clientas esperan"} respuesta
                            </span>
                        </Link>
                    )}

                    {stuck.open_tickets > 0 && (
                        <Link
                            to={APP_ROUTES.WHATSAPP.TICKETS}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                        >
                            <TicketIcon className="size-4 shrink-0 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">
                                {stuck.open_tickets} {stuck.open_tickets === 1 ? "ticket abierto" : "tickets abiertos"}
                            </span>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

export default StuckBlock
