import { companyInfo, companyOf, isDefaultCompany } from '@/constants/companies'
import { cn } from '@/lib/utils'

/**
 * La etiqueta con la empresa de una clienta, sólo cuando NO es de Mary Kay: lo de siempre se queda sin ruido.
 * Acepta lo que traiga la API (`company` de la ficha, de la fila, del chat); sin él no pinta nada.
 */
const CompanyTag = ({ company, className }: { company?: string | null, className?: string }) => {
    const value = companyOf(company)
    if (isDefaultCompany(value)) return null

    return (
        <span className={cn('inline-flex shrink-0 items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-400/15 dark:text-teal-300', className)}>
            {companyInfo(value).label}
        </span>
    )
}

export default CompanyTag
