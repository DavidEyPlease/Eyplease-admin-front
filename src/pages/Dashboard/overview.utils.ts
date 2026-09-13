/** Formatos del Inicio. */

export function money(n: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(n)
}

/** "2026-09" -> "septiembre". */
export function monthName(period: string): string {
    const [year, month] = period.split("-").map(Number)
    if (!year || !month) return period
    return new Date(year, month - 1, 1).toLocaleDateString("es-MX", { month: "long" })
}

/** Días en palabras: "230 días", "hoy". */
export function days(n: number): string {
    if (n <= 0) return "hoy"
    if (n === 1) return "1 día"
    return `${n} días`
}
