import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import { PaginationResponse } from "@/interfaces/common"
import useFetchQuery from "@/hooks/useFetchQuery"
import { PaymentMethod, PaymentRecord, PaymentSource, PaymentStatus } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"

const PAYMENTS_ENTITY = "finance-payments"

/** Paginated envelope + filter-wide aggregate totals (computed server-side). */
type PaymentsPageResponse = PaginationResponse<ApiPaymentRecord> & {
    total_amount?: number
    total_collected?: number
}

interface ApiPaymentRecord {
    id: string
    user_id: string
    account: string | null
    client_name: string | null
    period: string
    amount: number
    currency: string
    status: PaymentStatus
    method: PaymentMethod | null
    source: PaymentSource | null
    paid_at: string | null
    receipt_url: string | null
    note: string | null
    created_at: string | null
}

const mapPayment = (p: ApiPaymentRecord): PaymentRecord => ({
    id: p.id,
    userId: p.user_id,
    account: p.account ?? null,
    clientName: p.client_name ?? null,
    period: p.period,
    amount: p.amount ?? 0,
    currency: p.currency ?? "MXN",
    status: p.status ?? null,
    method: p.method ?? null,
    source: p.source ?? null,
    paidAt: p.paid_at ?? null,
    receiptUrl: p.receipt_url ?? null,
    note: p.note ?? null,
    createdAt: p.created_at ?? null,
})

export interface UseFinancePaymentsPageParams {
    year: number
    page: number
    /** Null = the whole year. */
    month?: number | null
    status?: string
    source?: string
    search?: string
    perPage?: number
}

/**
 * Paginated payment ledger for a year, filterable by month, status, source and
 * client search. Empty filters are dropped by useFetchQuery, so the backend
 * only sees the active ones.
 */
export const useFinancePaymentsPage = ({
    year,
    page,
    month = null,
    status = "",
    source = "",
    search = "",
    perPage = 15,
}: UseFinancePaymentsPageParams) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<PaymentsPageResponse>(
        API_ROUTES.FINANCE.PAYMENTS.LIST,
        {
            queryParams: { year, page, perPage, month, status, source, search },
            customQueryKey: queryKeys.list(PAYMENTS_ENTITY, { year, page, perPage, month, status, source, search }),
        }
    )

    const payments = useMemo(() => (response?.items ?? []).map(mapPayment), [response])

    return {
        payments,
        page: response?.current_page ?? page,
        totalPages: response?.last_page ?? 1,
        totalItems: response?.total_items ?? 0,
        perPage: response?.per_page ?? perPage,
        // Filter-wide totals across all pages (not just the current page).
        totalAmount: response?.total_amount ?? 0,
        totalCollected: response?.total_collected ?? 0,
        loading,
        isRefetching,
        error,
        fetchRetry,
    }
}

export default useFinancePaymentsPage
