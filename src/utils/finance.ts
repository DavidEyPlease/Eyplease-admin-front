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

/** Next charge date from a client's payment day (1-31): the upcoming occurrence from today. */
export const nextChargeDate = (paymentDay: number | null | undefined, now: Date = new Date()): Date | null => {
    if (!paymentDay || paymentDay < 1 || paymentDay > 31) return null
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let d = new Date(now.getFullYear(), now.getMonth(), paymentDay)
    if (d.getTime() < today.getTime()) d = new Date(now.getFullYear(), now.getMonth() + 1, paymentDay)
    return d
}

const chargeDateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" })

/** Human next charge date: "5 ago" (or "—"). */
export const formatChargeDate = (paymentDay: number | null | undefined, now: Date = new Date()): string => {
    const d = nextChargeDate(paymentDay, now)
    return d ? chargeDateFmt.format(d) : "—"
}

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
