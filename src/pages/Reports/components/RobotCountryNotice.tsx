import { InfoIcon } from "lucide-react"

import { COUNTRY_OPTIONS, type ReportsCountry } from "../reports.constants"

/**
 * El robot sólo entra al portal de México. Fuera de México no hay corridas que ver ni que lanzar:
 * esos reportes se suben a mano, desde «Faltan» en el resumen del mes.
 */
const RobotCountryNotice = ({ country }: { country: ReportsCountry }) => {
    const name = COUNTRY_OPTIONS.find(option => option.value === country)?.label ?? country

    return (
        <section className="shell-glass flex items-start gap-3 rounded-3xl p-5">
            <InfoIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0">
                <h2 className="text-[15px] font-extrabold tracking-tight">El robot todavía no entra al portal de {name}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    Sólo baja reportes de México. Los de {name} se suben a mano: en «Resumen del mes», abre el reporte que falta y súbelo desde ahí.
                </p>
            </div>
        </section>
    )
}

export default RobotCountryNotice
