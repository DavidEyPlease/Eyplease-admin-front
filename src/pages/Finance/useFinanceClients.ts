import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import { PaginationResponse } from "@/interfaces/common"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { FinanceClient, FinanceClientPromotion, MonthlyPayment, PaymentStatus } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"

const CLIENTS_ENTITY = "finance-clients"

interface ApiPayment {
    amount: number | null
    paid?: number | null
    status: PaymentStatus
    paid_at?: string | null
}

interface ApiFinanceClient {
    id: string
    user_id?: string
    name: string
    plan: string | null
    fixed_payment: number | null
    billing_type: "stripe" | "manual"
    app_status: string | null
    payment_day: number | null
    phone: string | null
    balance: number
    promotion: FinanceClientPromotion | null
    payments: Record<string, ApiPayment>
}

type PaginatedClients = PaginationResponse<ApiFinanceClient> & { total_overdue?: number }

const mapClient = (c: ApiFinanceClient): FinanceClient => ({
    id: c.id,
    userId: c.user_id,
    name: c.name,
    plan: c.plan ?? null,
    fixedPayment: c.fixed_payment ?? null,
    billingType: c.billing_type ?? "manual",
    appStatus: c.app_status ?? null,
    paymentDay: c.payment_day ?? null,
    phone: c.phone ?? null,
    balance: c.balance ?? 0,
    promotion: c.promotion ?? null,
    payments: Object.entries(c.payments ?? {}).reduce<Record<string, MonthlyPayment>>((acc, [period, p]) => {
        acc[period] = { amount: p.amount ?? null, paid: p.paid ?? null, status: p.status ?? null }
        return acc
    }, {}),
})

/**
 * Single client detail (by account / consultant_code) with the payment matrix
 * of a year. Disabled while no account is selected. Shares the clients entity
 * key so registering a payment refreshes the open drawer.
 */
export const useFinanceClient = (account: string | null, year: number) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<ApiFinanceClient>(
        replaceRecordIdInPath(API_ROUTES.FINANCE.CLIENT_DETAIL, account ?? ""),
        {
            queryParams: { year },
            customQueryKey: queryKeys.list(CLIENTS_ENTITY, { account, year, detail: true }),
            enabled: !!account,
        }
    )

    const client = useMemo(() => (response ? mapClient(response) : null), [response])

    return { client, loading, isRefetching, error, fetchRetry }
}

export interface UseFinanceClientsPageParams {
    year: number
    page: number
    search?: string
    perPage?: number
    /** Filter by billing source; omit for all. */
    billingType?: "stripe" | "manual"
    /** Inclusive range of overdue months (server-side). */
    overdueMonthsMin?: number
    overdueMonthsMax?: number
    /** Minimum remaining amount to collect (server-side). */
    minOverdue?: number
}

/**
 * Paginated, active-only client list for the Collections tab.
 */
export const useFinanceClientsPage = ({ year, page, search = "", perPage = 15, billingType, overdueMonthsMin, overdueMonthsMax, minOverdue }: UseFinanceClientsPageParams) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<PaginatedClients>(
        API_ROUTES.FINANCE.CLIENTS,
        {
            queryParams: {
                year, page, perPage, search,
                billing_type: billingType,
                overdue_months_min: overdueMonthsMin,
                overdue_months_max: overdueMonthsMax,
                min_overdue: minOverdue,
                only_overdue: 1,
            },
            customQueryKey: queryKeys.list(CLIENTS_ENTITY, { year, page, perPage, search, billingType, overdueMonthsMin, overdueMonthsMax, minOverdue, onlyOverdue: true }),
        }
    )

    const clients = useMemo(() => (response?.items ?? []).map(mapClient), [response])

    return {
        clients,
        page: response?.current_page ?? page,
        totalPages: response?.last_page ?? 1,
        totalItems: response?.total_items ?? 0,
        perPage: response?.per_page ?? perPage,
        // Overdue total across all matching clients, not just this page.
        totalOverdue: response?.total_overdue ?? 0,
        loading,
        isRefetching,
        error,
        fetchRetry,
    }
}

export interface MarkPaymentInput {
    account: string
    period: string
    /** Opcional: si se omite y viene `amount`, el backend registra un abono y deriva el estatus
     *  (paid / partial / overdue) según lo acumulado vs. lo esperado. */
    status?: "paid" | "partial" | "overdue" | "pending"
    /** Monto del pago o abono. */
    amount?: number
    method?: "stripe" | "transfer" | "card" | "cash"
    source?: "manual" | "whatsapp_bot" | "stripe" | "import"
    paid_at?: string
}

/**
 * Register (upsert) a payment and refresh the clients matrix on success.
 */
export const useMarkPayment = () => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(CLIENTS_ENTITY)],
    })

    const markPayment = (input: MarkPaymentInput) =>
        request<MarkPaymentInput, unknown>("POST", API_ROUTES.FINANCE.PAYMENTS.CREATE, input)

    return { markPayment, marking: requestState.loading }
}
