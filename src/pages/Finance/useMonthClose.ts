import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import HttpService from "@/services/http"
import { queryKeys } from "@/utils/queryKeys"

/** Una clienta del cierre de mes (MonthCloseService en la API). */
export interface MonthCloseRow {
    user_id: string
    account: string
    name: string
    email: string | null
    owed: Array<{ period: string, amount: number, status: string | null }>
    total: number
    currency: string
    /** Días desde que venció lo más viejo que debe (null sin día de cobro). */
    days_late: number | null
    next_period: string
    /** Lo que pagaría del mes nuevo al volver. */
    next_amount: number | null
    /** Sólo en las que NO se pausan: por qué. */
    reason?: string
}

export interface MonthClosePreview {
    /** 'YYYY-MM': el mes que se cierra. */
    period: string
    next_period: string
    /** El interruptor de Finanzas: apagado, el día 1 sólo se avisa al equipo. */
    enabled: boolean
    pause: MonthCloseRow[]
    spared: MonthCloseRow[]
}

const MONTH_CLOSE_KEY = queryKeys.generic("finance-month-close")

/**
 * El cierre de mes: quién se pausaría el día 1 y el interruptor para que corra solo. El interruptor vive con los de
 * Métodos de pago (`month_close_enabled`), por eso al cambiarlo se refrescan las dos cosas.
 */
export const useMonthClose = () => {
    const { response, loading } = useFetchQuery<MonthClosePreview>(API_ROUTES.FINANCE.MONTH_CLOSE, {
        customQueryKey: MONTH_CLOSE_KEY,
        staleTime: 60_000,
    })
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [MONTH_CLOSE_KEY, queryKeys.listBase("finance-payment-methods")],
        onError: () => undefined,
    })

    const setEnabled = (enabled: boolean) => request("PUT", API_ROUTES.FINANCE.PAYMENT_METHODS.SETTINGS, { month_close_enabled: enabled })

    /** El correo tal cual le llegaría (HTML), para verlo antes del día 1. */
    const mailFor = (account: string) =>
        HttpService.get<string>(`${API_ROUTES.FINANCE.MONTH_CLOSE_MAIL}?account=${encodeURIComponent(account)}`, { responseType: "text" })

    return { preview: response ?? null, loading, setEnabled, mailFor, saving: requestState.loading }
}
