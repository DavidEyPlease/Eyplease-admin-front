import { ITemplate } from '@/interfaces/templates'
import { TemplateFilters } from '@/pages/Templates/page-utils'
import { RowSelectionState } from '@tanstack/react-table'
import { create } from 'zustand'

type SelectedTemplate = ITemplate | null
type SelectedActionTemplate = 'view' | 'edit' | 'manageClient' | null
type RowSelectionUpdater = RowSelectionState | ((old: RowSelectionState) => RowSelectionState)

type State = {
    actionDialogOpen: SelectedActionTemplate
    selectedTemplate: SelectedTemplate
    filters: Partial<TemplateFilters>
    search: string
    selectedTemplates: ITemplate[]
    rowSelection: RowSelectionState
}

type Actions = {
    setSelectedTemplate: (value: SelectedTemplate, action?: SelectedActionTemplate) => void
    setFilters: (filters: Partial<TemplateFilters>) => void
    setSearch: (search: string) => void
    resetFilters: () => void
    setSelectedTemplates: (templates: ITemplate[]) => void
    setRowSelection: (updater: RowSelectionUpdater) => void
    resetSelection: () => void
}

const useTemplatesStore = create<State & Actions>((set) => ({
    actionDialogOpen: null,
    selectedTemplate: null,
    filters: {},
    search: '',
    selectedTemplates: [],
    rowSelection: {},
    setSelectedTemplate: (value: SelectedTemplate, action: SelectedActionTemplate = null) => set(() => ({
        selectedTemplate: value,
        actionDialogOpen: action
    })),
    setFilters: (filters: Partial<TemplateFilters>) => set(() => ({ filters })),
    setSearch: (search: string) => set(() => ({ search })),
    resetFilters: () => set(() => ({ filters: {}, search: '' })),
    setSelectedTemplates: (selectedTemplates: ITemplate[]) => set(() => ({ selectedTemplates })),
    setRowSelection: (updater: RowSelectionUpdater) => set((state) => ({
        rowSelection: typeof updater === 'function' ? updater(state.rowSelection) : updater
    })),
    resetSelection: () => set(() => ({ selectedTemplates: [], rowSelection: {} })),
}))

export default useTemplatesStore
