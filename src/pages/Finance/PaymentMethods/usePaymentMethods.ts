import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import {
    PaymentAccount,
    PaymentAccountPayload,
    PaymentAccountType,
    PaymentSettings,
    PaymentSettingsPayload,
} from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"

const ENTITY = "finance-payment-methods"

interface ApiPaymentAccount {
    id: string
    bank: string
    beneficiary: string
    number: string
    number_type: PaymentAccountType
    is_active: boolean
    sort_order: number
}

interface ApiPaymentSettings {
    stripe_enabled: boolean
    transfer_enabled: boolean
    transfer_instructions: string | null
}

interface ApiConfig {
    accounts: ApiPaymentAccount[]
    settings: ApiPaymentSettings
}

const mapAccount = (a: ApiPaymentAccount): PaymentAccount => ({
    id: a.id,
    bank: a.bank,
    beneficiary: a.beneficiary,
    number: a.number,
    numberType: a.number_type,
    isActive: a.is_active,
    sortOrder: a.sort_order,
})

const mapSettings = (s: ApiPaymentSettings): PaymentSettings => ({
    stripeEnabled: s.stripe_enabled,
    transferEnabled: s.transfer_enabled,
    transferInstructions: s.transfer_instructions ?? "",
})

/**
 * Server state for the Métodos de pago tab: the accounts + settings config,
 * plus the create/update/delete and settings mutations that invalidate it.
 */
export const usePaymentMethods = () => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<ApiConfig>(
        API_ROUTES.FINANCE.PAYMENT_METHODS.CONFIG,
        { customQueryKey: queryKeys.list(ENTITY, {}) }
    )

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(ENTITY)],
    })

    const createAccount = (data: PaymentAccountPayload) =>
        request<PaymentAccountPayload, ApiPaymentAccount>("POST", API_ROUTES.FINANCE.PAYMENT_METHODS.ACCOUNTS_CREATE, data)

    const updateAccount = (id: string, data: PaymentAccountPayload) =>
        request<PaymentAccountPayload, ApiPaymentAccount>(
            "PUT",
            replaceRecordIdInPath(API_ROUTES.FINANCE.PAYMENT_METHODS.ACCOUNTS_UPDATE, id),
            data
        )

    const deleteAccount = (id: string) =>
        request<undefined, { message: string }>(
            "DELETE",
            replaceRecordIdInPath(API_ROUTES.FINANCE.PAYMENT_METHODS.ACCOUNTS_DELETE, id)
        )

    const updateSettings = (data: PaymentSettingsPayload) =>
        request<PaymentSettingsPayload, ApiPaymentSettings>("PUT", API_ROUTES.FINANCE.PAYMENT_METHODS.SETTINGS, data)

    const accounts = useMemo(() => (response?.accounts ?? []).map(mapAccount), [response])
    const settings = useMemo(() => (response ? mapSettings(response.settings) : null), [response])

    return {
        accounts,
        settings,
        loading,
        isRefetching,
        error,
        fetchRetry,
        createAccount,
        updateAccount,
        deleteAccount,
        updateSettings,
        mutating: requestState.loading,
    }
}

export default usePaymentMethods
