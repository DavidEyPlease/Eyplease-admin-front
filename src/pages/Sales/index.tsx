import { useState } from 'react'

import Spinner from '@/components/common/Spinner'
import UIPagination from '@/components/generics/Pagination'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/dates'
import { relativeTime } from '@/pages/WhatsApp/whatsapp.utils'

import { featureText, firstName, signalsText, waLink } from './sales.utils'
import { DirectorProspect, PlanGift, PlanInterest, SalesTab, useSalesActions, useSalesList } from './useSales'

const TABS: Array<{ key: SalesTab, label: string }> = [
    { key: 'gifts', label: 'Regalos y paquetes' },
    { key: 'interests', label: 'Quieren subir de plan' },
    { key: 'prospects', label: 'Directoras invitadas' },
]

const CHIP = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold'
const CHIP_OK = `${CHIP} bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300`
const CHIP_WARN = `${CHIP} bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300`
const CHIP_MUTED = `${CHIP} bg-muted text-muted-foreground`
const CHIP_BRAND = `${CHIP} bg-[#EEEBFC] text-[#4B37C8] dark:bg-[#6C47FF]/20 dark:text-[#C9BDFF]`

const BTN = 'inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[13px] font-semibold text-foreground transition hover:bg-accent disabled:opacity-50'
const BTN_WA = 'inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700'

const when = (iso: string | null | undefined) => iso ? `${relativeTime(iso)} · ${formatDate(new Date(iso), { date: 'medium', time: 'short' })}` : ''

/** Nombre · cuenta · teléfono · correo de la clienta, para saber a quién le hablas. */
const Who = ({ name, account, phone, email, plan }: { name?: string | null, account?: string | null, phone?: string | null, email?: string | null, plan?: string | null }) => (
    <p className="text-[12.5px] text-muted-foreground">
        {[account && `Cuenta ${account}`, plan && `Hoy en ${plan}`, phone, email].filter(Boolean).join(' · ') || name}
    </p>
)

/**
 * Ventas: lo que las clientas piden desde la app y el equipo cierra por fuera (la app de tienda no cobra ni dice
 * cómo pagar). Tres listas: regalos y paquetes de unidad, quién quiere subir de plan, y las Directoras que llegan
 * invitadas por sus consultoras. Cada fila lleva WhatsApp con el mensaje listo y el "ya la contacté".
 */
const SalesPage = () => {
    const [tab, setTab] = useState<SalesTab>('gifts')
    const [pendingOnly, setPendingOnly] = useState(true)

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5">
            <div className="flex items-center gap-2.5">
                {isNewShell() ? (
                    <PageHead
                        eyebrow="Clientas · Ventas"
                        title={<>Ventas · <em>lo que piden desde la app</em></>}
                        sub="Regalos y paquetes de unidad, quién quiere subir de plan y las Directoras invitadas. La app no cobra: se cierra por WhatsApp o transferencia y aquí se marca."
                    />
                ) : (<>
                    <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: 'linear-gradient(180deg,#5B47E0,#5DD9D2)' }} />
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Ventas</h1>
                </>)}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="-mx-1 overflow-x-auto px-1">
                    <div className="inline-flex w-max gap-1 rounded-full border border-border bg-card/70 p-1">
                        {TABS.map(t => {
                            const active = tab === t.key
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setTab(t.key)}
                                    className={cn('whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5', active ? 'text-white' : 'text-muted-foreground hover:text-foreground')}
                                    style={active ? { backgroundImage: 'linear-gradient(135deg,#5B47E0,#6B5BE8)' } : undefined}
                                >
                                    {t.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted-foreground">
                    <input type="checkbox" checked={pendingOnly} onChange={event => setPendingOnly(event.target.checked)} className="size-4 accent-[#5B47E0]" />
                    Sólo pendientes
                </label>
            </div>

            {tab === 'gifts' && <GiftsList pendingOnly={pendingOnly} />}
            {tab === 'interests' && <InterestsList pendingOnly={pendingOnly} />}
            {tab === 'prospects' && <ProspectsList pendingOnly={pendingOnly} />}
        </div>
    )
}

const ListShell = <T,>({ tab, pendingOnly, empty, render }: { tab: SalesTab, pendingOnly: boolean, empty: string, render: (item: T) => React.ReactNode }) => {
    const { response, loading, page, setPage, perPage } = useSalesList<T>(tab, pendingOnly)
    const items = response?.items ?? []

    if (loading && !items.length) return <div className="flex justify-center py-16"><Spinner size="md" /></div>
    if (!items.length) return <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">{empty}</p>

    return (
        <>
            <p className="text-[12.5px] text-muted-foreground">{response?.total_items ?? items.length} {pendingOnly ? 'pendientes' : 'en total'}</p>
            <div className="grid grid-cols-1 gap-3">{items.map(render)}</div>
            {(response?.last_page ?? 1) > 1 && (
                <UIPagination page={page} perPage={perPage} totalPages={response?.last_page ?? 1} showPerPage={false} onChangePage={setPage} />
            )}
        </>
    )
}

const GiftsList = ({ pendingOnly }: { pendingOnly: boolean }) => {
    const { busy, setGiftContacted, setGiftFulfilled } = useSalesActions()

    return (
        <ListShell<PlanGift>
            tab="gifts"
            pendingOnly={pendingOnly}
            empty="Nadie ha pedido regalar Eyplease+ todavía. Cuando una Directora lo pida desde Mi unidad, aparece aquí."
            render={gift => {
                const directora = gift.user?.network_person?.name ?? gift.user?.name ?? 'Clienta'
                const target = gift.kind === 'gift'
                    ? `${gift.person?.name ?? 'una consultora'}${gift.person?.consultant_code ? ` (${gift.person.consultant_code})` : ''}`
                    : `${gift.quantity} consultoras de su unidad`
                const text = gift.kind === 'gift'
                    ? `Hola ${firstName(directora)} 💜 Vimos que quieres regalarle Eyplease+ a ${firstName(gift.person?.name)}. Te ayudo a activarlo: `
                    : `Hola ${firstName(directora)} 💜 Vimos que quieres Eyplease+ para ${gift.quantity} consultoras de tu unidad. Te paso cómo lo activamos: `
                const wa = waLink(gift.user?.phone, text)
                return (
                    <article key={gift.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={CHIP_BRAND}>{gift.kind === 'gift' ? '🎁 Regalo' : '📦 Paquete'}</span>
                                    {gift.fulfilled_at ? <span className={CHIP_OK}>Activado</span> : gift.contacted_at ? <span className={CHIP_OK}>Contactada</span> : <span className={CHIP_WARN}>Sin contactar</span>}
                                    <span className={CHIP_MUTED}>{when(gift.requested_at)}</span>
                                </div>
                                <p className="mt-1.5 text-[15px] font-bold text-foreground"><b>{directora}</b> quiere {gift.kind === 'gift' ? 'regalarle' : ''} <em className="not-italic text-[#4B37C8] dark:text-[#C9BDFF]">{gift.plan?.name ?? 'Eyplease+'}</em> {gift.kind === 'gift' ? 'a' : 'para'} {target}</p>
                                <Who account={gift.user?.network_person?.consultant_code ?? gift.user?.username} plan={gift.user?.plan?.name} phone={gift.user?.phone} email={gift.user?.email} />
                                {gift.contacted_by && <p className="mt-1 text-[12px] text-muted-foreground">La contactó {gift.contacted_by.name}{gift.contacted_at ? ` · ${when(gift.contacted_at)}` : ''}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wa && <a href={wa} target="_blank" rel="noreferrer" className={BTN_WA}>WhatsApp</a>}
                                <button type="button" disabled={busy === gift.id} onClick={() => setGiftContacted(gift, !gift.contacted_at)} className={BTN}>
                                    {gift.contacted_at ? '↺ No contactada' : '✓ Ya la contacté'}
                                </button>
                                {gift.contacted_at && (
                                    <button type="button" disabled={busy === gift.id} onClick={() => setGiftFulfilled(gift, !gift.fulfilled_at)} className={BTN}>
                                        {gift.fulfilled_at ? '↺ No activado' : '🎉 Ya quedó activado'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                )
            }}
        />
    )
}

const InterestsList = ({ pendingOnly }: { pendingOnly: boolean }) => {
    const { busy, setInterestContacted } = useSalesActions()

    return (
        <ListShell<PlanInterest>
            tab="interests"
            pendingOnly={pendingOnly}
            empty="Nadie ha pedido subir de plan en estos días. Los candados que tocan y los planes que miran también caen aquí (con «Sólo pendientes» apagado)."
            render={item => {
                const name = item.user?.network_person?.name ?? item.user?.name ?? 'Clienta'
                const wanted = item.plan?.name ?? 'un plan superior'
                const text = `Hola ${firstName(name)} 💜 Vimos que te interesa el ${wanted} en Eyplease+. Te cuento qué incluye y cómo lo activamos: `
                const wa = waLink(item.user?.phone, text)
                const feature = featureText(item.last_feature)
                return (
                    <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    {item.requested_at ? <span className={CHIP_BRAND}>🔥 Lo pidió</span> : <span className={CHIP_MUTED}>Anduvo mirando</span>}
                                    {item.contacted_at ? <span className={CHIP_OK}>Contactada</span> : item.requested_at ? <span className={CHIP_WARN}>Sin contactar</span> : null}
                                    <span className={CHIP_MUTED}>{when(item.requested_at ?? item.updated_at)}</span>
                                </div>
                                <p className="mt-1.5 text-[15px] font-bold text-foreground"><b>{name}</b> quiere el <em className="not-italic text-[#4B37C8] dark:text-[#C9BDFF]">{wanted}</em>{item.current_plan?.name ? <span className="font-medium text-muted-foreground"> · hoy tiene {item.current_plan.name}</span> : null}</p>
                                <Who account={item.user?.network_person?.consultant_code ?? item.user?.username} phone={item.user?.phone} email={item.user?.email} />
                                <p className="mt-1 text-[12px] text-muted-foreground">
                                    {feature ? <>De qué hablarle: <b className="text-foreground">{feature}</b>{signalsText(item.signals) ? ' · ' : ''}</> : null}
                                    {signalsText(item.signals)}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wa && <a href={wa} target="_blank" rel="noreferrer" className={BTN_WA}>WhatsApp</a>}
                                <button type="button" disabled={busy === item.id} onClick={() => setInterestContacted(item, !item.contacted_at)} className={BTN}>
                                    {item.contacted_at ? '↺ No contactada' : '✓ Ya la contacté'}
                                </button>
                            </div>
                        </div>
                    </article>
                )
            }}
        />
    )
}

const ProspectsList = ({ pendingOnly }: { pendingOnly: boolean }) => (
    <ListShell<DirectorProspect>
        tab="prospects"
        pendingOnly={pendingOnly}
        empty="Ninguna consultora ha invitado a su Directora todavía. Cuando lo haga desde la app, aparece aquí con su correo."
        render={item => {
            const consultora = item.invited_by?.name ?? 'una consultora'
            const textDirectora = `Hola ${firstName(item.director_name)} 💜 ${firstName(consultora)}, de tu unidad, ya usa Eyplease+ y te invitó. Te cuento cómo funciona y cómo crear tu cuenta gratis: `
            const textConsultora = `Hola ${firstName(consultora)} 💜 Vimos que invitaste a tu Directora ${firstName(item.director_name)} a Eyplease+. ¿Te ayudamos a que entre? Recuerda que al hacerlo te regalamos ${item.reward_months} meses.`
            const waDirectora = waLink(item.director_phone, textDirectora)
            const waConsultora = waLink(item.invited_by?.phone, textConsultora)
            return (
                <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                {item.joined_at ? <span className={CHIP_OK}>Ya entró{item.joined_user?.username ? ` · ${item.joined_user.username}` : ''}</span> : <span className={CHIP_WARN}>Invitada, sin entrar</span>}
                                {item.joined_at && (item.rewarded_at ? <span className={CHIP_OK}>Premio dado</span> : <span className={CHIP_WARN}>Premio por dar a mano</span>)}
                                <span className={CHIP_MUTED}>{when(item.created_at)}</span>
                            </div>
                            <p className="mt-1.5 text-[15px] font-bold text-foreground">Directora <b>{item.director_name}</b> <span className="font-medium text-muted-foreground">· la invitó {consultora}{item.invited_by?.username ? ` (${item.invited_by.username})` : ''}</span></p>
                            <Who account={item.director_account} phone={item.director_phone} email={item.director_email} />
                            <p className="mt-1 text-[12px] text-muted-foreground">
                                {item.email_sent_at ? `Correo enviado ${relativeTime(item.email_sent_at)}` : 'Sin correo (invitación vieja)'}
                                {item.times_shared ? ` · liga compartida ${item.times_shared} ${item.times_shared === 1 ? 'vez' : 'veces'}` : ''}
                                {` · premio: ${item.reward_months} meses a la consultora`}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {waDirectora && <a href={waDirectora} target="_blank" rel="noreferrer" className={BTN_WA}>WhatsApp a la Directora</a>}
                            {waConsultora && <a href={waConsultora} target="_blank" rel="noreferrer" className={BTN}>WhatsApp a la consultora</a>}
                        </div>
                    </div>
                </article>
            )
        }}
    />
)

export default SalesPage
