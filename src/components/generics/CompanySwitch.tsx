import { COMPANIES } from '@/constants/companies'
import { cn } from '@/lib/utils'
import useCompanyStore from '@/store/company'

/**
 * «Mary Kay | Zermat», con la misma forma que el de país. Va sólo en las pantallas que la API ya separa por empresa
 * (la lista de clientas y la cobertura de Publicaciones); lo que se elige en una se queda en las demás.
 */
const CompanySwitch = ({ className }: { className?: string }) => {
    const { company, setCompany } = useCompanyStore()

    return (
        <div role="group" aria-label="Empresa" className={cn('inline-flex shrink-0 items-center rounded-full border border-border bg-card/70 p-0.5 backdrop-blur', className)}>
            {COMPANIES.map(option => {
                const active = option.value === company
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCompany(option.value)}
                        title={`Ver las clientas de ${option.label}`}
                        className={cn(
                            'inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-[12.5px] font-bold transition',
                            active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}

export default CompanySwitch
