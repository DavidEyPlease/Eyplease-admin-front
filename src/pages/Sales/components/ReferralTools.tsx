import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CopyIcon, LinkIcon, UserPlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { ReferralLink } from '@/interfaces/sales'
import { queryKeys } from '@/utils/queryKeys'

const showServerError = (error: unknown) => {
    const message = (error as { message?: string })?.message
    toast.error(message || 'No se pudo. Intenta de nuevo.')
}

const copy = async (value: string) => {
    try {
        await navigator.clipboard.writeText(value)
        toast.success('Liga copiada')
    } catch {
        toast.error(`No se pudo copiar sola: ${value}`)
    }
}

/**
 * «Invite a una Directora», del lado del equipo: sacar la liga de una clienta para mandársela y anotar una
 * recomendación que llegó por WhatsApp ANTES de que la nueva entre (después ya no cuenta: así no se pagan las de
 * quien ya estaba). El premio se da solo; aquí sólo se registra.
 */
const ReferralTools = () => {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery({ onError: showServerError })
    const [account, setAccount] = useState('')
    const [link, setLink] = useState<ReferralLink | null>(null)
    const [form, setForm] = useState({ referrer_account: '', name: '', email: '', phone: '' })
    const [busy, setBusy] = useState<'link' | 'save' | null>(null)

    const findLink = async () => {
        if (!account.trim()) return
        setBusy('link')
        try {
            const response = await request<undefined, ReferralLink>('GET', API_ROUTES.SALES.REFERRAL_LINK.replace('{account}', encodeURIComponent(account.trim())))
            setLink(response.data)
        } catch {
            setLink(null)
        } finally {
            setBusy(null)
        }
    }

    const save = async () => {
        if (!form.referrer_account.trim() || (!form.email.trim() && !form.phone.trim())) {
            toast.error('Pon la cuenta de quien recomienda y el correo o el teléfono de la nueva')
            return
        }
        setBusy('save')
        try {
            await request('POST', API_ROUTES.SALES.REFERRALS, form)
            toast.success('Recomendación anotada: cuando entre y pague su primer mes, el premio se da solo')
            setForm({ referrer_account: '', name: '', email: '', phone: '' })
            await queryClient.invalidateQueries({ queryKey: queryKeys.listBase('sales/referral') })
        } catch {
            /* el error ya salió en el aviso */
        } finally {
            setBusy(null)
        }
    }

    const field = (key: keyof typeof form, placeholder: string, type = 'text') => (
        <input
            type={type}
            value={form[key]}
            placeholder={placeholder}
            onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))}
            className="vta-field"
        />
    )

    return (
        <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 4 } as React.CSSProperties}>
            <h2 className="text-[14.5px] font-extrabold tracking-tight">Recomendaciones</h2>
            <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                Premio: un mes del plan siguiente pagando lo de su plan, cuando la recomendada paga su primer mes. Sólo cuenta si quedó registrada antes de que entrara.
            </p>

            <div className="mt-3 grid gap-2">
                <b className="text-[12px] font-bold">La liga de una clienta</b>
                <div className="flex gap-2">
                    <input
                        value={account}
                        placeholder="Su cuenta"
                        onChange={event => { setAccount(event.target.value); setLink(null) }}
                        onKeyDown={event => { if (event.key === 'Enter') findLink() }}
                        className="vta-field"
                    />
                    <button type="button" disabled={busy === 'link'} className="vta-btn shrink-0" onClick={findLink}>
                        <LinkIcon className="size-3.5" /> Ver
                    </button>
                </div>
                {link && (
                    <button type="button" title="Copiar la liga" className="vta-copy !m-0 justify-between" onClick={() => copy(link.link)}>
                        <span className="truncate">{link.link}</span>
                        <CopyIcon className="size-3.5 shrink-0" />
                    </button>
                )}
            </div>

            <div className="mt-3.5 grid gap-2 border-t border-border pt-3">
                <b className="text-[12px] font-bold">Anotar una recomendación</b>
                {field('referrer_account', 'Cuenta de quien recomienda')}
                {field('name', 'Nombre de la Directora recomendada')}
                {field('email', 'Su correo', 'email')}
                {field('phone', 'Su teléfono', 'tel')}
                <button type="button" disabled={busy === 'save'} className="vta-btn justify-center" onClick={save}>
                    <UserPlusIcon className="size-3.5" /> Anotar
                </button>
            </div>
        </section>
    )
}

export default ReferralTools
