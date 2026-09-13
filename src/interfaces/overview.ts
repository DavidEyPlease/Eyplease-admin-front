/** Datos del Inicio: /admin/overview. */

export interface OverviewRevenuePeriod {
    period: string
    collected: number
    outstanding: number
    paid_count: number
    overdue_count: number
    in_review_count: number
    pending_count: number
    total_count: number
}

export interface OverviewDebtor {
    id: string
    name: string
    account: string | null
    /** Cuántos periodos del año arrastra vencidos. */
    periods: number
    amount: number
    /** Periodo más antiguo sin pagar, "YYYY-MM". */
    since: string
}

export interface OverviewTaskBucket {
    count: number
    /** Antigüedad de la más vieja, en días. */
    oldest_days: number
    /** Cuántas llevan más de una semana. */
    stale: number
}

export interface OverviewStuck {
    tasks: Record<string, OverviewTaskBucket>
    tasks_over_week: number
    unanswered_chats: number
    open_tickets: number
}

export interface AdminOverview {
    period: string
    revenue: {
        current: OverviewRevenuePeriod
        previous: OverviewRevenuePeriod
    }
    debtors: OverviewDebtor[]
    /** La deuda REAL del año: la lista de arriba son solo los mayores. */
    debtors_total: {
        clients: number
        amount: number
    }
    stuck: OverviewStuck
    clients: {
        active: number
        inactive: number
        new_this_month: number
    }
}
