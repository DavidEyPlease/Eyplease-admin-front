import { toast } from "sonner"
import { CopyIcon, CreditCardIcon, MessageCircleIcon, RefreshCwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatMoney, periodLabel } from "@/utils/finance"
import { firstName, waLink } from "@/pages/Sales/sales.utils"
import { titleCase } from "@/pages/Clients/List/names"
import { useCardIssues, type CardIssue } from "../useCardIssues"

const monthYear = (period: string | null) => period ? `${periodLabel(period)} ${period.slice(0, 4)}` : "Sin mes"

const since = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : ""

/** El motivo dicho A ELLA (el panel lo cuenta en tercera persona). */
const REASON_FOR_HER: Record<string, string> = {
    expired_card: "tu tarjeta está vencida",
    insufficient_funds: "el banco indicó fondos insuficientes",
    not_permitted: "el banco no autorizó el cargo",
    authentication_required: "tu banco pide que autorices el cobro",
    invoice_by_email: "la factura de este mes sigue pendiente",
    subscription_unpaid: "tu cobro automático quedó detenido por un pago anterior",
    no_payment_method: "no tienes una tarjeta guardada",
}

/** El mensaje para la clienta: qué pasó y dónde pagarlo. */
const whatsappText = (issue: CardIssue) => {
    const name = firstName(issue.client.name)
    const why = REASON_FOR_HER[issue.reason_code] ?? "el banco rechazó el cobro"
    const amount = `$${Math.round(issue.amount).toLocaleString("es-MX")}`
    return `Hola${name ? ` ${name}` : ""}, tu pago de Eyplease+ de ${monthYear(issue.period).toLowerCase()} (${amount}) no se pudo cobrar: ${why}. `
        + (issue.payment_url ? `Puedes pagarlo aquí con tu tarjeta: ${issue.payment_url}` : "¿Me ayudas a revisarlo para que no se detenga tu servicio?")
}

const copy = async (text: string, done: string) => {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(done)
    } catch {
        toast.error("No se pudo copiar")
    }
}

/**
 * Cobros con tarjeta que Stripe no pudo hacer, con el porqué. Antes el panel sólo decía «vencido»
 * y de lo que Stripe ni intentaba (una factura por correo, una suscripción «sin pagar») no había
 * rastro. La API los apunta al fallar un cobro y los revisa en Stripe todos los días a las 9:15.
 */
const CardIssues = () => {
    const { issues, loading, scan, cardLink, working } = useCardIssues()

    const scanNow = async () => {
        try {
            await scan()
            toast.success("Stripe revisado: la lista está al día")
        } catch {
            toast.error("No se pudo revisar Stripe ahora")
        }
    }

    const sendCardLink = async (issue: CardIssue) => {
        try {
            const response = await cardLink(issue.id)
            const url = response?.data?.url
            if (!url) throw new Error("Sin liga")
            await copy(url, `Liga copiada: ${titleCase(issue.client.name ?? "la clienta")} puede cambiar su tarjeta ahí`)
        } catch (error) {
            toast.error((error as { message?: string })?.message || "No se pudo crear la liga")
        }
    }

    if (loading) {
        return <section className="shell-glass h-28 animate-pulse rounded-3xl" />
    }

    return (
        <section className="shell-glass overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-center justify-between gap-2 px-5 pt-[18px] pb-2.5">
                <h2 className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
                    <CreditCardIcon className="size-4 text-rose-500" /> Cobros con tarjeta que fallaron
                    <span className={cn("pulse-tag", issues.length > 0 ? "bad" : "ok")}>{issues.length > 0 ? issues.length : "al día"}</span>
                </h2>
                <button type="button" disabled={working} onClick={scanNow} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50">
                    <RefreshCwIcon className={cn("size-3.5", working && "animate-spin")} /> Revisar Stripe ahora
                </button>
            </header>

            {issues.length === 0 ? (
                <p className="px-5 pb-5 text-[13px] text-muted-foreground">
                    Ningún cobro con tarjeta pendiente. Stripe se revisa solo todos los días a las 9:15, y en cuanto un cobro falle aparece aquí y en la campana.
                </p>
            ) : (
                <div className="divide-y divide-border">
                    {issues.map(issue => {
                        const whatsapp = waLink(issue.client.phone, whatsappText(issue))
                        return (
                            <div key={issue.id} className="flex flex-wrap items-start gap-x-4 gap-y-2.5 px-5 py-3.5">
                                <div className="min-w-0 flex-1">
                                    <b className="block truncate text-[13.5px] font-bold">{titleCase(issue.client.name ?? "Clienta")}</b>
                                    <small className="block text-[11.5px] text-muted-foreground">
                                        {issue.client.account}{issue.client.plan ? ` · ${issue.client.plan}` : ""} · {monthYear(issue.period)} · <b className="text-foreground">{formatMoney(issue.amount)}</b>
                                    </small>
                                    <p className="mt-1 text-[12.5px] font-semibold text-rose-600 dark:text-rose-400">{issue.reason}</p>
                                    <small className="block text-[11px] text-muted-foreground">
                                        {issue.invoice_status === "draft" ? "Stripe ni emitió este cobro" : issue.attempts > 0 ? `${issue.attempts} ${issue.attempts === 1 ? "intento" : "intentos"}` : "sin intentos"} · desde el {since(issue.detected_at)}
                                    </small>
                                    {issue.platform_status === "paid" && (
                                        <small className="mt-1 block text-[11.5px] font-semibold text-amber-700 dark:text-amber-300">
                                            En la plataforma este mes está pagado, pero en Stripe sigue abierto: por eso su suscripción no avanza.
                                        </small>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {whatsapp && (
                                        <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-500/12 px-3 text-[12.5px] font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400">
                                            <MessageCircleIcon className="size-4" /> WhatsApp
                                        </a>
                                    )}
                                    {issue.payment_url && (
                                        <button type="button" onClick={() => copy(issue.payment_url!, "Liga de pago copiada")} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold text-primary hover:bg-primary/10">
                                            <CopyIcon className="size-3.5" /> Liga de pago
                                        </button>
                                    )}
                                    <button type="button" disabled={working} onClick={() => sendCardLink(issue)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-50">
                                        <CreditCardIcon className="size-3.5" /> Liga para cambiar tarjeta
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default CardIssues
