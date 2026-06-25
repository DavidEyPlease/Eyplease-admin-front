// Catálogo de reportes de Mary Kay + derecho por plan.
// El derecho está verificado contra plan_accesses de la API:
//   - Secciones de Unidad: Básico, Ejecutivo, Elite, Nacional.
//   - Aniversarios (Unidad): solo Elite y Nacional.
//   - Secciones Nacional: solo Plan Nacional.
//   - Tempraneras (early) NO va por plan -> indicador diario aparte.

export const PLAN = {
    B: "Plan Básico",
    EJ: "Plan Ejecutivo",
    EL: "Plan Elite",
    NAC: "Plan Nacional",
} as const

export const BOLETIN_PLANS: string[] = [PLAN.B, PLAN.EJ, PLAN.EL, PLAN.NAC]
const ELITE_NAC: string[] = [PLAN.EL, PLAN.NAC]
const ONLY_NAC: string[] = [PLAN.NAC]

export type NewsletterGroup = "unit" | "national"

export interface SectionDef {
    key: string
    name: string
    nl: NewsletterGroup
    plans: string[]
}

export const SECTION_CATALOG: SectionDef[] = [
    // Unidad
    { key: "unity_monthly_personal_sales", name: "Ventas personales", nl: "unit", plans: BOLETIN_PLANS },
    { key: "initiators", name: "Iniciadoras", nl: "unit", plans: BOLETIN_PLANS },
    { key: "pink_circle", name: "Círculo rosa", nl: "unit", plans: BOLETIN_PLANS },
    { key: "group_production", name: "Producción de grupo", nl: "unit", plans: BOLETIN_PLANS },
    { key: "birthdays", name: "Cumpleaños", nl: "unit", plans: BOLETIN_PLANS },
    { key: "anniversaries", name: "Aniversarios", nl: "unit", plans: ELITE_NAC },
    // Nacional (solo Plan Nacional)
    { key: "area_recognition", name: "Reconocimiento de Área", nl: "national", plans: ONLY_NAC },
    { key: "national_monthly_personal_sales", name: "Ventas personales", nl: "national", plans: ONLY_NAC },
    { key: "national_group_production", name: "Producción de grupo", nl: "national", plans: ONLY_NAC },
    { key: "diq", name: "Directoras en calificación", nl: "national", plans: ONLY_NAC },
    { key: "sales_cut", name: "Corte de Ventas", nl: "national", plans: ONLY_NAC },
    { key: "target_unit_club", name: "Corte de unidad", nl: "national", plans: ONLY_NAC },
    { key: "national_initiation_cut", name: "Corte de inicios", nl: "national", plans: ONLY_NAC },
    { key: "tsr", name: "Trofeo Sobre Ruedas", nl: "national", plans: ONLY_NAC },
    { key: "national_birthdays", name: "Cumpleaños", nl: "national", plans: ONLY_NAC },
    { key: "national_anniversaries", name: "Aniversarios", nl: "national", plans: ONLY_NAC },
]

export const DAILY_KEY = "early" // Tempraneras (ventas personales del día / ordenantes)

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
