import { Link } from "react-router"
import { ArrowRightIcon, InboxIcon, SparklesIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { cn } from "@/lib/utils"
import { OverviewServiceRequests } from "@/interfaces/overview"
import { days } from "../overview.utils"

/**
 * Solicitudes que mandan las clientas y todavía no tiene nadie.
 *
 * Es lo único del Inicio que espera una acción de alguien AHORA, así que
 * cuando hay alguna la tarjeta cambia de tono y late. Cuando no hay, se queda
 * callada: un indicador que siempre grita deja de leerse.
 */
const ServiceRequests = ({ data }: { data: OverviewServiceRequests }) => {
    const hasNew = data.new > 0

    return (
        <div
            className={cn(
                "rounded-xl border p-4 transition",
                hasNew ? "border-violet-200 bg-violet-50/50" : "border-slate-200/80 bg-white"
            )}
        >
            <div className="flex items-center gap-2.5">
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {hasNew && (
                        <span className="absolute inline-flex size-full animate-ping rounded-lg bg-violet-300 opacity-40" />
                    )}
                    <span
                        className={cn(
                            "relative flex size-8 items-center justify-center rounded-lg",
                            hasNew ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {hasNew ? <SparklesIcon className="size-4" /> : <InboxIcon className="size-4" />}
                    </span>
                </span>

                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {hasNew
                            ? `${data.new} ${data.new === 1 ? "solicitud nueva" : "solicitudes nuevas"}`
                            : "Solicitudes de clientas"}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {hasNew ? "Sin asignar" : "Ninguna sin asignar"}
                        {data.in_review > 0 && <> · {data.in_review} en revisión</>}
                    </p>
                </div>
            </div>

            {hasNew && (
                <ul className="mt-3 grid gap-1">
                    {data.latest.map((request) => (
                        <li
                            key={request.id}
                            className="flex items-baseline justify-between gap-3 rounded-lg bg-white/80 px-2.5 py-1.5"
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-sm text-slate-900">{request.title}</span>
                                {request.client && (
                                    <span className="block truncate text-[11px] text-slate-500">
                                        {request.client}
                                        {request.account && <> · {request.account}</>}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 text-[11px] text-slate-400">{days(request.days)}</span>
                        </li>
                    ))}
                </ul>
            )}

            <Link
                to={APP_ROUTES.TASKS.LIST}
                className={cn(
                    "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition hover:gap-2 hover:underline",
                    hasNew ? "text-violet-700" : "text-slate-500"
                )}
            >
                {hasNew ? "Atender solicitudes" : "Ver solicitudes"}
                <ArrowRightIcon className="size-3.5" />
            </Link>
        </div>
    )
}

export default ServiceRequests
