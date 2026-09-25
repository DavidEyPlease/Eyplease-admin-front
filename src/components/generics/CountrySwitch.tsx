import { COUNTRIES, Country } from '@/constants/countries'
import useFetchQuery from '@/hooks/useFetchQuery'
import { cn } from '@/lib/utils'
import useCountryStore from '@/store/country'

interface CountryAttention {
    country: Country
    attention: number
}

/**
 * «México | Colombia» para TODO el panel. El país que no se está mirando no esconde trabajo: si
 * tiene algo por atender (archivos rechazados hoy, solicitudes sin asignar, correcciones), su botón
 * lleva un punto rojo con cuántos.
 */
const CountrySwitch = ({ className }: { className?: string }) => {
    const { country, setCountry } = useCountryStore()
    const { response } = useFetchQuery<CountryAttention[]>('/overview/attention', {
        customQueryKey: ['admin', 'country-attention'],
        staleTime: 60_000,
        refetchInterval: 120_000,
    })
    const attentionOf = (value: Country) => (Array.isArray(response) ? response.find(item => item.country === value)?.attention ?? 0 : 0)

    return (
        <div role="group" aria-label="País" className={cn('inline-flex shrink-0 items-center rounded-full border border-border bg-card/70 p-0.5 backdrop-blur', className)}>
            {COUNTRIES.map(option => {
                const active = option.value === country
                const pending = active ? 0 : attentionOf(option.value)
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCountry(option.value)}
                        title={pending ? `${option.label}: ${pending} por atender` : `Ver ${option.label}`}
                        className={cn(
                            'relative cursor-pointer rounded-full px-3 py-1 text-[12.5px] font-bold transition',
                            active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {option.label}
                        {pending > 0 && (
                            <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9.5px] leading-4 font-extrabold text-white tabular-nums">
                                {pending > 9 ? '9+' : pending}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

export default CountrySwitch
