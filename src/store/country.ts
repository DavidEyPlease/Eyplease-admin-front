import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Country, DEFAULT_COUNTRY } from '@/constants/countries'

type State = {
    country: Country
}

type Actions = {
    setCountry: (country: Country) => void
}

/**
 * El país que se está mirando en TODO el panel (Hoy, Reportes…). Se recuerda en este navegador:
 * quien estaba viendo Colombia vuelve a Colombia al recargar.
 */
const useCountryStore = create<State & Actions>()(
    persist(
        (set) => ({
            country: DEFAULT_COUNTRY,
            setCountry: (country) => set({ country }),
        }),
        { name: 'eyplease-admin:country' },
    ),
)

export default useCountryStore
