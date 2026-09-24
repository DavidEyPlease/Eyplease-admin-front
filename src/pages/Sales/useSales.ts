import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { PaginationResponse } from '@/interfaces/common'
import { DirectorProspect, PlanGift, PlanInterest, SalesPlan } from '@/interfaces/sales'
import { titleCase } from '@/pages/Clients/List/names'
import { queryKeys } from '@/utils/queryKeys'

import { agoText, featureText, firstName, giftMessage, interestMessage, prospectConsultantMessage, prospectDirectorMessage, signalsText, waLink, waitDays } from './sales.utils'

export type SalesKind = 'gift' | 'interest' | 'prospect'

/** Dónde va cada quien en la fila: esperando respuesta, ya contactada pero sin cerrar, tibia, o cerrada. */
export type SalesStage = 'waiting' | 'closing' | 'warm' | 'done'

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
}

export type SalesRow =
    | (RowBase & { kind: 'gift', gift: PlanGift })
    | (RowBase & { kind: 'interest', interest: PlanInterest })
    | (RowBase & { kind: 'prospect', prospect: DirectorProspect })

const priceOf = (plan: SalesPlan | null | undefined) => Number(plan?.price ?? 0) || 0

const personName = (name: string | null | undefined) => titleCase((name ?? '').trim() || 'Clienta')

const withCode = (name: string | null | undefined, code: string | null | undefined) =>
    `${personName(name)}${code ? ` (${code})` : ''}`

/* ── De cada lista a una fila de la misma forma ─────────────────────────────────────────────── */

const giftRow = (gift: PlanGift): SalesRow => {
    const plan = gift.plan?.name ?? 'Eyplease+'
    const isGift = gift.kind === 'gift'
    const href = waLink(gift.user?.phone, giftMessage(gift))

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
    }
}

const interestRow = (item: PlanInterest): SalesRow => {
    const plan = item.plan?.name ?? 'el siguiente plan'
    const href = waLink(item.user?.phone, interestMessage(item))
    const feature = featureText(item.last_feature)
    const signals = signalsText(item.signals)
    /* El precio del plan que quiere menos el que ya paga: eso es lo que sube de verdad */
    const upgrade = priceOf(item.plan) - priceOf(item.current_plan)

    return {
        key: `interest:${item.id}`,
        id: item.id,
        kind: 'interest',
        interest: item,
        stage: item.contacted_at ? 'done' : item.requested_at ? 'waiting' : 'warm',
        since: item.requested_at ?? item.updated_at,
        who: {
            name: personName(item.user?.network_person?.name ?? item.user?.name),
            account: item.user?.network_person?.consultant_code ?? item.user?.username ?? null,
            phone: item.user?.phone ?? null,
            email: item.user?.email ?? null,
            plan: item.current_plan?.name ?? item.user?.plan?.name ?? null,
        },
        asks: item.requested_at
            ? { pre: 'Quiere subir al', strong: plan, post: '' }
            : { pre: 'Anduvo mirando el', strong: plan, post: '' },
        note: [feature && `De qué hablarle: ${feature}`, signals].filter(Boolean).join(' · '),
        monthly: upgrade > 0 ? upgrade : priceOf(item.plan),
        steps: ['Anduvo mirando', 'Lo pidió', 'Contactada'],
        step: item.contacted_at ? 3 : item.requested_at ? 2 : 1,
        wa: href ? [{ label: 'WhatsApp', href }] : [],
    }
}

const prospectRow = (item: DirectorProspect): SalesRow => {
    const consultora = withCode(item.invited_by?.name, item.invited_by?.username)
    const months = `${item.reward_months} ${item.reward_months === 1 ? 'mes' : 'meses'}`
    const toDirector = waLink(item.director_phone, prospectDirectorMessage(item))
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
    }
}

/* ── Las tres listas, en una sola fila de trabajo ───────────────────────────────────────────── */

const STAGE_ORDER: Record<SalesStage, number> = { waiting: 0, closing: 1, warm: 2, done: 3 }

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

    const rows = useMemo(() => {
        const all = [
            ...(gifts.response?.items ?? []).map(giftRow),
            ...(interests.response?.items ?? []).map(interestRow),
            ...(prospects.response?.items ?? []).map(prospectRow),
        ]
        /* Primero lo que espera respuesta y, dentro, quien lleva más tiempo esperando: lo tibio y lo
           cerrado se leen al revés, lo más nuevo arriba. */
        return all.sort((a, b) => {
            const stage = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]
            if (stage) return stage
            const wait = waitDays(b.since) - waitDays(a.since)
            return a.stage === 'waiting' || a.stage === 'closing' ? wait : -wait
        })
    }, [gifts.response, interests.response, prospects.response])

    /* Lo que la API dice que hay en total, aunque no lo hayamos traído */
    const total = (gifts.response?.total_items ?? 0) + (interests.response?.total_items ?? 0) + (prospects.response?.total_items ?? 0)

    return {
        rows,
        total,
        missing: Math.max(0, total - rows.length),
        loadMore: () => setPerPage(value => value + 200),
        loading: gifts.loading || interests.loading || prospects.loading,
        loadingMore: gifts.isRefetching || interests.isRefetching || prospects.isRefetching,
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

    const run = async (kind: SalesKind, id: string, url: string, body: Record<string, boolean>) => {
        setBusy(id)
        try {
            await request('PATCH', url.replace('{id}', id), body)
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

    return { busy, setGiftContacted, setGiftFulfilled, setInterestContacted }
}

/** Lo que la pantalla le pasa a cada fila para que pueda marcar sin volver a montar la mutación. */
export type SalesActions = ReturnType<typeof useSalesActions>

export type { DirectorProspect, PlanGift, PlanInterest }
