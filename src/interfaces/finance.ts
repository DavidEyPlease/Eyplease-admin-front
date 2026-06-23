// Finance / Collections module types.

import { DiscountType } from "./promotion"

export type PaymentStatus = "paid" | "overdue" | "pending" | null

export interface MonthlyPayment {
    amount: number | null
    status: PaymentStatus
}

/** Per-client applied promotion snapshot (kept in snake_case from the API). */
export interface FinanceClientPromotion {
    promotion_id: string | null
    name: string | null
    discount_type: DiscountType
    discount: number
    /** Deadline 'YYYY-MM-DD'. */
    expires_at: string
}

export interface FinanceClient {
    /** consultant_code, used as the client identifier across the panel. */
    id: string
    userId?: string
    name: string
    plan: string | null
    /** App status: 'active' | 'inactive'. */
    appStatus: string | null
    /** Day of the month the payment is due (1-31). */
    paymentDay: number | null
    /** Debt (>0) or credit (<0) in MXN. */
    balance: number
    /** Fixed monthly payment = the client's plan price (plans.price). */
    fixedPayment: number | null
    /** 'stripe' = has a stripe_id (Cashier); 'manual' = billed by the dues job. */
    billingType: "stripe" | "manual"
    /** Phone for WhatsApp. */
    phone?: string | null
    /** Applied promotion snapshot, or null when the client has none. */
    promotion: FinanceClientPromotion | null
    /** Payments keyed by period 'YYYY-MM'. */
    payments: Record<string, MonthlyPayment>
}

export type PaymentSource = "manual" | "whatsapp_bot" | "stripe" | "import" | "system"
export type PaymentMethod = "stripe" | "transfer" | "card" | "cash"

/** One row of the payment ledger returned by GET /finance/payments. */
export interface PaymentRecord {
    id: string
    userId: string
    /** consultant_code of the payer (null if the user has no network person). */
    account: string | null
    clientName: string | null
    /** Period 'YYYY-MM' the payment covers. */
    period: string
    amount: number
    currency: string
    status: PaymentStatus
    method: PaymentMethod | null
    source: PaymentSource | null
    /** ISO datetime when it was collected (null until paid). */
    paidAt: string | null
    receiptUrl: string | null
    note: string | null
    createdAt: string | null
}

/** Display labels (UI is in Spanish; the stored values stay in English). */
export const PAYMENT_STATUS_LABELS: Record<Exclude<PaymentStatus, null>, string> = {
    paid: "Pagado",
    overdue: "Vencido",
    pending: "Pendiente",
}

export const PAYMENT_SOURCE_LABELS: Record<PaymentSource, string> = {
    manual: "Manual",
    whatsapp_bot: "WhatsApp",
    stripe: "Stripe",
    import: "Importado",
    system: "Sistema",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    stripe: "Stripe",
    transfer: "Transferencia",
    card: "Tarjeta",
    cash: "Efectivo",
}

export type ExpenseCategory = "tools" | "team" | "other"

export interface ExpenseItem {
    id: string
    /** Expense date in ISO format (YYYY-MM-DD). */
    date: string
    description: string
    amount: number
    category: ExpenseCategory
}

/** Payload sent to the backend on create/update. */
export interface ExpensePayload {
    date: string
    description: string
    amount: number
    category: ExpenseCategory
}

/** Display labels per category (UI is in Spanish; values stay in English). */
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    tools: "Herramientas",
    team: "Equipo",
    other: "Otros",
}

export const EXPENSE_CATEGORY_OPTIONS = (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map(
    (value) => ({ value, label: EXPENSE_CATEGORY_LABELS[value] })
)

/** Aggregates returned by GET /finance/summary (computed in SQL). */
export interface SummaryMonth {
    month: number
    income: number
    overdue_total: number
    pending_total: number
    overdue_clients: number
    avg_ticket: number
    total_clients: number
}

export interface PlanDistributionItem {
    plan: string
    count: number
    revenue: number
}

export interface FinanceSummary {
    year: number
    month: number
    active_clients: number
    /** Average monthly churn rate (decimal 0-1) from client snapshots. */
    churn_rate: number
    plan_distribution: PlanDistributionItem[]
    month_summary: SummaryMonth
    months: SummaryMonth[]
}

/** One month of the income/expense balance returned by GET /finance/balance. */
export interface BalanceMonth {
    month: number
    income: number
    expense: number
    balance: number
}

export interface FinanceBalance {
    year: number
    year_income: number
    year_expense: number
    year_balance: number
    months: BalanceMonth[]
}
