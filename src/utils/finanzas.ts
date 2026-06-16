import { FinanceClient, MonthlySummary } from "@/interfaces/finanzas"

export const MONTH_LABELS: Record<string, string> = {
    enero: "Enero",
    febrero: "Febrero",
    marzo: "Marzo",
    abril: "Abril",
    mayo: "Mayo",
    junio: "Junio",
    julio: "Julio",
    agosto: "Agosto",
    septiembre: "Septiembre",
    octubre: "Octubre",
    noviembre: "Noviembre",
    diciembre: "Diciembre",
}

const mxn = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
})

export const formatMoney = (n: number | null | undefined) =>
    n === null || n === undefined ? "—" : mxn.format(n)

export const formatPct = (n: number | null | undefined) =>
    n === null || n === undefined ? "—" : `${Math.round(n)}%`

/** El último mes con datos en el resumen. */
export const lastSummary = (summary: MonthlySummary[]): MonthlySummary | undefined =>
    summary[summary.length - 1]

export const isOverdueStatus = (status: string | null | undefined) =>
    (status ?? "").toLowerCase().includes("retraso")

/** Mes "vigente" = último mes del resumen (donde está la cobranza viva). */
export const currentMonthKey = (summary: MonthlySummary[]) =>
    lastSummary(summary)?.month ?? "mayo"

export interface OverdueRow {
    client: FinanceClient
    monthsOverdue: string[]
    overdueAmount: number
}

/** Clientes con al menos un mes en retraso o saldo deudor. */
export const getOverdue = (clients: FinanceClient[], months: string[]): OverdueRow[] => {
    return clients
        .map((client) => {
            const monthsOverdue = months.filter((m) => isOverdueStatus(client.payments[m]?.status))
            const overdueAmount =
                monthsOverdue.reduce(
                    (acc, m) => acc + (client.payments[m]?.amount ?? client.fixedPayment ?? 0),
                    0
                ) || client.balance
            return { client, monthsOverdue, overdueAmount }
        })
        .filter((r) => r.monthsOverdue.length > 0 || r.client.balance > 0)
        .sort((a, b) => b.overdueAmount - a.overdueAmount)
}

export interface KpiSet {
    activeClients: number
    totalClients: number
    avgTicket: number | null
    overdueTotal: number | null
    income: number | null
    totalIncome: number | null
    expenses: number | null
    netSubscription: number | null
    netTotal: number | null
    churnVsFirst: number | null
    paidCount: number
    overdueCount: number
}

export const computeKpis = (
    clients: FinanceClient[],
    summary: MonthlySummary[],
    monthKey: string
): KpiSet => {
    const last = lastSummary(summary)
    const first = summary[0]
    const activeClients = clients.filter((c) => (c.appStatus ?? "").toLowerCase() === "activo").length

    const paid = clients.filter((c) => (c.payments[monthKey]?.status ?? "").toLowerCase() === "realizado")
    const overdue = clients.filter((c) => isOverdueStatus(c.payments[monthKey]?.status))

    const churn =
        first?.["Clientes totales"] && last?.["Clientes totales"]
            ? ((last["Clientes totales"]! - first["Clientes totales"]!) / first["Clientes totales"]!) * 100
            : null

    return {
        activeClients,
        totalClients: last?.["Clientes totales"] ?? clients.length,
        avgTicket: last?.["Ticket promedio"] ?? null,
        overdueTotal: last?.["Retraso"] ?? null,
        income: last?.["Ingreso"] ?? null,
        totalIncome: last?.["Total"] ?? null,
        expenses: last?.["Gastos Totales"] ?? null,
        netSubscription: last?.["Ingreso - GT"] ?? null,
        netTotal: last?.["Total - GT"] ?? null,
        churnVsFirst: churn,
        paidCount: paid.length,
        overdueCount: overdue.length,
    }
}

// OJO: "GIF" en el Excel es la SUMA de las herramientas de software (Servidores+ZOOM+
// ChatGPT+Adobe+Nexrender+Canva+Gemini), y "GD" la suma del equipo. Por eso NO se incluyen
// aquí — se contarían doble. Solo listamos las partidas individuales.
const EXPENSE_KEYS: (keyof MonthlySummary)[] = [
    "Servidores",
    "ZOOM",
    "Chat GPT",
    "Adobe",
    "Nexrender",
    "Canva",
    "Gemini",
    "Diseñadora",
    "Programador",
    "Administración",
]

export const expenseBreakdown = (s: MonthlySummary | undefined) => {
    if (!s) return []
    return EXPENSE_KEYS.map((k) => ({ name: k as string, value: (s[k] as number) ?? 0 }))
        .filter((e) => e.value > 0)
        .sort((a, b) => b.value - a.value)
}

const MONTH_INDEX: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
}

/** Año base de los datos. */
const DATA_YEAR = 2026

/** Fecha de vencimiento del mes indicado para un cliente (mes + día de pago). */
const dueDateFor = (monthKey: string, paymentDay: number | null): Date => {
    const m = MONTH_INDEX[monthKey] ?? 0
    const day = paymentDay && paymentDay >= 1 && paymentDay <= 28 ? paymentDay : 1
    return new Date(DATA_YEAR, m, day)
}

/** Días vencidos desde el mes más antiguo en retraso (0 si no aplica). */
export const daysOverdue = (row: OverdueRow, now: Date = new Date()): number => {
    const earliest = row.monthsOverdue[0]
    if (!earliest) return 0
    const due = dueDateFor(earliest, row.client.paymentDay)
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
}

export type AgingBucket = "0-30" | "31-60" | "60+"

export const agingBucket = (days: number): AgingBucket =>
    days <= 30 ? "0-30" : days <= 60 ? "31-60" : "60+"

export const AGING_META: Record<AgingBucket, { label: string; pill: string; dot: string }> = {
    "0-30": { label: "Reciente (0-30 días)", pill: "bg-amber-50 text-amber-600", dot: "bg-amber-400" },
    "31-60": { label: "Atrasado (31-60 días)", pill: "bg-orange-50 text-orange-600", dot: "bg-orange-500" },
    "60+": { label: "Crítico (+60 días)", pill: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
}

/** ¿Toca cobrar hoy? (día de pago == hoy, o ya vencido). */
export const isDueToday = (client: FinanceClient, now: Date = new Date()): boolean =>
    client.paymentDay === now.getDate()

/** ¿Necesita seguimiento? Recordatorio enviado hace >7 días y sigue en retraso. */
export const needsFollowUp = (client: FinanceClient, now: Date = new Date()): boolean => {
    if (!client.reminderSentAt) return false
    const days = Math.floor((now.getTime() - new Date(client.reminderSentAt).getTime()) / (1000 * 60 * 60 * 24))
    return days >= 7
}

// ---- Proyección / punto de equilibrio ----

export interface ProjectionInput {
    summary: MonthlySummary[]
    monthlyChurn: number   // tasa decimal (0.03 = 3%)
    avgTicket: number
    monthlyExpenses: number
    months: number         // horizonte
}

export interface ProjectionPoint {
    label: string
    clientes: number
    ingreso: number
    gasto: number
    resultado: number
}

/** Tasa de churn mensual promedio a partir de "Clientes totales". */
export const computeMonthlyChurn = (summary: MonthlySummary[]): number => {
    const series = summary.map((s) => s["Clientes totales"]).filter((n): n is number => typeof n === "number")
    if (series.length < 2) return 0
    let acc = 0, n = 0
    for (let i = 1; i < series.length; i++) {
        const prev = series[i - 1]
        if (prev > 0) {
            acc += Math.max(0, (prev - series[i]) / prev)
            n++
        }
    }
    return n ? acc / n : 0
}

/** Clientes necesarios para cubrir los gastos fijos al ticket dado. */
export const breakEvenClients = (monthlyExpenses: number, avgTicket: number): number =>
    avgTicket > 0 ? Math.ceil(monthlyExpenses / avgTicket) : 0

/** Proyecta N meses hacia adelante aplicando churn y ticket. */
export const projectForward = (input: ProjectionInput): ProjectionPoint[] => {
    const { summary, monthlyChurn, avgTicket, monthlyExpenses, months } = input
    const last = lastSummary(summary)
    let clientes = last?.["Clientes totales"] ?? 0
    const startIdx = MONTH_INDEX[last?.month ?? "mayo"] ?? 4
    const out: ProjectionPoint[] = []
    for (let i = 1; i <= months; i++) {
        clientes = clientes * (1 - monthlyChurn)
        const ingreso = clientes * avgTicket
        const monthName = Object.keys(MONTH_INDEX).find((k) => MONTH_INDEX[k] === (startIdx + i) % 12) ?? ""
        out.push({
            label: (MONTH_LABELS[monthName] ?? monthName).slice(0, 3),
            clientes: Math.round(clientes),
            ingreso: Math.round(ingreso),
            gasto: monthlyExpenses,
            resultado: Math.round(ingreso - monthlyExpenses),
        })
    }
    return out
}

/** Ingreso teórico por plan (conteo × precio promedio observado del plan). */
export const revenueByPlan = (clients: FinanceClient[]) => {
    const map = new Map<string, { plan: string; count: number; revenue: number }>()
    for (const c of clients) {
        const plan = c.plan ?? "Sin plan"
        const price = c.fixedPayment ?? 0
        const cur = map.get(plan) ?? { plan, count: 0, revenue: 0 }
        cur.count++
        cur.revenue += price
        map.set(plan, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

/** Genera el texto de recordatorio de pago para WhatsApp/correo. */
export const buildReminderMessage = (row: OverdueRow): string => {
    const { client, overdueAmount, monthsOverdue } = row
    const meses = monthsOverdue.map((m) => MONTH_LABELS[m] ?? m).join(", ")
    const nombre = client.name.split(" ")[0]
    return (
        `Hola ${nombre}, te saluda el equipo de Eyplease+ 💜\n\n` +
        `Notamos un pago pendiente de tu suscripción${meses ? ` (${meses})` : ""} ` +
        `por un total de ${formatMoney(overdueAmount)}.\n\n` +
        `Para que no se interrumpa tu servicio, ¿podrías ayudarnos a regularizarlo? ` +
        `Si ya realizaste el pago, ignora este mensaje o compártenos tu comprobante.\n\n` +
        `Gracias por confiar en nosotros.`
    )
}

/** Normaliza un teléfono a dígitos (asume México si faltan los 52). */
const normalizePhone = (phone: string): string => {
    let d = phone.replace(/\D/g, "")
    if (d.length === 10) d = "52" + d
    return d
}

/** Link de WhatsApp con el mensaje pre-llenado. Si no hay teléfono, abre para elegir contacto. */
export const buildWhatsappLink = (row: OverdueRow): string => {
    const text = encodeURIComponent(buildReminderMessage(row))
    const phone = row.client.phone ? normalizePhone(row.client.phone) : ""
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
}
