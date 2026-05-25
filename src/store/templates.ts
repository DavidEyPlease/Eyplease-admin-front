import { ITemplate } from '@/interfaces/templates'
import { TemplateFilters } from '@/pages/Templates/page-utils'
import { RowSelectionState } from '@tanstack/react-table'
import { create } from 'zustand'

type SelectedTemplate = ITemplate | null
type SelectedActionTemplate = 'view' | 'edit' | 'manageClient' | null
type RowSelectionUpdater = RowSelectionState | ((old: RowSelectionState) => RowSelectionState)

export type StoreTemplatesFilters = {
    reports: Partial<TemplateFilters>
    posts: Partial<TemplateFilters>
}

export type StoreTemplatesSearch = {
    reports: string
    posts: string
}

export type TemplatesType = keyof StoreTemplatesFilters

export type StoreTemplatesState = {
    actionDialogOpen: SelectedActionTemplate
    selectedTemplate: SelectedTemplate
    filters: StoreTemplatesFilters
    search: StoreTemplatesSearch
    selectedTemplates: ITemplate[]
    rowSelection: RowSelectionState
}

type Actions = {
    setSelectedTemplate: (value: SelectedTemplate, action?: SelectedActionTemplate) => void
    setFilters: (type: TemplatesType, filters: Partial<TemplateFilters>) => void
    setSearch: (type: TemplatesType, search: string) => void
    resetFilters: () => void
    setSelectedTemplates: (templates: ITemplate[]) => void
    setRowSelection: (updater: RowSelectionUpdater) => void
    resetSelection: () => void
}

const INITIAL_FILTERS: StoreTemplatesFilters = {
    reports: {},
    posts: {},
}

const INITIAL_SEARCH: StoreTemplatesSearch = {
    reports: '',
    posts: '',
}

const useTemplatesStore = create<StoreTemplatesState & Actions>((set) => ({
    actionDialogOpen: null,
    selectedTemplate: null,
    filters: { ...INITIAL_FILTERS },
    search: { ...INITIAL_SEARCH },
    selectedTemplates: [],
    rowSelection: {},
    setSelectedTemplate: (value: SelectedTemplate, action: SelectedActionTemplate = null) => set(() => ({
        selectedTemplate: value,
        actionDialogOpen: action
    })),
    setFilters: (type, filters) => set(state => ({
        filters: { ...state.filters, [type]: filters }
    })),
    setSearch: (type, search) => set(state => ({
        search: { ...state.search, [type]: search }
    })),
    resetFilters: () => set(() => ({ filters: { ...INITIAL_FILTERS }, search: { ...INITIAL_SEARCH } })),
    setSelectedTemplates: (selectedTemplates: ITemplate[]) => set(() => ({ selectedTemplates })),
    setRowSelection: (updater: RowSelectionUpdater) => set((state) => ({
        rowSelection: typeof updater === 'function' ? updater(state.rowSelection) : updater
    })),
    resetSelection: () => set(() => ({ selectedTemplates: [], rowSelection: {} })),
}))

export default useTemplatesStore
