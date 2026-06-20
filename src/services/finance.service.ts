// Finance service — mock layer for the endpoints not built yet (payment-methods
// config + Stripe checkout). Clients, summary, balance, expenses and payments
// already go through the real API via their react-query hooks.
import HttpService from "@/services/http"
import { ApiResponse } from "@/interfaces/common"

export const USE_MOCK = true

export interface PaymentMethodsConfig {
    stripe: { enabled: boolean }
    transfer: {
        enabled: boolean
        bank: string
        beneficiary: string
        clabe: string
        account: string
        instructions: string
    }
}

export interface CheckoutResult {
    checkout_url: string
    session_id: string
}

// --- Mock data (placeholder; the backend replaces it with real config) ---
const MOCK_METHODS: PaymentMethodsConfig = {
    stripe: { enabled: true },
    transfer: {
        enabled: true,
        bank: "BBVA",
        beneficiary: "Eyplease+ S.A. de C.V.",
        clabe: "012 180 0000 0000 0000", // DEMO — replace with the real CLABE
        account: "0000000000",
        instructions: "Envía tu comprobante por WhatsApp para confirmar tu pago.",
    },
}

const delay = <T,>(value: T, ms = 350): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms))

export const FinanceService = {
    async getPaymentMethods(): Promise<PaymentMethodsConfig> {
        if (USE_MOCK) return delay(MOCK_METHODS)
        const res = await HttpService.get<ApiResponse<PaymentMethodsConfig>>("/finance/payment-methods")
        return res.data
    },

    async createStripeCheckout(account: string, period: string, amount: number, concept?: string): Promise<CheckoutResult> {
        if (USE_MOCK) {
            return delay({
                checkout_url: `https://checkout.stripe.com/c/pay/mock_${account}_${period}`,
                session_id: `cs_mock_${account}`,
            })
        }
        const res = await HttpService.post<ApiResponse<CheckoutResult>>("/finance/payments/checkout", {
            account, period, amount, concept,
        })
        return res.data
    },
}

export default FinanceService
