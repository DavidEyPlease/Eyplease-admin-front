/**
 * El panel se ve un país a la vez: sus clientas, sus reportes y su dinero no se mezclan con los del
 * otro (cada país tiene su portal de Mary Kay, su moneda y sus programas). México va por defecto.
 */
export type Country = 'MEX' | 'COL'

export const DEFAULT_COUNTRY: Country = 'MEX'

export interface CountryInfo {
    value: Country
    label: string
    /** Moneda en la que se cobra ahí. */
    currency: 'MXN' | 'COP'
    /** Cómo se escriben ahí los números: en Colombia los miles van con punto. */
    locale: 'es-MX' | 'es-CO'
}

export const COUNTRIES: CountryInfo[] = [
    { value: 'MEX', label: 'México', currency: 'MXN', locale: 'es-MX' },
    { value: 'COL', label: 'Colombia', currency: 'COP', locale: 'es-CO' },
]

export const countryInfo = (country: Country): CountryInfo =>
    COUNTRIES.find(item => item.value === country) ?? COUNTRIES[0]

/** «$179,900» en México y «$179.900» en Colombia, sin centavos: lo que se lee de un vistazo. */
export const moneyIn = (amount: number, currency: string = 'MXN'): string => {
    const locale = currency === 'COP' ? 'es-CO' : 'es-MX'
    return `$${Math.round(amount).toLocaleString(locale)}`
}
