import { toLocalDateFromUtc } from "@/utils/dates"

/** Spanish display labels, indexed 0-11 (UI copy). */
export const MONTH_LABELS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export const monthLabel = (month: number) => MONTH_LABELS[month - 1] ?? String(month)

/** Build a period key 'YYYY-MM' from a year and a 1-12 month. */
export const toPeriod = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`

/** Extract the 1-12 month from a 'YYYY-MM' period. */
export const periodMonth = (period: string) => Number(period.slice(5, 7))

export const periodLabel = (period: string) => monthLabel(periodMonth(period))

/** All 12 periods of a year, as 'YYYY-MM'. */
export const periodsForYear = (year: number) => Array.from({ length: 12 }, (_, i) => toPeriod(year, i + 1))

const mxn = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const formatMoney = (n: number | null | undefined) =>
    Number.isFinite(n) ? mxn.format(n as number) : "—"

export const formatPct = (n: number | null | undefined) =>
    Number.isFinite(n) ? `${Math.round(n as number)}%` : "—"

const dueDateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" })

/**
 * Human due date from an API date 'YYYY-MM-DD': "5 ago" (or "—"). Parsed as a
 * calendar date, not as UTC midnight, so it never slips a day west of UTC.
 */
export const formatDueDate = (isoDate: string | null | undefined): string =>
    isoDate ? dueDateFmt.format(toLocalDateFromUtc(isoDate)) : "—"

/** Period 'YYYY-MM' of an API date 'YYYY-MM-DD'. */
export const periodOf = (isoDate: string) => isoDate.slice(0, 7)

// ---- Fecha del pago y promesa de pago (en hora de México) ----

const MX_TZ = "America/Mexico_City"
const ymdMx = new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit", day: "2-digit" })
const paidAtFmt = new Intl.DateTimeFormat("es-MX", { timeZone: MX_TZ, day: "numeric", month: "short" })
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** Hoy en México, 'YYYY-MM-DD'. */
export const todayMx = () => ymdMx.format(new Date())

/**
 * `paid_at` para la API a partir del día elegido en el calendario: al MEDIODÍA de México.
 * El ingreso cuenta en el mes de esa fecha en hora de México; a medianoche UTC, un pago
 * del día 1 caería en el mes anterior.
 */
export const paidAtOn = (day: Date) => `${ymd(day)}T12:00:00-06:00`

/** 'YYYY-MM-DD' del día elegido en el calendario (sin corrimiento de zona). */
export const dateOnly = (day: Date) => ymd(day)

/** «5 sep» de un `paid_at` de la API, en hora de México. */
export const formatPaidAt = (iso: string | null | undefined) => (iso ? paidAtFmt.format(new Date(iso)) : "—")

/** Si la promesa sigue en pie (hasta ese día incluido) o ya se venció. */
export const promiseState = (promisedUntil: string | null | undefined): "active" | "expired" | null =>
    !promisedUntil ? null : promisedUntil >= todayMx() ? "active" : "expired"

// ---- Pagos parciales / abonos ----

interface PeriodLike { amount: number | null; paid?: number | null; status: string | null }

/** Monto abonado en el periodo. */
export const periodPaid = (p?: PeriodLike | null) => p?.paid ?? 0

/** Restante por cobrar del periodo (esperado − abonado); 0 si ya está pagado. */
export const periodRemaining = (p: PeriodLike | null | undefined, fallbackDue = 0): number => {
    if (!p || p.status === "paid") return 0
    const due = p.amount ?? fallbackDue
    return Math.max(0, due - (p.paid ?? 0))
}

// ---- Projection / break-even ----

export interface ProjectionInput {
    startClients: number
    startMonth: number     // 1-12, month the projection starts from
    monthlyChurn: number   // decimal rate (0.03 = 3%)
    avgTicket: number
    monthlyExpenses: number
    months: number         // horizon
}

export interface ProjectionPoint {
    label: string
    clients: number
    income: number
    expense: number
    result: number
}

/** Clients needed to cover fixed expenses at the given ticket. */
export const breakEvenClients = (monthlyExpenses: number, avgTicket: number): number =>
    avgTicket > 0 ? Math.ceil(monthlyExpenses / avgTicket) : 0

/** Project N months forward applying churn and ticket. */
export const projectForward = (input: ProjectionInput): ProjectionPoint[] => {
    const { startClients, startMonth, monthlyChurn, avgTicket, monthlyExpenses, months } = input
    let clients = startClients
    const out: ProjectionPoint[] = []
    for (let i = 1; i <= months; i++) {
        clients = clients * (1 - monthlyChurn)
        const income = clients * avgTicket
        const monthNumber = ((startMonth - 1 + i) % 12) + 1
        out.push({
            label: monthLabel(monthNumber).slice(0, 3),
            clients: Math.round(clients),
            income: Math.round(income),
            expense: monthlyExpenses,
            result: Math.round(income - monthlyExpenses),
        })
    }
    return out
}
