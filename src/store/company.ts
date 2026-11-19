import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Company, companyOf, DEFAULT_COMPANY } from '@/constants/companies'

type State = {
    company: Company
}

type Actions = {
    setCompany: (company: Company) => void
}

/**
 * La empresa que se está mirando donde la API ya la separa (la lista de clientas, la cobertura de Publicaciones y,
 * por omisión, los avisos masivos). Como el país, se recuerda en este navegador. Mary Kay va por defecto.
 *
 * No va en la barra de arriba junto al país: Hoy, Reportes o Finanzas todavía no se separan por empresa, y un
 * selector global ahí haría creer que sí.
 */
const useCompanyStore = create<State & Actions>()(
    persist(
        (set) => ({
            company: DEFAULT_COMPANY,
            setCompany: (company) => set({ company }),
        }),
        {
            name: 'eyplease-admin:company',
            /* Lo guardado se lee con `companyOf`: una empresa que ya no exista vuelve a Mary Kay */
            merge: (persisted, current) => ({ ...current, company: companyOf((persisted as Partial<State> | undefined)?.company) }),
        },
    ),
)

export default useCompanyStore
