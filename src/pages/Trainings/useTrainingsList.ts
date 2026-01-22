import { useCallback, useEffect } from "react"

import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useListQuery from "@/hooks/useListQuery"
import { ITraining } from "@/interfaces/training"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"
import { PaginationResponse } from "@/interfaces/common"
import useTrainingsStore from "@/store/trainings"

const useTrainingsList = () => {
    const store = useTrainingsStore(state => state)

    const { response: trainings, isLoading, search, setSearch, setData } = useListQuery<PaginationResponse<ITraining>>({
        endpoint: API_ROUTES.TRAININGS.LIST,
        customQueryKey: (params) => queryKeys.list('trainings-list', params)
    })

    const handleListUpdate = useCallback((event: BrowserEvent<ITraining>) => {
        if (!trainings) return;

        const { action = 'updated', ...eventData } = event.detail;

        const actions: Record<string, (items: ITraining[]) => ITraining[]> = {
            created: (items) => [eventData, ...items],
            updated: (items) => items.map(item => item.id === eventData.id ? { ...item, ...eventData } : item),
            deleted: (items) => items.filter(item => item.id !== eventData.id)
        }
        const updatedItems = actions[action] ? actions[action](trainings.items) : trainings.items;
        setData({
            ...trainings,
            items: updatedItems
        })
    }, [trainings?.items])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, handleListUpdate as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, handleListUpdate as EventListener)
        }
    }, [handleListUpdate])

    return {
        trainings,
        isLoading,
        search,
        ...store,
        setSearch
    }
}

export default useTrainingsList;