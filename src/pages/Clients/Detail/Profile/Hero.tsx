import { Link } from "react-router";
import { ArrowLeftIcon, CopyIcon, CreditCardIcon, MoreHorizontalIcon, PencilIcon, PowerIcon, PowerOffIcon } from "lucide-react";
import { toast } from "sonner";

import { APP_ROUTES } from "@/constants/app";
import { countryInfo, moneyIn } from "@/constants/countries";
import { IClientListItem } from "@/interfaces/clients";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/uishadcn/ui/dropdown-menu";
import { initials, titleCase } from "../../List/names";
import { countryOf, FLAGS, lastSeen } from "./utils";

interface Props {
    client: IClientListItem
    onEdit: () => void
    onPaymentLink: () => void
    onChangeStatus: () => void
}

/**
 * Quién es y cómo está, de un vistazo: foto, nombre, cuenta, plan, si está activa y cuándo entró.
 * A la derecha, lo que más se hace desde su ficha.
 */
const Hero = ({ client, onEdit, onPaymentLink, onChangeStatus }: Props) => {
    const active = client.user?.active !== false
    const plan = client.user?.plan
    const country = countryOf(client.country)
    const currency = plan?.currency ?? countryInfo(country).currency
    /* La liga con tarjeta sólo se ha probado en pesos mexicanos; y a quien paga domiciliada el cargo le llega solo */
    const canSendLink = currency === 'MXN' && !client.card_subscription
    const name = titleCase(client.name)
    /* Sin foto, la API manda un avatar genérico: `has_photo` dice si es la suya */
    const photoUrl = (client.photo as { has_photo?: boolean } | null)?.has_photo === false ? null : client.photo?.url

    const copyUserId = async () => {
        if (!client.user?.id) return
        await navigator.clipboard.writeText(client.user.id)
        toast.success('ID de usuario copiado')
    }

    return (
        <section className="shell-glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
            <div aria-hidden className="shell-grad pointer-events-none absolute -top-24 -right-16 size-64 rounded-full opacity-[.13] blur-3xl" />

            <Link to={APP_ROUTES.CLIENTS.LIST} className="relative inline-flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeftIcon className="size-3.5" /> Clientas
            </Link>

            <div className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-4">
                {photoUrl
                    ? <img src={photoUrl} alt="" className="size-14 shrink-0 self-start rounded-[18px] object-cover shadow-[0_14px_30px_-16px_rgba(78,49,192,.7)] sm:size-[76px] sm:self-center sm:rounded-[22px]" />
                    : <span className="shell-grad grid size-14 shrink-0 place-items-center self-start rounded-[18px] text-[19px] font-extrabold text-white sm:size-[76px] sm:self-center sm:rounded-[22px] sm:text-[24px]">{initials(client.name)}</span>}

                <div className="min-w-0 flex-1">
                    <h1 className="line-clamp-2 text-[22px] leading-tight font-extrabold tracking-tight break-words sm:truncate sm:text-[28px]">{name}</h1>
                    <p className="mt-0.5 text-[13px] text-muted-foreground sm:truncate">
                        Cuenta <b className="font-bold text-foreground tabular-nums">{client.account}</b>
                        {client.rank ? ` · ${client.rank}` : ''}
                        {` · ${lastSeen(client.last_sign_in_at)}`}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className={cn('pulse-tag', active ? 'ok' : 'warn')}>{active ? 'Activa' : 'Inactiva'}</span>
                        {plan
                            ? <span className="pulse-tag plain max-w-full overflow-hidden whitespace-nowrap">{plan.name} · {moneyIn(Number(plan.price), currency)}{currency !== 'MXN' ? ` ${currency}` : ''}/mes</span>
                            : <span className="pulse-tag warn">Sin plan</span>}
                        <span className="pulse-tag plain">{FLAGS[country]} {countryInfo(country).label}</span>
                        {client.card_subscription && <span className="pulse-tag plain">Paga con tarjeta automática</span>}
                        {client.promotion && <span className="pulse-tag ok">{client.promotion.name ?? 'Con promoción'}</span>}
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {canSendLink && (
                        <button type="button" onClick={onPaymentLink} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/70 px-3.5 text-[13px] font-bold transition-colors hover:border-[#6C47FF]/40">
                            <CreditCardIcon className="size-4" /> Liga de pago
                        </button>
                    )}
                    <button type="button" onClick={onEdit} className="shell-cta inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white">
                        <PencilIcon className="size-4" /> Editar datos
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label={`Más acciones para ${name}`} className="grid size-10 cursor-pointer place-items-center rounded-xl border border-border bg-card/70 text-muted-foreground transition-colors outline-none hover:text-foreground data-[state=open]:text-foreground">
                            <MoreHorizontalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6} className="w-60 rounded-2xl p-1.5">
                            {client.user?.id && (
                                <DropdownMenuItem onSelect={copyUserId} className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold">
                                    <CopyIcon className="size-4" /> Copiar su ID de usuario
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={onChangeStatus} className={cn('cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold', active && 'text-destructive focus:text-destructive')}>
                                {active ? <PowerOffIcon className="size-4" /> : <PowerIcon className="size-4" />}
                                {active ? 'Desactivar clienta' : 'Activar clienta'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </section>
    )
}

export default Hero;
