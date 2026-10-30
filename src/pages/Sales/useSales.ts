import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { PaginationResponse } from '@/interfaces/common'
import { DirectorProspect, PlanGift, PlanInterest, Referral, SalesDeal, SalesDealMonth, SalesPlan } from '@/interfaces/sales'
import { money, monthName } from '@/pages/Hoy/lib'
import { titleCase } from '@/pages/Clients/List/names'
import { queryKeys } from '@/utils/queryKeys'

import { agoText, dealMessage, featureText, firstName, giftMessage, helloDirector, interestMessage, prospectConsultantMessage, prospectDirectorMessage, signalsText, waLink, waitDays } from './sales.utils'

export type SalesKind = 'gift' | 'interest' | 'prospect' | 'deal' | 'referral'

/**
 * Dónde va cada quien en la fila: esperando respuesta, ya contactada pero sin cerrar, un trato en curso (aceptó y está
 * en su promoción, falta su primer pago completo), tibia, o cerrada.
 */
export type SalesStage = 'waiting' | 'closing' | 'deal' | 'warm' | 'done'

export interface SalesWho {
    name: string
    account: string | null
    phone: string | null
    email: string | null
    /** El plan que tiene HOY (el de la clienta, no el que quiere) */
    plan: string | null
}

interface RowBase {
    key: string
    id: string
    stage: SalesStage
    /** Desde cuándo espera (ISO). Es lo que ordena la fila. */
    since: string
    who: SalesWho
    /** Qué pide, en una línea. `strong` sale con el degradado de la marca. */
    asks: { pre: string, strong: string, post: string }
    /** La línea chica: de qué hablarle, quién la invitó, quién la contactó. */
    note: string
    /** Lo que entra al mes si se cierra (0 = no es dinero directo). */
    monthly: number
    steps: string[]
    /** Cuántos de esos pasos ya están dados. */
    step: number
    wa: Array<{ label: string, href: string }>
    /** El mensaje listo para copiar y pegar en WhatsApp (el mismo que lleva la liga). Sin él no hay botón. */
    message?: string
    /** La etiqueta de arriba a la derecha, cuando no es la de siempre (cuánto espera / el paso) */
    tag?: { text: string, tone: 'plain' | 'warn' | 'bad' | 'ok' }
}

export type SalesRow =
    | (RowBase & { kind: 'gift', gift: PlanGift })
    | (RowBase & { kind: 'interest', interest: PlanInterest })
    | (RowBase & { kind: 'prospect', prospect: DirectorProspect })
    | (RowBase & { kind: 'deal', deal: SalesDeal })
    | (RowBase & { kind: 'referral', referral: Referral })

const priceOf = (plan: SalesPlan | null | undefined) => Number(plan?.price ?? 0) || 0

const personName = (name: string | null | undefined) => titleCase((name ?? '').trim() || 'Clienta')

const withCode = (name: string | null | undefined, code: string | null | undefined) =>
    `${personName(name)}${code ? ` (${code})` : ''}`

/* ── De cada lista a una fila de la misma forma ─────────────────────────────────────────────── */

const giftRow = (gift: PlanGift): SalesRow => {
    const plan = gift.plan?.name ?? 'Eyplease+'
    const isGift = gift.kind === 'gift'
    const message = giftMessage(gift)
    const href = waLink(gift.user?.phone, message)

    return {
        key: `gift:${gift.id}`,
        id: gift.id,
        kind: 'gift',
        gift,
        stage: gift.fulfilled_at ? 'done' : gift.contacted_at ? 'closing' : 'waiting',
        since: gift.requested_at,
        who: {
            name: personName(gift.user?.network_person?.name ?? gift.user?.name),
            account: gift.user?.network_person?.consultant_code ?? gift.user?.username ?? null,
            phone: gift.user?.phone ?? null,
            email: gift.user?.email ?? null,
            plan: gift.user?.plan?.name ?? null,
        },
        asks: isGift
            ? { pre: 'Quiere regalarle el', strong: plan, post: `a ${withCode(gift.person?.name, gift.person?.consultant_code)}` }
            : { pre: 'Quiere el', strong: plan, post: `para ${gift.quantity} consultoras de su unidad` },
        note: gift.contacted_by ? `La contactó ${personName(gift.contacted_by.name)}${gift.contacted_at ? ` · ${agoText(gift.contacted_at)}` : ''}` : '',
        monthly: priceOf(gift.plan) * (isGift ? 1 : Math.max(1, gift.quantity)),
        steps: ['Lo pidió', 'Contactada', 'Activado'],
        step: gift.fulfilled_at ? 3 : gift.contacted_at ? 2 : 1,
        wa: href ? [{ label: 'WhatsApp', href }] : [],
        message,
    }
}

const interestRow = (item: PlanInterest): SalesRow => {
    const plan = item.plan?.name ?? 'el siguiente plan'
    const message = interestMessage(item)
    const href = waLink(item.user?.phone, message)
    const feature = featureText(item.last_feature)
    const signals = signalsText(item.signals)
    /* El precio del plan que quiere menos el que ya paga: eso es lo que sube de verdad */
    const upgrade = priceOf(item.plan) - priceOf(item.current_plan)
    /* Si su plan de hoy ya es el que pedía, ya subió: no es trabajo pendiente aunque nadie la marcara */
    const upgraded = Boolean(item.plan?.id && item.user?.plan_id === item.plan.id)

    return {
        key: `interest:${item.id}`,
        id: item.id,
        kind: 'interest',
        interest: item,
        stage: item.contacted_at || upgraded ? 'done' : item.requested_at ? 'waiting' : 'warm',
        since: item.requested_at ?? item.updated_at,
        who: {
            name: personName(item.user?.network_person?.name ?? item.user?.name),
            account: item.user?.network_person?.consultant_code ?? item.user?.username ?? null,
            phone: item.user?.phone ?? null,
            email: item.user?.email ?? null,
            plan: item.current_plan?.name ?? item.user?.plan?.name ?? null,
        },
        asks: upgraded
            ? { pre: 'Ya subió al', strong: plan, post: '' }
            : item.requested_at
                ? { pre: 'Quiere subir al', strong: plan, post: '' }
                : { pre: 'Anduvo mirando el', strong: plan, post: '' },
        note: [feature && `De qué hablarle: ${feature}`, signals].filter(Boolean).join(' · '),
        monthly: upgrade > 0 ? upgrade : priceOf(item.plan),
        steps: ['Anduvo mirando', 'Lo pidió', upgraded ? 'Ya subió' : 'Contactada'],
        step: item.contacted_at || upgraded ? 3 : item.requested_at ? 2 : 1,
        wa: href ? [{ label: 'WhatsApp', href }] : [],
        message: upgraded ? undefined : message,
    }
}

const prospectRow = (item: DirectorProspect): SalesRow => {
    const consultora = withCode(item.invited_by?.name, item.invited_by?.username)
    const months = `${item.reward_months} ${item.reward_months === 1 ? 'mes' : 'meses'}`
    const message = prospectDirectorMessage(item)
    const toDirector = waLink(item.director_phone, message)
    const toConsultant = waLink(item.invited_by?.phone, prospectConsultantMessage(item))

    return {
        key: `prospect:${item.id}`,
        id: item.id,
        kind: 'prospect',
        prospect: item,
        stage: item.rewarded_at ? 'done' : item.joined_at ? 'closing' : 'waiting',
        since: item.created_at,
        who: {
            name: personName(item.director_name),
            account: item.director_account,
            phone: item.director_phone,
            email: item.director_email,
            plan: null,
        },
        asks: item.joined_at
            ? item.rewarded_at
                ? { pre: 'Entró, y sus', strong: months, post: `de regalo ya se le dieron a ${consultora}` }
                : { pre: 'Ya entró. Falta darle los', strong: months, post: `de regalo a ${consultora}` }
            : { pre: 'La invitó', strong: consultora, post: `· ${months} de regalo para ella si entra con ese correo` },
        note: [
            item.email_sent_at ? 'Ya le llegó el correo de invitación' : 'Sin correo (invitación vieja)',
            item.times_shared > 1 ? `le compartió la liga ${item.times_shared} veces` : '',
            item.joined_user?.username ? `entró como ${item.joined_user.username}` : '',
        ].filter(Boolean).join(' · '),
        monthly: 0,
        steps: ['Invitada', 'Entró', 'Premio dado'],
        step: item.rewarded_at ? 3 : item.joined_at ? 2 : 1,
        wa: [
            ...(toDirector ? [{ label: 'WhatsApp a la Directora', href: toDirector }] : []),
            ...(toConsultant ? [{ label: 'A la consultora', href: toConsultant }] : []),
        ],
        message: item.rewarded_at ? undefined : message,
    }
}

const DEAL_TEXT: Record<SalesDeal['kind'], { tag: string, steps: string[] }> = {
    win_back: { tag: 'Regresó', steps: ['Regresó', 'Mes gratis', 'Primer pago'] },
    plan_trial: { tag: 'Subió de plan', steps: ['Aceptó', 'Mes de prueba', 'Paga completo'] },
    promotion: { tag: 'Promoción', steps: ['Aceptó', 'Promoción', 'Paga completo'] },
}

const shortMonth = (period: string) => monthName(period).slice(0, 3)

/** «oct gratis · nov $349 · dic $659» — y si ya lo pagó, lo dice. */
const monthText = (month: SalesDealMonth) =>
    `${shortMonth(month.period)} ${month.amount > 0 ? money(month.amount) : 'gratis'}${month.status === 'paid' ? ' (pagado)' : ''}`

/** «8 nov» */
const dayText = (iso: string) => {
    const [, m, d] = iso.split('-')
    return `${Number(d)} ${shortMonth(`2000-${m}`)}`
}

const dealRow = (deal: SalesDeal): SalesRow => {
    const text = DEAL_TEXT[deal.kind] ?? DEAL_TEXT.promotion
    const plan = deal.plan?.name ?? 'su plan'
    const until = deal.promo_until ? monthName(deal.promo_until.slice(0, 7)) : ''
    const free = deal.promotion.split('·')[1]?.trim()
    const href = waLink(deal.user.phone, dealMessage(deal))
    const promoOn = Boolean(deal.promo_until && deal.promo_until >= new Date().toISOString().slice(0, 10))
    const lost = deal.stage === 'lost'

    return {
        key: `deal:${deal.id}`,
        id: deal.id,
        kind: 'deal',
        deal,
        stage: deal.stage === 'done' ? 'done' : 'deal',
        since: deal.started_at ?? new Date().toISOString(),
        who: {
            name: personName(deal.user.network_person?.name ?? deal.user.name),
            account: deal.user.network_person?.consultant_code ?? deal.user.username,
            phone: deal.user.phone,
            email: deal.user.email,
            plan,
        },
        asks: deal.kind === 'win_back'
            ? { pre: 'Regresó al', strong: plan, post: free ? `con ${free}` : '' }
            : deal.kind === 'plan_trial'
                ? { pre: 'Subió al', strong: plan, post: deal.previous_plan ? `y paga lo del ${deal.previous_plan.replace(/^Plan /, '')}${until ? ` hasta ${until}` : ''}` : '' }
                : { pre: 'Con la promoción', strong: deal.promotion, post: '' },
        note: lost ? 'Se volvió a dar de baja antes de pagar su primer mes completo' : deal.months.map(monthText).join(' · '),
        monthly: deal.monthly,
        steps: text.steps,
        step: deal.stage === 'done' ? 3 : promoOn ? 2 : 3,
        wa: href ? [{ label: 'WhatsApp', href }] : [],
        tag: lost
            ? { text: 'Se dio de baja', tone: 'bad' }
            : deal.stage === 'done'
                ? { text: `Pagó ${shortMonth(deal.first_full.period)} completo`, tone: 'ok' }
                : deal.next_due
                    ? { text: `Paga ${money(deal.next_due.amount)} el ${dayText(deal.next_due.due_on)}`, tone: 'plain' }
                    : { text: text.tag, tone: 'ok' },
    }
}

/**
 * Una recomendación, según dónde va: anotada (tibia), ya entró y falta que pague (por cerrar: es una venta), pagó y el
 * premio no se pudo dar solo (te espera), premio corriendo (trato en curso: pregúntale si se queda) o terminada.
 */
const referralRow = (item: Referral): SalesRow => {
    const newName = personName(item.referred?.name ?? item.referred_name ?? 'Directora recomendada')
    const rewardOn = Boolean(item.reward_applied_at && !item.reward_reverted_at)
    const stage: SalesStage = item.reward_reverted_at || item.reward_kept_at
        ? 'done'
        : rewardOn ? 'deal'
            : item.first_paid_at ? 'waiting'
                : item.joined_at ? 'closing' : 'warm'
    const until = item.reward_until ? dayText(item.reward_until) : ''
    const referrerName = item.referrer?.network_person?.name ?? item.referrer?.name
    /* A quién le toca escribir: a la nueva mientras no paga (que entre y que pague); a quien recomendó cuando gana su premio */
    const toNewText = item.joined_at
        ? `${helloDirector(newName)} Le doy la bienvenida a Eyplease+. ¿Le ayudo a dejar lista su unidad para este mes?`
        : `${helloDirector(newName)} ${firstName(referrerName) || 'Una Directora'} me contó que le gustaría conocer Eyplease+. ¿Le enseño cómo funciona? Puede empezar con un mes gratis.`
    const thanks = `${helloDirector(referrerName)} ¡Gracias por recomendarnos a ${firstName(newName)}!`
    const descuento = item.reward_discount ? `$${Math.round(Number(item.reward_discount)).toLocaleString('es-MX')}` : null
    const toReferrerText = item.reward_applied_at
        ? (descuento
            ? `${thanks} Ya tiene ${descuento} de descuento en su siguiente pago.`
            : `${thanks} Ya tiene de regalo el ${item.reward_plan?.name ?? 'plan siguiente'} hasta el ${until}. Si le gusta, se puede quedar con él.`)
        : `${thanks} Ya le estamos preparando su premio.`
    const toNew = waLink(item.referred?.phone ?? item.referred_phone, toNewText)
    const toReferrer = waLink(item.referrer?.phone, toReferrerText)

    return {
        key: `referral:${item.id}`,
        id: item.id,
        kind: 'referral',
        referral: item,
        stage,
        since: item.first_paid_at ?? item.joined_at ?? item.registered_at,
        who: {
            name: personName(item.referrer?.network_person?.name ?? item.referrer?.name),
            account: item.referrer?.network_person?.consultant_code ?? item.referrer?.username ?? null,
            phone: item.referrer?.phone ?? null,
            email: item.referrer?.email ?? null,
            plan: item.referrer?.plan?.name ?? null,
        },
        asks: item.reward_kept_at
            ? { pre: 'Recomendó a', strong: newName, post: `y se quedó con el ${item.reward_plan?.name ?? 'plan del premio'}` }
            : rewardOn
                ? (descuento
                    ? { pre: 'Tiene de premio', strong: `${descuento} de descuento`, post: `por invitar a ${newName}` }
                    : { pre: 'Tiene de premio el', strong: item.reward_plan?.name ?? 'plan siguiente', post: `por recomendar a ${newName}` })
                : { pre: 'Recomendó a', strong: newName, post: item.joined_at ? '' : '· todavía no entra' },
        note: [
            item.source === 'link' ? 'Entró con su liga'
                : item.source === 'area' ? 'La invitó desde «Mis Directoras» (primer mes del Ejecutivo de regalo)'
                    : `La anotó ${item.created_by?.name ? personName(item.created_by.name) : 'el equipo'}`,
            item.referred?.username ? `cuenta ${item.referred.username}` : item.referred_email ?? '',
            item.joined_at && !item.first_paid_at ? 'falta que pague su primer mes: ahí se gana el premio' : '',
            item.reward_note ?? '',
        ].filter(Boolean).join(' · '),
        monthly: 0,
        steps: ['Recomendada', 'Entró', 'Pagó', 'Premio'],
        step: rewardOn || stage === 'done' ? 4 : item.first_paid_at ? 3 : item.joined_at ? 2 : 1,
        wa: [
            ...(toReferrer ? [{ label: 'WhatsApp a quien recomendó', href: toReferrer }] : []),
            ...(toNew && !item.first_paid_at ? [{ label: 'A la nueva', href: toNew }] : []),
        ],
        message: stage === 'done' ? undefined : item.first_paid_at ? toReferrerText : toNewText,
        tag: rewardOn && !item.reward_kept_at
            ? { text: `Premio hasta el ${until}`, tone: 'plain' }
            : stage === 'waiting' ? { text: 'Premio por dar', tone: 'bad' } : undefined,
    }
}

/* ── Las tres listas, en una sola fila de trabajo ───────────────────────────────────────────── */

const STAGE_ORDER: Record<SalesStage, number> = { waiting: 0, closing: 1, deal: 2, warm: 3, done: 4 }

/* Estas tres listas de la API llegan con el paginador de Laravel tal cual ({ data, total }), no con el
   formato del resto del panel ({ items, total_items }). Se leen las dos formas: sin esto la pantalla
   decía «Nadie en la fila» aunque había pedidos de regalo y de cambio de plan esperando. */
type AnyPage<T> = { items?: T[], data?: T[], total_items?: number, total?: number } | null | undefined
const itemsOf = <T,>(page: AnyPage<T>): T[] => page?.items ?? page?.data ?? []
const totalOf = (page: AnyPage<unknown>): number => page?.total_items ?? page?.total ?? 0

const useSalesQuery = <T,>(kind: SalesKind, url: string, days: number | undefined, perPage: number) => {
    const queryParams = useMemo(() => ({ perPage, ...(days ? { days } : {}) }), [perPage, days])

    return useFetchQuery<PaginationResponse<T>>(url, {
        queryParams,
        customQueryKey: queryKeys.list(`sales/${kind}`, queryParams),
        staleTime: 60 * 1000,
    })
}

/**
 * Las tres listas de Ventas traídas de una vez y vueltas filas de la misma forma. La API ya las
 * manda con lo pendiente primero, así que las primeras `perPage` siempre traen lo que urge; el
 * resto se pide con «Ver más». Ordenar, contar y filtrar se hace aquí, sobre lo ya traído.
 */
export const useSalesQueue = () => {
    const [perPage, setPerPage] = useState(100)
    const gifts = useSalesQuery<PlanGift>('gift', API_ROUTES.SALES.PLAN_GIFTS, 60, perPage)
    const interests = useSalesQuery<PlanInterest>('interest', API_ROUTES.SALES.PLAN_INTERESTS, 60, perPage)
    const prospects = useSalesQuery<DirectorProspect>('prospect', API_ROUTES.SALES.DIRECTOR_PROSPECTS, undefined, perPage)
    const deals = useSalesQuery<SalesDeal>('deal', API_ROUTES.SALES.DEALS, 60, perPage)
    const referrals = useSalesQuery<Referral>('referral', API_ROUTES.SALES.REFERRALS, undefined, perPage)

    const rows = useMemo(() => {
        const all = [
            ...itemsOf<PlanGift>(gifts.response as AnyPage<PlanGift>).map(giftRow),
            ...itemsOf<PlanInterest>(interests.response as AnyPage<PlanInterest>).map(interestRow),
            ...itemsOf<DirectorProspect>(prospects.response as AnyPage<DirectorProspect>).map(prospectRow),
            ...itemsOf<SalesDeal>(deals.response as AnyPage<SalesDeal>).map(dealRow),
            ...itemsOf<Referral>(referrals.response as AnyPage<Referral>).map(referralRow),
        ]
        /* Primero lo que espera respuesta y, dentro, quien lleva más tiempo esperando: lo tibio y lo
           cerrado se leen al revés, lo más nuevo arriba. */
        return all.sort((a, b) => {
            const stage = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]
            if (stage) return stage
            const wait = waitDays(b.since) - waitDays(a.since)
            /* Los tratos, por el que paga primero */
            if (a.kind === 'deal' && b.kind === 'deal' && a.stage === 'deal') {
                return (a.deal.next_due?.due_on ?? '9999').localeCompare(b.deal.next_due?.due_on ?? '9999')
            }
            return a.stage === 'waiting' || a.stage === 'closing' ? wait : -wait
        })
    }, [gifts.response, interests.response, prospects.response, deals.response, referrals.response])

    /* Lo que la API dice que hay en total, aunque no lo hayamos traído */
    const total = totalOf(gifts.response as AnyPage<unknown>) + totalOf(interests.response as AnyPage<unknown>)
        + totalOf(prospects.response as AnyPage<unknown>) + totalOf(deals.response as AnyPage<unknown>) + totalOf(referrals.response as AnyPage<unknown>)

    return {
        rows,
        total,
        missing: Math.max(0, total - rows.length),
        loadMore: () => setPerPage(value => value + 200),
        loading: gifts.loading || interests.loading || prospects.loading || deals.loading || referrals.loading,
        loadingMore: gifts.isRefetching || interests.isRefetching || prospects.isRefetching || deals.isRefetching || referrals.isRefetching,
    }
}

/* ── Las dos marcas que el equipo pone a mano ───────────────────────────────────────────────── */

/** HttpService lanza el JSON de la API, no un Error: el mensaje útil viene en `.message`. */
const showServerError = (error: unknown) => {
    const message = (error as { message?: string })?.message
    toast.error(message || 'No se pudo guardar. Intenta de nuevo.')
}

export const useSalesActions = () => {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery({ onError: showServerError })
    const [busy, setBusy] = useState<string | null>(null)

    const run = async (kind: SalesKind, id: string, url: string, body: Record<string, boolean>, method: 'PATCH' | 'POST' = 'PATCH') => {
        setBusy(id)
        try {
            await request(method, url.replace('{id}', id), body)
            await queryClient.invalidateQueries({ queryKey: queryKeys.listBase(`sales/${kind}`) })
        } finally {
            setBusy(null)
        }
    }

    /* Con «Sólo pendientes» encendido, marcar saca la fila de la pantalla: el Deshacer la regresa */
    const undoable = (message: string, undo: () => void) => toast.success(message, { action: { label: 'Deshacer', onClick: undo } })

    const setGiftContacted = async (row: SalesRow & { kind: 'gift' }, contacted: boolean) => {
        await run('gift', row.id, API_ROUTES.SALES.PLAN_GIFT_CONTACTED, { contacted })
        undoable(
            contacted ? `Ya contactaste a ${firstName(row.who.name)}` : `${firstName(row.who.name)} vuelve a la fila`,
            () => setGiftContacted(row, !contacted),
        )
    }

    const setGiftFulfilled = async (row: SalesRow & { kind: 'gift' }, fulfilled: boolean) => {
        await run('gift', row.id, API_ROUTES.SALES.PLAN_GIFT_FULFILLED, { fulfilled })
        undoable(
            fulfilled ? `El regalo de ${firstName(row.who.name)} quedó activado` : 'El regalo vuelve a estar por activar',
            () => setGiftFulfilled(row, !fulfilled),
        )
    }

    const setInterestContacted = async (row: SalesRow & { kind: 'interest' }, contacted: boolean) => {
        await run('interest', row.id, API_ROUTES.SALES.PLAN_INTEREST_CONTACTED, { contacted })
        undoable(
            contacted ? `Ya contactaste a ${firstName(row.who.name)}` : `${firstName(row.who.name)} vuelve a la fila`,
            () => setInterestContacted(row, !contacted),
        )
    }

    /* «Quitar»: no era venta (ya subió, lo tocó por curiosidad). No se borra; el Deshacer lo regresa */
    const setGiftDismissed = async (row: SalesRow & { kind: 'gift' }, dismissed: boolean) => {
        await run('gift', row.id, API_ROUTES.SALES.PLAN_GIFT_DISMISSED, { dismissed })
        undoable(
            dismissed ? `Quitaste a ${firstName(row.who.name)} de la fila` : `${firstName(row.who.name)} vuelve a la fila`,
            () => setGiftDismissed(row, !dismissed),
        )
    }

    const setInterestDismissed = async (row: SalesRow & { kind: 'interest' }, dismissed: boolean) => {
        await run('interest', row.id, API_ROUTES.SALES.PLAN_INTEREST_DISMISSED, { dismissed })
        undoable(
            dismissed ? `Quitaste a ${firstName(row.who.name)} de la fila` : `${firstName(row.who.name)} vuelve a la fila`,
            () => setInterestDismissed(row, !dismissed),
        )
    }

    /* Recomendaciones: dar el premio cuando no se pudo solo, y si se queda con el plan del premio */
    const giveReward = async (row: SalesRow & { kind: 'referral' }) => {
        await run('referral', row.id, API_ROUTES.SALES.REFERRAL_REWARD, {}, 'POST')
        toast.success(`Premio revisado para ${firstName(row.who.name)}: si no se pudo dar solo, la razón queda en la tarjeta`)
    }

    const setReferralKeep = async (row: SalesRow & { kind: 'referral' }, keep: boolean) => {
        await run('referral', row.id, API_ROUTES.SALES.REFERRAL_KEEP, { keep })
        undoable(
            keep ? `${firstName(row.who.name)} se queda con el plan: al terminar su mes paga el completo` : `${firstName(row.who.name)} regresa a su plan al terminar el premio`,
            () => setReferralKeep(row, !keep),
        )
    }

    return { busy, setGiftContacted, setGiftFulfilled, setInterestContacted, setGiftDismissed, setInterestDismissed, giveReward, setReferralKeep }
}

/** Lo que la pantalla le pasa a cada fila para que pueda marcar sin volver a montar la mutación. */
export type SalesActions = ReturnType<typeof useSalesActions>

export type { DirectorProspect, PlanGift, PlanInterest, Referral, SalesDeal }
