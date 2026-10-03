import { ReactNode, useState } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, MessageCircleIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { countryInfo } from "@/constants/countries";
import { IClientListItem } from "@/interfaces/clients";
import { formatDate } from "@/utils/dates";
import { countryOf, dayLabel, FLAGS, signupOrigin, whatsappLink } from "./utils";

const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copiado`)
}

const IconButton = ({ label, onClick, href, children }: { label: string, onClick?: () => void, href?: string, children: ReactNode }) => {
    const className = "grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[.06] hover:text-foreground"
    return href
        ? <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={className}>{children}</a>
        : <button type="button" onClick={onClick} aria-label={label} title={label} className={className}>{children}</button>
}

const Fact = ({ label, value, sub, actions }: { label: string, value: ReactNode, sub?: ReactNode, actions?: ReactNode }) => (
    <div className="flex min-w-0 items-center gap-2 py-2.5">
        <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">{label}</p>
            <p className="truncate text-[13.5px] font-semibold">{value}</p>
            {sub && <p className="truncate text-[11.5px] text-muted-foreground">{sub}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
    </div>
)

/**
 * Sus datos de contacto y de cuenta, y el acceso al portal de Mary Kay con el que el robot baja sus
 * reportes. La contraseña va tapada: se destapa o se copia a propósito, no queda a la vista de quien
 * pase junto a la pantalla.
 */
const AccountFacts = ({ client }: { client: IClientListItem }) => {
    const [showPassword, setShowPassword] = useState(false)
    const country = countryOf(client.country)
    const email = client.user?.email
    const phone = client.user?.phone
    const whatsapp = whatsappLink(phone, country)
    const login = client.platform_guest_account || client.account
    const password = client.external_company_pw

    return (
        <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold"><UserRoundIcon className="size-4 text-[#6C47FF] dark:text-[#A894FF]" /> Sus datos</h2>

            <div className="mt-1 divide-y divide-border">
                <Fact
                    label="Correo"
                    value={email || <span className="text-muted-foreground">Sin correo</span>}
                    actions={email && <IconButton label="Copiar correo" onClick={() => copy(email, 'Correo')}><CopyIcon className="size-3.5" /></IconButton>}
                />
                <Fact
                    label="Teléfono"
                    value={phone || <span className="text-muted-foreground">Sin teléfono</span>}
                    actions={phone && <>
                        {whatsapp && <IconButton label="Escribirle por WhatsApp" href={whatsapp}><MessageCircleIcon className="size-3.5" /></IconButton>}
                        <IconButton label="Copiar teléfono" onClick={() => copy(phone, 'Teléfono')}><CopyIcon className="size-3.5" /></IconButton>
                    </>}
                />
                <Fact label="País" value={`${FLAGS[country]} ${countryInfo(country).label}`} />
                <Fact label="En Eyplease+ desde" value={formatDate(client.created_at, { date: 'medium' })} sub={signupOrigin(client.from_signup)} />
                {(client.start_date || client.last_order_date || client.mk_status) && (
                    <Fact
                        label="En Mary Kay"
                        value={dayLabel(client.start_date) ? `Desde ${dayLabel(client.start_date)}` : '—'}
                        sub={[client.mk_status && `Estatus ${client.mk_status}`, dayLabel(client.last_order_date) && `último pedido ${dayLabel(client.last_order_date)}`].filter(Boolean).join(' · ') || undefined}
                    />
                )}
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-foreground/[.025] p-3.5">
                <p className="flex items-center gap-2 text-[12.5px] font-extrabold"><KeyRoundIcon className="size-3.5 text-[#6C47FF] dark:text-[#A894FF]" /> Portal de Mary Kay</p>
                <Fact
                    label="Usuario"
                    value={<span className="tabular-nums">{login}</span>}
                    actions={<IconButton label="Copiar usuario" onClick={() => copy(login, 'Usuario')}><CopyIcon className="size-3.5" /></IconButton>}
                />
                {password ? (
                    <Fact
                        label="Contraseña"
                        value={<span className="font-mono tracking-wider">{showPassword ? password : '•'.repeat(Math.min(Math.max(password.length, 8), 14))}</span>}
                        actions={<>
                            <IconButton label={showPassword ? 'Tapar contraseña' : 'Ver contraseña'} onClick={() => setShowPassword(value => !value)}>
                                {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                            </IconButton>
                            <IconButton label="Copiar contraseña" onClick={() => copy(password, 'Contraseña')}><CopyIcon className="size-3.5" /></IconButton>
                        </>}
                    />
                ) : (
                    <p className="mt-2 rounded-xl bg-amber-100 px-3 py-2 text-[12px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                        Sin contraseña del portal: el robot no puede bajar sus reportes. Agrégala en «Editar datos».
                    </p>
                )}
            </div>
        </section>
    )
}

export default AccountFacts;
