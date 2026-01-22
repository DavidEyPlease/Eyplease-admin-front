import { ITemplate } from '@/interfaces/templates'
import { create } from 'zustand'

type SelectedTemplate = ITemplate | null
type SelectedActionTemplate = 'view' | 'edit' | 'manageClient' | null

type State = {
    actionDialogOpen: SelectedActionTemplate
    selectedTemplate: SelectedTemplate
}

type Actions = {
    setSelectedTemplate: (value: SelectedTemplate, action?: SelectedActionTemplate) => void
}

const useTemplatesStore = create<State & Actions>((set) => ({
    actionDialogOpen: null,
    selectedTemplate: null,
    setSelectedTemplate: (value: SelectedTemplate, action: SelectedActionTemplate = null) => set(() => ({
        selectedTemplate: value,
        actionDialogOpen: action
    })),
}))

export default useTemplatesStore