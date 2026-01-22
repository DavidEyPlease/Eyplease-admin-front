import { create } from 'zustand'

import { ClientFilterKeys, IClientFilters } from '@/interfaces/clients'

type State = {
    filters: IClientFilters
}

type Actions = {
    onSelectFilter: (field: ClientFilterKeys, value: string) => void
    resetFilters: () => void
}

const INITIAL_FILTERS: State['filters'] = {
    plan: '',
    active: ''
}

const useClientsStore = create<State & Actions>((set) => ({
    filters: { ...INITIAL_FILTERS },
    onSelectFilter: (field, value) => set(state => ({
        filters: {
            ...state.filters,
            [field]: value
        }
    })),
    resetFilters: () => set({ filters: { ...INITIAL_FILTERS } })
}))

export default useClientsStore