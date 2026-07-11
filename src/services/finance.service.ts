// Finance service — payment-methods config + Stripe checkout. Clients, summary,
// balance, expenses and payments go through the real API via their react-query
// hooks. Set USE_MOCK to true only for local demos without a backend.
import HttpService from "@/services/http"
import { ApiResponse } from "@/interfaces/common"

export const USE_MOCK = false

export interface TransferAccount {
    bank: string
    beneficiary: string
    /** Número de tarjeta o CLABE. */
    number: string
    numberType: "tarjeta" | "clabe"
}

export interface PaymentMethodsConfig {
    stripe: { enabled: boolean }
    transfer: {
        enabled: boolean
        /** Puede haber varias cuentas de cobro (ej. Banamex + Santander). */
        accounts: TransferAccount[]
        instructions: string
    }
}

export interface CheckoutResult {
    checkout_url: string
    session_id: string
}

// --- Mock data (PLACEHOLDER). Las cuentas de cobro REALES se configuran en el backend
//     (GET /finance/payment-methods); no se ponen aquí porque este repo es público. ---
const MOCK_METHODS: PaymentMethodsConfig = {
    stripe: { enabled: true },
    transfer: {
        enabled: true,
        accounts: [
            { bank: "Banco (demo)", beneficiary: "Titular (demo)", number: "0000 0000 0000 0000", numberType: "tarjeta" },
        ],
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

    async createStripeCheckout(account: string, periods: string[], amount: number, concept?: string): Promise<CheckoutResult> {
        if (USE_MOCK) {
            return delay({
                checkout_url: `https://checkout.stripe.com/c/pay/mock_${account}_${periods[0] ?? ""}`,
                session_id: `cs_mock_${account}`,
            })
        }
        const res = await HttpService.post<ApiResponse<CheckoutResult>>("/finance/payments/checkout", {
            account, periods, amount, concept,
        })
        return res.data
    },
}

export default FinanceService
