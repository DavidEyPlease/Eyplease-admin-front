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

/** Cómo va hoy una sección que debe correr todos los días. */
export type DailyTodayStatus = "ok" | "scheduled" | "missing"

export interface DailySection {
    key: string
    name: string
    /** Hora del cron, "HH:mm". */
    scheduled_at: string
    ran_today: boolean
    today_status: DailyTodayStatus
    days_covered: number
    /** Días que ya eran exigibles (hoy solo cuenta si pasó su hora). */
    days_expected: number
    days_missing: number
    /** Días del mes en los que sí corrió, para el calendario. */
    covered_days: number[]
    failed_jobs: number
    last_run_at: string | null
}

export interface MonthlySection {
    key: string
    name: string
    posts: number
    /** Mes de los datos con los que se arma (no es el mes que se ve). */
    data_period: string
}

export interface OverviewPublishing {
    today: string
    days_elapsed: number
    days_in_month: number
    daily: DailySection[]
    monthly: {
        covered: number
        total: number
        missing: MonthlySection[]
    }
}

export interface ServiceRequest {
    id: string
    /** El número con el que se identifica la tarea en el día a día ("la #568"). */
    consecutive: number | null
    title: string
    client: string | null
    account: string | null
    created_at: string | null
    days: number
}

export interface OverviewServiceRequests {
    /** Sin asignar: nadie las ha tomado todavía. */
    new: number
    /** Ya tienen dueño y esperan revisión. */
    in_review: number
    latest: ServiceRequest[]
}

export interface OverviewCorrections {
    count: number
    latest: ServiceRequest[]
}

export interface AdminOverview {
    period: string
    revenue: {
        current: OverviewRevenuePeriod
        previous: OverviewRevenuePeriod
    }
    publishing: OverviewPublishing
    service_requests: OverviewServiceRequests
    corrections: OverviewCorrections
    clients: {
        active: number
        inactive: number
        new_this_month: number
    }
}
