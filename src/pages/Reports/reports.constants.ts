// Constantes de presentación del módulo de Reportes. El catálogo de secciones y el derecho
// por plan ya NO viven aquí: los resuelve el backend (endpoints /reports/*).

export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export type CellStatus = "completed" | "failed" | "processing" | "missing" | "na" | string

export const statusMeta = (s: CellStatus): { label: string; pill: string; dot: string } => {
    switch ((s || "").toLowerCase()) {
        case "completed": return { label: "Subido", pill: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" }
        case "failed": return { label: "Rechazado", pill: "bg-rose-50 text-rose-600", dot: "bg-rose-500" }
        case "processing": return { label: "Procesando", pill: "bg-amber-50 text-amber-600", dot: "bg-amber-400" }
        case "missing": return { label: "Falta", pill: "bg-slate-100 text-slate-500", dot: "bg-slate-200" }
        default: return { label: "No aplica", pill: "bg-white text-slate-300", dot: "border border-slate-200 bg-white" }
    }
}

const ERROR_DECODE: Record<string, string> = {
    cross_user_validation: "Datos de otra consultora (validación cruzada). El Excel no corresponde a este cliente.",
    invalid_report_headings: "Encabezados del Excel inválidos. Las columnas no coinciden con la plantilla esperada.",
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
