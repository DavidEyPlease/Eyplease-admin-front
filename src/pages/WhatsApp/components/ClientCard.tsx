import { BadgeCheckIcon, CircleAlertIcon, ExternalLinkIcon } from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback, AvatarImage } from "@/uishadcn/ui/avatar"
import Spinner from "@/components/common/Spinner"
import { APP_ROUTES } from "@/constants/app"
import { cn } from "@/lib/utils"
import { WaClientCardResponse } from "@/interfaces/whatsapp"

interface Props {
    data: WaClientCardResponse | undefined
    loading: boolean
}

/** Etiqueta clara: el modulo no usa los tokens de tema para no mezclarse
 *  con el resto de la pantalla, que es siempre claro. */
const Chip = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", className)}>
        {children}
    </span>
)

/**
 * Quien esta del otro lado del chat.
 *
 * Esta ficha es el motivo de traer WhatsApp a la API: el cruce entre la
 * conversacion y el cliente real (plan, estatus, cobranza) se resuelve del lado
 * del servidor con un join, no pidiendole datos sueltos a otra plataforma.
 */
const ClientCard = ({ data, loading }: Props) => {
    if (loading) {
        return (
            <div className="flex justify-center rounded-xl border border-border bg-card py-8">
                <Spinner />
            </div>
        )
    }

    if (!data?.identified || !data.client) {
        return (
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <p>
                    El bot todavía no identifica a esta persona. En cuanto dé su código de
                    consultora, aquí aparece su ficha.
                </p>
            </div>
        )
    }

    const client = data.client
    const { payments } = client

    return (
        <div className="grid h-max content-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                <Avatar className="size-11">
                    {client.photo && <AvatarImage src={client.photo} alt={client.name} />}
                    <AvatarFallback className="bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300">
                        {client.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{client.account}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <Chip className={client.active ? "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300"}>
                    {client.active ? "Activa" : "Inactiva"}
                </Chip>
                {client.plan && <Chip className="bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300">{client.plan}</Chip>}
                {client.rank && <Chip className="border border-border text-muted-foreground">{client.rank}</Chip>}
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">Pagos {payments.year}</dt>
                    <dd className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
                        <BadgeCheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        {payments.paid_periods} cubiertos
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Pendientes</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{payments.pending_periods}</dd>
                </div>
                {payments.in_review_periods > 0 && (
                    <div className="col-span-2 rounded-md bg-amber-50 dark:bg-amber-400/15 px-2 py-1.5">
                        <dt className="text-amber-700 dark:text-amber-300">Comprobante por validar</dt>
                        <dd className="mt-0.5 font-semibold text-amber-900">
                            {payments.in_review_periods}{" "}
                            {payments.in_review_periods === 1 ? "periodo" : "periodos"}
                        </dd>
                    </div>
                )}
                {payments.last_payment && (
                    <div className="col-span-2">
                        <dt className="text-muted-foreground">Último pago</dt>
                        <dd className="mt-0.5 font-semibold text-foreground">
                            {payments.last_payment.period} · {payments.last_payment.status}
                        </dd>
                    </div>
                )}
            </dl>

            <Link
                to={APP_ROUTES.CLIENTS.DETAIL.replace(":id", client.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 hover:underline"
            >
                Ver ficha completa
                <ExternalLinkIcon className="size-3.5" />
            </Link>
        </div>
    )
}

export default ClientCard
