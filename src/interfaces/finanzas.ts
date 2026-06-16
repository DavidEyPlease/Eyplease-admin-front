// Tipos del módulo de Finanzas / Cobranza.

export type PaymentStatus = "Realizado" | "Retraso" | "Pendiente" | null

export interface MonthlyPayment {
    amount: number | null
    status: string | null
}

export interface FinanceClient {
    /** Código de usuario (consultant_code) usado para cruzar con la API. */
    id: string
    name: string
    plan: string | null
    promo: string | null
    /** Estatus en la app: Activo / Bloqueado / Inactivo. */
    appStatus: string | null
    reports: string | null
    notes: string
    /** Día del mes en que toca el pago (1-31). */
    paymentDay: number | null
    /** Deuda (>0) o saldo a favor (<0) en MXN. */
    balance: number
    /** Pago fijo pactado (precio mensual de su plan/promo). */
    fixedPayment: number | null
    /** Pagos por mes: { enero: { amount, status }, ... } */
    payments: Record<string, MonthlyPayment>
    /** ISO date del último recordatorio enviado, o null. */
    reminderSentAt: string | null
    /** Teléfono para WhatsApp (editable; la API lo llenará a futuro). */
    phone?: string | null
    /** Cuántos recordatorios se han enviado. */
    reminderCount?: number
    /** ISO date a la que el cliente prometió pagar, o null. */
    promisedAt?: string | null
}

export interface ExpenseItem {
    id: string
    name: string
    amount: number
}

export interface MonthlySummary {
    month: string
    "Clientes totales": number | null
    "Ticket promedio": number | null
    "Retraso": number | null
    "Pendiente": number | null
    "Ingreso": number | null
    "Total": number | null
    "Servidores": number | null
    "ZOOM": number | null
    "Chat GPT": number | null
    "Adobe": number | null
    "Nexrender": number | null
    "Canva": number | null
    "Gemini": number | null
    "GIF": number | null
    "Diseñadora": number | null
    "Programador": number | null
    "Administración": number | null
    "GD": number | null
    "Gastos Totales": number | null
    "Ingreso - GT": number | null
    "Total - GT": number | null
}

export interface FinanzasSeed {
    clients: FinanceClient[]
    summary: MonthlySummary[]
    generatedFrom: string
    months: string[]
}
