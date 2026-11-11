/**
 * Reportes diarios (Tempraneras y los dos de Corazones): cuántas cuentas lo tienen hoy contra cuántas deben tenerlo.
 *
 * Un archivo que SÍ bajó pero vino vacío no falta: cuenta como recibido. En Tempraneras pasa a principios de
 * mes, cuando una unidad todavía no tiene órdenes; el 6-oct-2026 el panel decía «faltan 2» con los 23 bajados.
 */
export interface DailyReportCount {
    section_key: string
    loaded: number
    usual: number
    /** Bajaron hoy sin nada que registrar. La API vieja no lo manda. */
    empty?: number
}

/** Las que ya tienen su archivo de hoy, traiga datos o no. */
export const dailyReceived = (report: DailyReportCount) => report.loaded + (report.empty ?? 0)

export const dailyDone = (report: DailyReportCount) => dailyReceived(report) >= report.usual

/** Las que de verdad faltan: no ha bajado su archivo. */
export const dailyMissing = (report: DailyReportCount) => Math.max(report.usual - dailyReceived(report), 0)

/** «2 sin órdenes aún» (Tempraneras) o «2 sin datos»; null si ninguno vino vacío. */
/* Las ventas del día, en sus dos tandas (Elite y Área a las 6:00; Básico y Ejecutivo a las 11:30) */
const isSales = (report: DailyReportCount) => report.section_key === "early" || report.section_key === "early_midday"

export const dailyEmptyLabel = (report: DailyReportCount) =>
    !report.empty ? null : isSales(report) ? `${report.empty} sin órdenes aún` : `${report.empty} sin datos`

/** «21 con órdenes · 2 sin órdenes aún»; sin vacíos, «21 de 23 cargadas». */
export const dailyHeadline = (report: DailyReportCount) =>
    report.empty
        ? `${report.loaded} ${isSales(report) ? "con órdenes" : "con datos"} · ${dailyEmptyLabel(report)}`
        : `${report.loaded} de ${report.usual} cargadas`
