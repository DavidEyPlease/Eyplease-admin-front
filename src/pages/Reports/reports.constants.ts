// Constantes de presentación del módulo de Reportes. El catálogo de secciones y el derecho
// por plan ya NO viven aquí: los resuelve el backend (endpoints /reports/*).

import { COUNTRIES, Country, DEFAULT_COUNTRY as HOME_COUNTRY } from "@/constants/countries"

/** Cada país se mide aparte: tiene su portal de Mary Kay, sus reportes y sus cuentas (ver @/constants/countries). */
export type ReportsCountry = Country

/** México: el país que la API mide si no se le pide otro (el robot entra además al de Colombia). */
export const DEFAULT_COUNTRY: ReportsCountry = HOME_COUNTRY

export const COUNTRY_OPTIONS: { value: ReportsCountry; label: string }[] = COUNTRIES.map(({ value, label }) => ({ value, label }))

export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export type CellStatus = "completed" | "empty" | "failed" | "processing" | "missing" | "na" | string

/** Único estado que cuenta como reporte cargado con datos (el resto queda pendiente). */
export const STATUS_LOADED = "completed"

export const statusMeta = (s: CellStatus): { label: string; pill: string; dot: string } => {
    switch ((s || "").toLowerCase()) {
        case "completed": return { label: "Subido", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
        // Subido pero sin registros: hay que volver a cargarlo.
        case "empty": return { label: "Sin datos", pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400", dot: "bg-sky-400" }
        case "failed": return { label: "Rechazado", pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" }
        case "processing": return { label: "Procesando", pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-400" }
        case "missing": return { label: "Falta", pill: "bg-foreground/[.06] text-muted-foreground", dot: "bg-foreground/15" }
        default: return { label: "No aplica", pill: "bg-transparent text-muted-foreground/60", dot: "border border-border bg-transparent" }
    }
}

const ERROR_DECODE: Record<string, string> = {
    cross_user_validation: "Datos de otra consultora (validación cruzada). El Excel no corresponde a este cliente.",
    invalid_report_headings: "Encabezados del Excel inválidos. Las columnas no coinciden con la plantilla esperada.",
    empty_report: "El reporte se cargó pero está vacío: no contiene datos que registrar.",
}
export const decodeError = (code: string | null): string => (code && ERROR_DECODE[code]) || code || "Error no especificado"

export const periodLabel = (p: string): string => {
    const [y, m] = p.split("-")
    return `${MESES[Number(m) - 1]} ${y}`
}

export const fmtDateTime = (iso: string | null): string => {
    if (!iso) return "—"
    const d = new Date(iso)
    return (
        d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
        " " +
        d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    )
}

/** Últimos 6 meses + el siguiente, como opciones {label,value:'YYYY-MM'}. */
export const buildPeriodOptions = (): { label: string; value: string }[] => {
    const now = new Date()
    const out: { label: string; value: string }[] = []
    for (let i = -1; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        out.push({ label: periodLabel(value), value })
    }
    return out
}

export const currentPeriod = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/** Mes por defecto: el ANTERIOR (último ciclo de boletín cerrado). El mes en
 * curso suele estar incompleto porque los reportes de cierre se suben a fin de
 * mes; arrancar ahí haría parecer que a todos les faltan reportes. */
export const defaultPeriod = (): string => {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
