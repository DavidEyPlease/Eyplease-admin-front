// Servicio de Finanzas — capa de datos del panel.
//
// Está en MODO MOCK: devuelve datos simulados sin tocar el backend, para poder
// desarrollar y probar la UI mientras Alejandro construye los endpoints (ver
// src/pages/Finanzas/API_CONTRACT.md). Cuando el backend esté listo:
//   1. Cambiar USE_MOCK a false.
//   2. Verificar que las rutas/campos coincidan con el contrato.
//   3. En el panel, llamar getClients/getSummary/getExpenses y hidratar el store.
//
import HttpService from "@/services/http"
import { ApiResponse } from "@/interfaces/common"
import { ExpenseItem, FinanceClient, MonthlySummary } from "@/interfaces/finanzas"
import seed from "@/data/finanzas-seed"

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

export interface MarkPaymentPayload {
    account: string
    period: string
    status: "realizado" | "retraso" | "pendiente"
    amount?: number
    method?: "stripe" | "transferencia" | "tarjeta" | "efectivo"
    source?: "manual" | "whatsapp_bot" | "stripe" | "import"
    paid_at?: string
    receipt_url?: string
    note?: string
}

export interface CheckoutResult {
    checkout_url: string
    session_id: string
}

// --- Datos simulados (placeholder; el backend los reemplaza por config real) ---
const MOCK_METHODS: PaymentMethodsConfig = {
    stripe: { enabled: true },
    transfer: {
        enabled: true,
        bank: "BBVA",
        beneficiary: "Eyplease+ S.A. de C.V.",
        clabe: "012 180 0000 0000 0000", // DEMO — reemplazar con la CLABE real
        account: "0000000000",
        instructions: "Envía tu comprobante por WhatsApp para confirmar tu pago.",
    },
}

const delay = <T,>(value: T, ms = 350): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms))

export const FinanzasService = {
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

    async markPayment(payload: MarkPaymentPayload): Promise<void> {
        if (USE_MOCK) return delay(undefined)
        await HttpService.post<ApiResponse<unknown>>("/finance/payments", payload)
    },

    // --- Lectura (para hidratar el store cuando exista backend) ---
    async getClients(year: number): Promise<FinanceClient[]> {
        if (USE_MOCK) return delay(seed.clients)
        const res = await HttpService.get<ApiResponse<FinanceClient[]>>(`/finance/clients?year=${year}`)
        return res.data
    },

    async getSummary(year: number): Promise<MonthlySummary[]> {
        if (USE_MOCK) return delay(seed.summary)
        const res = await HttpService.get<ApiResponse<MonthlySummary[]>>(`/finance/summary?year=${year}`)
        return res.data
    },

    async getExpenses(year: number): Promise<Record<string, ExpenseItem[]>> {
        if (USE_MOCK) return delay({})
        const res = await HttpService.get<ApiResponse<Record<string, ExpenseItem[]>>>(`/finance/expenses?year=${year}`)
        return res.data
    },
}

export default FinanzasService
