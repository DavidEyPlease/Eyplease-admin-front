import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
    BellIcon,
    CheckCheckIcon,
    MessageCircleIcon,
    PencilRulerIcon,
    SparklesIcon,
    TriangleAlertIcon,
} from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover"
import { APP_ROUTES } from "@/constants/app"
import { cn } from "@/lib/utils"
import { NotificationChannel, NotificationItem } from "@/interfaces/notifications"
import { useNotificationCenter } from "@/hooks/useNotificationCenter"

/**
 * Centro de avisos del panel.
 *
 * Vive en la barra superior para que se vea desde cualquier pantalla. Junta lo
 * que llega de sitios distintos (WhatsApp, solicitudes, correcciones, entregas
 * fallidas) en una sola lista ordenada por hora.
 */

const CHANNEL = {
    whatsapp: { label: "WhatsApp", icon: MessageCircleIcon, tone: "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" },
    service_requests: { label: "Solicitud", icon: SparklesIcon, tone: "bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300" },
    corrections: { label: "Corrección", icon: PencilRulerIcon, tone: "bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-200" },
    delivery_failures: { label: "No entregado", icon: TriangleAlertIcon, tone: "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300" },
} as const satisfies Record<NotificationChannel, { label: string; icon: typeof BellIcon; tone: string }>

function timeAgo(iso: string | null): string {
    if (!iso) return ""
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ""
    const min = Math.floor((Date.now() - ts) / 60_000)
    if (min < 1) return "ahora"
    if (min < 60) return `hace ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `hace ${h} h`
    const d = Math.floor(h / 24)
    if (d === 1) return "ayer"
    if (d < 7) return `hace ${d} d`
    return new Date(ts).toLocaleDateString("es-MX", { day: "numeric", month: "short" })
}

const NotificationCenter = () => {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const { data, markSeen, marking } = useNotificationCenter()

    const total = data?.unread_total ?? 0
    const items = useMemo(() => data?.items ?? [], [data])

    const go = (item: NotificationItem) => {
        setOpen(false)
        if (item.channel === "whatsapp") {
            navigate(`${APP_ROUTES.WHATSAPP.INBOX}?wa=${encodeURIComponent(item.ref ?? "")}`)
            return
        }
        if (item.channel === "delivery_failures") {
            navigate(APP_ROUTES.WHATSAPP.INBOX)
            return
        }
        navigate(APP_ROUTES.TASKS.LIST)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={total > 0 ? `${total} avisos sin ver` : "Avisos"}
                    className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                    <BellIcon className="size-[18px]" />
                    {total > 0 && (
                        <>
                            <span className="absolute right-1 top-1 flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-75" />
                            </span>
                            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold tabular-nums text-white">
                                {total > 99 ? "99+" : total}
                            </span>
                        </>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
                    <p className="text-sm font-semibold text-foreground">
                        Avisos {total > 0 && <span className="text-muted-foreground">· {total} sin ver</span>}
                    </p>
                    {total > 0 && (
                        <button
                            type="button"
                            disabled={marking}
                            onClick={() => markSeen()}
                            className="flex items-center gap-1 text-xs font-medium text-violet-600 transition hover:underline disabled:opacity-50 dark:text-violet-300"
                        >
                            <CheckCheckIcon className="size-3.5" />
                            Marcar visto
                        </button>
                    )}
                </div>

                <div className="max-h-[min(26rem,60dvh)] overflow-y-auto">
                    {!items.length ? (
                        <p className="px-3.5 py-10 text-center text-sm text-muted-foreground">
                            Nada nuevo por ahora.
                        </p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {items.map((item) => {
                                const meta = CHANNEL[item.channel]
                                const Icon = meta.icon
                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => go(item)}
                                            className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-accent"
                                        >
                                            <span
                                                className={cn(
                                                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                                                    meta.tone
                                                )}
                                            >
                                                <Icon className="size-3.5" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="truncate text-sm font-medium text-foreground">
                                                        {item.title}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] text-muted-foreground">
                                                        {timeAgo(item.at)}
                                                    </span>
                                                </span>
                                                {item.detail && (
                                                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                        {item.detail}
                                                    </span>
                                                )}
                                                <span className="mt-1 flex items-center gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                                                    {item.count > 1 && (
                                                        <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                                                            {item.count} mensajes
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationCenter
