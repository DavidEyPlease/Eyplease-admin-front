// Finance / Collections module types.

export type PaymentStatus = "paid" | "overdue" | "pending" | null

export interface MonthlyPayment {
    amount: number | null
    status: PaymentStatus
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
    /** Agreed fixed monthly payment (billing profile agreed_payment, falling back to plan price). */
    fixedPayment: number | null
    /** Phone for WhatsApp. */
    phone?: string | null
    /** Payments keyed by period 'YYYY-MM'. */
    payments: Record<string, MonthlyPayment>
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
