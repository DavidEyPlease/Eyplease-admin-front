import { ITraining } from '@/interfaces/training'
import { create } from 'zustand'

type SelectedTraining = ITraining | null
type SelectedActionTraining = 'files' | 'edit' | 'create' | null

type State = {
    actionDialogOpen: SelectedActionTraining
    selectedTraining: SelectedTraining
}

type Actions = {
    setSelectedTraining: (value: SelectedTraining, action?: SelectedActionTraining) => void
    setActionDialogOpen: (value: SelectedActionTraining) => void
}

const useTrainingsStore = create<State & Actions>((set) => ({
    actionDialogOpen: null,
    selectedTraining: null,
    setSelectedTraining: (value: SelectedTraining, action: SelectedActionTraining = null) => set(() => ({
        selectedTraining: value,
        actionDialogOpen: action
    })),
    setActionDialogOpen: (value: SelectedActionTraining) => set(() => ({
        actionDialogOpen: value
    }))
}))

export default useTrainingsStore