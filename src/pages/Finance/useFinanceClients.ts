import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import { PaginationResponse } from "@/interfaces/common"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { CollectionStatus, FinanceClient, FinanceClientPromotion, MonthlyPayment, PaymentStatus, ReceiptDecision } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"
import { PAYMENTS_ENTITY } from "./useFinancePayments"

const CLIENTS_ENTITY = "finance-clients"

const DEFAULT_COLLECTION_STATUS: CollectionStatus = "collectable"

interface ApiPayment {
    amount: number | null
    paid?: number | null
    status: PaymentStatus
    paid_at?: string | null
    receipt_url?: string | null
    reference_number?: string | null
    receipt_uploaded_at?: string | null
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
    next_charge_date: string | null
    next_charge_amount: number | null
    promised_until?: string | null
    payments: Record<string, ApiPayment>
}

type PaginatedClients = PaginationResponse<ApiFinanceClient> & {
    total_overdue?: number
    total_pending?: number
    total_in_review?: number
}

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
    nextChargeDate: c.next_charge_date ?? null,
    nextChargeAmount: c.next_charge_amount ?? null,
    promisedUntil: c.promised_until ?? null,
    payments: Object.entries(c.payments ?? {}).reduce<Record<string, MonthlyPayment>>((acc, [period, p]) => {
        acc[period] = {
            amount: p.amount ?? null,
            paid: p.paid ?? null,
            status: p.status ?? null,
            paidAt: p.paid_at ?? null,
            receiptUrl: p.receipt_url ?? null,
            referenceNumber: p.reference_number ?? null,
            receiptUploadedAt: p.receipt_uploaded_at ?? null,
        }
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
    /** Filter by exact payment day (day of month 1-31, server-side). */
    paymentDay?: number
    /** Which payment states the client must have in the year (default: anything unpaid). */
    collectionStatus?: CollectionStatus
    /** Bajas con adeudo: las cuentas DESACTIVADAS en vez de las activas. */
    inactive?: boolean
}

/**
 * Paginated client list for the Collections tab: the active ones, or the
 * deactivated ones with debt (`inactive`).
 */
export const useFinanceClientsPage = ({ year, page, search = "", perPage = 15, billingType, overdueMonthsMin, overdueMonthsMax, minOverdue, paymentDay, collectionStatus = DEFAULT_COLLECTION_STATUS, inactive = false }: UseFinanceClientsPageParams) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<PaginatedClients>(
        API_ROUTES.FINANCE.CLIENTS,
        {
            queryParams: {
                year, page, perPage, search,
                billing_type: billingType,
                overdue_months_min: overdueMonthsMin,
                overdue_months_max: overdueMonthsMax,
                min_overdue: minOverdue,
                payment_day: paymentDay,
                collection_status: collectionStatus,
                inactive: inactive ? 1 : undefined,
            },
            customQueryKey: queryKeys.list(CLIENTS_ENTITY, { year, page, perPage, search, billingType, overdueMonthsMin, overdueMonthsMax, minOverdue, paymentDay, collectionStatus, inactive }),
        }
    )

    const clients = useMemo(() => (response?.items ?? []).map(mapClient), [response])

    return {
        clients,
        page: response?.current_page ?? page,
        totalPages: response?.last_page ?? 1,
        totalItems: response?.total_items ?? 0,
        perPage: response?.per_page ?? perPage,
        // Totals across all matching clients (not just this page), split by state.
        totalOverdue: response?.total_overdue ?? 0,
        totalPending: response?.total_pending ?? 0,
        totalInReview: response?.total_in_review ?? 0,
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
 * Register (upsert) a payment and refresh the clients matrix and the ledger.
 */
export const useMarkPayment = () => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(CLIENTS_ENTITY), queryKeys.listBase(PAYMENTS_ENTITY)],
    })

    const markPayment = (input: MarkPaymentInput) =>
        request<MarkPaymentInput, unknown>("POST", API_ROUTES.FINANCE.PAYMENTS.CREATE, input)

    return { markPayment, marking: requestState.loading }
}

/**
 * Promesa de pago de una clienta: `promisedUntil` 'YYYY-MM-DD', o null para quitarla.
 * Refresca la ficha y la lista de cobranza.
 */
export const usePaymentPromise = () => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(CLIENTS_ENTITY)],
    })

    const setPromise = (account: string, promisedUntil: string | null) =>
        request<{ promised_until: string | null }, unknown>(
            "PUT",
            replaceRecordIdInPath(API_ROUTES.FINANCE.CLIENT_PROMISE, account),
            { promised_until: promisedUntil },
        )

    return { setPromise, saving: requestState.loading }
}

export interface ReviewReceiptInput {
    account: string
    period: string
    decision: ReceiptDecision
    note?: string
}

/**
 * Approve (paid) or reject (back to pending/overdue) a receipt the client
 * uploaded; refreshes the clients matrix and the ledger.
 */
export const useReviewReceipt = () => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(CLIENTS_ENTITY), queryKeys.listBase(PAYMENTS_ENTITY)],
    })

    const reviewReceipt = (input: ReviewReceiptInput) =>
        request<ReviewReceiptInput, unknown>("POST", API_ROUTES.FINANCE.PAYMENTS.REVIEW, input)

    return { reviewReceipt, reviewing: requestState.loading }
}
