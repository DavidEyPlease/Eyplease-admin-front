import { forwardRef, ReactNode, useState } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2Icon, MessageCircleIcon, PencilIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { countryInfo } from "@/constants/countries";
import { IClientListItem, IClientUpdate } from "@/interfaces/clients";
import { cn } from "@/lib/utils";
import { ClientsService } from "@/services/clients.service";
import { formatDate } from "@/utils/dates";
import { publishEvent } from "@/utils/events";
import PicturesRow from "./PicturesRow";
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

const Field = ({ label, hint, error, children }: { label: string, hint?: string, error?: string | null, children: ReactNode }) => (
    <label className="grid min-w-0 gap-1">
        <span className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">{label}</span>
        {children}
        {error ? <span className="text-[11.5px] font-semibold text-rose-600 dark:text-rose-400">{error}</span> : hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
)

const inputClass = "h-10 w-full min-w-0 rounded-xl border border-border bg-card/70 px-3 text-[13.5px] outline-none transition-colors focus:border-[#6C47FF]"

interface Draft {
    name: string
    email: string
    phone: string
    country_code: 'MEX' | 'COL'
    username: string
    platform_guest_account: string
    mk_password: string
}

const draftOf = (client: IClientListItem): Draft => ({
    name: client.name ?? '',
    email: client.user?.email ?? '',
    phone: client.user?.phone ?? '',
    country_code: countryOf(client.country),
    username: client.account ?? '',
    platform_guest_account: client.platform_guest_account ?? '',
    mk_password: '',
})

interface Props {
    client: IClientListItem
    editing: boolean
    onEditingChange: (editing: boolean) => void
}

/**
 * Su foto y logotipo, sus datos de contacto y de cuenta, y el acceso al portal de Mary Kay con el que
 * el robot baja sus reportes. Todo se edita aquí mismo («Editar»): manda sólo lo que cambió al mismo
 * `PUT clients/{id}` de siempre. La contraseña va tapada; vacía al editar = no se toca.
 */
const AccountFacts = forwardRef<HTMLElement, Props>(({ client, editing, onEditingChange }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [draft, setDraft] = useState<Draft>(() => draftOf(client))
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
    /* Al abrir la edición se toma la clienta como está AHORA (pudo cambiar foto, plan… desde que se abrió la ficha) */
    const [openedFor, setOpenedFor] = useState(editing)
    if (editing !== openedFor) {
        setOpenedFor(editing)
        if (editing) { setDraft(draftOf(client)); setErrors({}) }
    }

    const country = countryOf(client.country)
    const email = client.user?.email
    const phone = client.user?.phone
    const whatsapp = whatsappLink(phone, country)
    const login = client.platform_guest_account || client.account
    const password = client.external_company_pw

    const set = (key: keyof Draft, value: string) => setDraft(current => ({ ...current, [key]: value }))

    const save = async () => {
        const original = draftOf(client)
        const next: Partial<Record<keyof Draft, string>> = {}
        if (!draft.name.trim()) next.name = 'Escribe su nombre'
        if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) next.email = 'Ese correo no es válido'
        if (!draft.username.trim()) next.username = 'Escribe su número de cuenta'
        if (draft.phone.trim() && draft.phone.replace(/\D/g, '').length < 10) next.phone = 'Faltan dígitos (son 10)'
        setErrors(next)
        if (Object.keys(next).length) return

        /* Sólo lo que cambió: la API trata cada campo por separado */
        const payload: IClientUpdate = {}
        if (draft.name.trim() !== original.name) payload.name = draft.name.trim()
        if (draft.email.trim() !== original.email) payload.email = draft.email.trim()
        if (draft.phone.trim() !== original.phone) payload.phone = draft.phone.replace(/\D/g, '')
        if (draft.country_code !== original.country_code) payload.country_code = draft.country_code
        if (draft.username.trim() !== original.username) payload.username = draft.username.trim()
        /* Vacío no se manda: el robot toma la cuenta cuando no hay usuario de portal, y la API guardaría un texto vacío */
        if (draft.platform_guest_account.trim() && draft.platform_guest_account.trim() !== original.platform_guest_account) payload.platform_guest_account = draft.platform_guest_account.trim()
        if (draft.mk_password.trim()) payload.mk_password = draft.mk_password.trim()

        if (!Object.keys(payload).length) { onEditingChange(false); return }

        setSaving(true)
        try {
            const response = await ClientsService.update(client.id, payload)
            if (response.success) {
                publishEvent('client-updated', response.data)
                toast.success('Datos guardados')
                onEditingChange(false)
            } else {
                toast.error(response.message || 'No se pudieron guardar sus datos')
            }
        } catch (error) {
            const message = (error as { message?: string })?.message ?? ''
            toast.error(/consultant code is already in use/i.test(message) ? 'Ese número de cuenta ya lo tiene otra clienta' : message || 'No se pudieron guardar sus datos')
        } finally {
            setSaving(false)
        }
    }

    return (
        <section ref={ref} className={cn('shell-glass grid min-w-0 scroll-mt-24 grid-cols-1 rounded-3xl p-5 transition-shadow', editing && 'ring-2 ring-[#6C47FF]/50')}>
            <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-[14px] font-extrabold"><UserRoundIcon className="size-4 text-[#6C47FF] dark:text-[#A894FF]" /> Sus datos</h2>
                {!editing && (
                    <button type="button" onClick={() => onEditingChange(true)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12.5px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/10 dark:text-[#A894FF]">
                        <PencilIcon className="size-3.5" /> Editar
                    </button>
                )}
            </div>

            <div className="mt-3"><PicturesRow client={client} /></div>

            {editing ? (
                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3">
                    <Field label="Nombre" error={errors.name}><input value={draft.name} onChange={event => set('name', event.target.value)} className={inputClass} autoFocus /></Field>
                    <Field label="Correo" error={errors.email}><input type="email" value={draft.email} onChange={event => set('email', event.target.value)} className={inputClass} /></Field>
                    <Field label="Teléfono (WhatsApp)" error={errors.phone} hint="10 dígitos, sin lada"><input inputMode="tel" value={draft.phone} onChange={event => set('phone', event.target.value)} className={inputClass} /></Field>
                    <Field label="País">
                        <select value={draft.country_code} onChange={event => set('country_code', event.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                            <option value="MEX">🇲🇽 México</option>
                            <option value="COL">🇨🇴 Colombia</option>
                        </select>
                    </Field>
                    <Field label="Cuenta de Mary Kay" error={errors.username} hint="También es su usuario para entrar a Eyplease+"><input value={draft.username} onChange={event => set('username', event.target.value)} className={cn(inputClass, 'tabular-nums')} /></Field>

                    <div className="mt-1 grid gap-3 rounded-2xl border border-border bg-foreground/[.025] p-3.5">
                        <p className="flex items-center gap-2 text-[12.5px] font-extrabold"><KeyRoundIcon className="size-3.5 text-[#6C47FF] dark:text-[#A894FF]" /> Portal de Mary Kay</p>
                        <Field label="Usuario del portal" hint="Si no tiene uno aparte, se usa su número de cuenta"><input value={draft.platform_guest_account} onChange={event => set('platform_guest_account', event.target.value)} className={inputClass} placeholder={draft.username} /></Field>
                        <Field label="Contraseña nueva" hint={password ? 'Déjala vacía para conservar la que tiene' : 'Hoy no tiene: sin ella el robot no baja sus reportes'}>
                            <input type="password" autoComplete="new-password" value={draft.mk_password} onChange={event => set('mk_password', event.target.value)} className={inputClass} />
                        </Field>
                    </div>

                    <div className="mt-1 flex items-center justify-end gap-2">
                        <button type="button" onClick={() => onEditingChange(false)} disabled={saving} className="h-10 cursor-pointer rounded-xl px-3.5 text-[13px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-50">Cancelar</button>
                        <button type="button" onClick={save} disabled={saving} className="shell-cta inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white disabled:cursor-default disabled:opacity-60">
                            {saving && <Loader2Icon className="size-4 animate-spin" />} Guardar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-2 divide-y divide-border">
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
                                Sin contraseña del portal: el robot no puede bajar sus reportes. Agrégala con «Editar».
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
})

AccountFacts.displayName = 'AccountFacts'

export default AccountFacts;
