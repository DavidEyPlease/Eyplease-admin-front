import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { replaceRecordIdInPath } from "@/utils"
import { queryKeys } from "@/utils/queryKeys"

/** Un cobro con tarjeta que Stripe no pudo hacer, con el porqué (CardChargeIssueService en la API). */
export interface CardIssue {
    id: string
    client: {
        user_id: string
        name: string | null
        account: string | null
        phone: string | null
        country: string | null
        plan: string | null
    }
    /** 'YYYY-MM' */
    period: string | null
    amount: number
    currency: string
    reason_code: string
    /** En palabras: «Su tarjeta está vencida», «Stripe le manda la factura por correo…» */
    reason: string
    /** open = emitida y sin pagar · draft = Stripe ni la emitió */
    invoice_status: string | null
    attempts: number
    /** Página de pago de Stripe de ESA factura (las emitidas). */
    payment_url: string | null
    /** Cómo tiene la plataforma ese mes: si dice «paid» y Stripe no, hay que cuadrarlo. */
    platform_status: string | null
    detected_at: string | null
}

const CARD_ISSUES_KEY = queryKeys.generic("finance-card-issues")

export const useCardIssues = () => {
    const { response, loading } = useFetchQuery<CardIssue[]>(API_ROUTES.FINANCE.CARD_ISSUES, {
        customQueryKey: CARD_ISSUES_KEY,
        staleTime: 60_000,
    })
    /* Cada botón dice su propio error (p. ej. «activa el Portal de clientes en Stripe»): sin el aviso genérico encima */
    const { request, requestState } = useRequestQuery({ invalidateQueries: [CARD_ISSUES_KEY], onError: () => undefined })

    const scan = () => request("POST", API_ROUTES.FINANCE.CARD_ISSUES_SCAN)
    const cardLink = (id: string) => request<unknown, { url: string }>("POST", replaceRecordIdInPath(API_ROUTES.FINANCE.CARD_ISSUE_LINK, id))

    return { issues: Array.isArray(response) ? response : [], loading, scan, cardLink, working: requestState.loading }
}
