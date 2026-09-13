import { CircleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { WaClientCardResponse, WaPaymentStatus } from "@/interfaces/whatsapp"

import { isWithinServiceWindow, relativeTime } from "../whatsapp.utils"

/**
 * Ficha de la clienta en una sola línea, arriba del todo.
 *
 * Reemplaza a los contadores del bot (cuántas en manual / con el bot) y a la
 * tercera columna: así el chat se queda con el ancho de la pantalla. Solo lleva
 * lo que se necesita para atender: si está activa, cómo va de pagos y cuándo
 * escribió por última vez — que además es lo que dice si Meta aún deja
 * responder con texto libre.
 */

const PAYMENT_LABEL: Record<WaPaymentStatus, string> = {
    al_corriente: "Pago al corriente",
    retraso: "Pago con retraso",
    por_validar: "Comprobante por validar",
}

const PAYMENT_STYLE: Record<WaPaymentStatus, string> = {
    al_corriente: "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
    retraso: "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300",
    por_validar: "bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-200",
}

const Chip = ({
    className,
    title,
    children,
}: {
    className?: string
    title?: string
    children: React.ReactNode
}) => (
    <span
        title={title}
        className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", className)}
    >
        {children}
    </span>
)

interface Props {
    data: WaClientCardResponse | undefined
    loading: boolean
}

const ClientStrip = ({ data, loading }: Props) => {
    if (loading && !data) {
        return <span className="text-xs text-muted-foreground">Cargando ficha…</span>
    }

    if (!data) return null

    const lastAt = data.last_client_message_at
    const windowOpen = isWithinServiceWindow(lastAt)

    if (!data.identified || !data.client) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <Chip className="bg-muted text-muted-foreground">
                    <CircleAlertIcon className="mr-1 size-3.5 text-amber-500" />
                    Sin identificar
                </Chip>
                {lastAt && (
                    <Chip className={windowOpen ? "bg-muted text-muted-foreground" : "bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-200"}>
                        Escribió {relativeTime(lastAt)}
                        {!windowOpen && " · fuera de 24 h"}
                    </Chip>
                )}
            </div>
        )
    }

    const client = data.client
    const payment = client.payments.status

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Chip className={client.active ? "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300"}>
                {client.active ? "Activa" : "Inactiva"}
            </Chip>

            <Chip className={PAYMENT_STYLE[payment]}>{PAYMENT_LABEL[payment]}</Chip>

            {lastAt && (
                <Chip
                    className={windowOpen ? "bg-muted text-muted-foreground" : "bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-200"}
                    // Fuera de la ventana Meta rechaza el texto libre: el aviso
                    // va aquí en corto, en vez de un párrafo sobre el chat.
                    title={
                        windowOpen
                            ? "Dentro de la ventana de 24 h: se puede responder con texto libre"
                            : "Pasaron más de 24 h: WhatsApp solo acepta plantillas aprobadas"
                    }
                >
                    Escribió {relativeTime(lastAt)}
                    {!windowOpen && " · fuera de 24 h"}
                </Chip>
            )}
        </div>
    )
}

export default ClientStrip
