import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useListQuery from "@/hooks/useListQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"
import { useCallback, useEffect } from "react"
import { TemplateFilters } from "./List/page-utils"

const useTemplates = () => {
    const store = useTemplatesStore(state => state)

    const listQuery = useListQuery<ITemplate[], TemplateFilters>({
        endpoint: API_ROUTES.TEMPLATES.LIST,
        customQueryKey: (params) => queryKeys.list('config/templates', params)
    })

    const { response: templates, setData } = listQuery

    const handleTemplateUpdate = useCallback((event: BrowserEvent<ITemplate & { isDeleted?: boolean }>) => {
        if (event.detail.isDeleted) return setData((templates ?? []).filter(item => item.id !== event.detail.id))
        setData((templates ?? []).map(item => {
            return item.id === event.detail.id ? { ...item, ...event.detail } : item
        }))
    }, [templates])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, handleTemplateUpdate as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, handleTemplateUpdate as EventListener)
        }
    }, [handleTemplateUpdate])

    return {
        ...listQuery,
        templates,
        ...store,
    }
}

export default useTemplates;