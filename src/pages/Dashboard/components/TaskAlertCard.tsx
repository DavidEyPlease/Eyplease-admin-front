import { Link } from "react-router"
import { ArrowRightIcon, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ServiceRequest } from "@/interfaces/overview"
import { days } from "../overview.utils"

/**
 * Tarjeta de aviso de tareas que esperan a alguien.
 *
 * La usan las solicitudes nuevas y las correcciones: mismo trato visual porque
 * las dos piden lo mismo —que alguien las tome— y así se leen igual de rápido.
 * Se enciende solo cuando hay algo; en cero se queda neutra y callada.
 */

export type AlertTone = "violet" | "amber"

const TONE = {
    violet: {
        card: "border-violet-200 bg-violet-50/50",
        ping: "bg-violet-300",
        badge: "bg-violet-600 text-white",
        link: "text-violet-700",
        chip: "bg-violet-100 text-violet-700",
    },
    amber: {
        card: "border-amber-200 bg-amber-50/50",
        ping: "bg-amber-300",
        badge: "bg-amber-500 text-white",
        link: "text-amber-800",
        chip: "bg-amber-100 text-amber-800",
    },
} as const

interface Props {
    count: number
    items: ServiceRequest[]
    tone: AlertTone
    icon: LucideIcon
    idleIcon: LucideIcon
    /** Título cuando hay algo — recibe el conteo ya formateado. */
    title: (count: number) => string
    idleTitle: string
    subtitle: string
    idleSubtitle: string
    to: string
    linkLabel: string
    idleLinkLabel: string
}

const TaskAlertCard = ({
    count,
    items,
    tone,
    icon: Icon,
    idleIcon: IdleIcon,
    title,
    idleTitle,
    subtitle,
    idleSubtitle,
    to,
    linkLabel,
    idleLinkLabel,
}: Props) => {
    const active = count > 0
    const t = TONE[tone]

    return (
        <div
            className={cn(
                "min-w-0 rounded-xl border p-4 transition",
                active ? t.card : "border-slate-200/80 bg-white"
            )}
        >
            <div className="flex items-center gap-2.5">
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {active && (
                        <span
                            className={cn(
                                "absolute inline-flex size-full animate-ping rounded-lg opacity-40",
                                t.ping
                            )}
                        />
                    )}
                    <span
                        className={cn(
                            "relative flex size-8 items-center justify-center rounded-lg",
                            active ? t.badge : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {active ? <Icon className="size-4" /> : <IdleIcon className="size-4" />}
                    </span>
                </span>

                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {active ? title(count) : idleTitle}
                    </h3>
                    <p className="text-xs text-slate-500">{active ? subtitle : idleSubtitle}</p>
                </div>
            </div>

            {active && items.length > 0 && (
                <ul className="mt-3 grid gap-1">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-baseline justify-between gap-2.5 rounded-lg bg-white/80 px-2.5 py-1.5"
                        >
                            <span className="flex min-w-0 items-baseline gap-2">
                                {item.consecutive != null && (
                                    <span
                                        className={cn(
                                            "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
                                            t.chip
                                        )}
                                    >
                                        #{item.consecutive}
                                    </span>
                                )}
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-slate-900">{item.title}</span>
                                    {item.client && (
                                        <span className="block truncate text-[11px] text-slate-500">
                                            {item.client}
                                            {item.account && <> · {item.account}</>}
                                        </span>
                                    )}
                                </span>
                            </span>
                            <span className="shrink-0 text-[11px] text-slate-400">{days(item.days)}</span>
                        </li>
                    ))}
                </ul>
            )}

            <Link
                to={to}
                className={cn(
                    "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition hover:gap-2 hover:underline",
                    active ? t.link : "text-slate-500"
                )}
            >
                {active ? linkLabel : idleLinkLabel}
                <ArrowRightIcon className="size-3.5" />
            </Link>
        </div>
    )
}

export default TaskAlertCard
