import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useListQuery from "@/hooks/useListQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"
import { useCallback, useEffect, useState } from "react"
import { TemplateFilters } from "./page-utils"

const useTemplates = (defaultFilters?: Partial<TemplateFilters>) => {
    const store = useTemplatesStore(state => state)
    const {
        setFilters: setStoreFilters,
        setSearch: setStoreSearch,
        filters: storeFilters,
        search: storeSearch,
    } = store

    const [initialFilters] = useState<Partial<TemplateFilters>>(() => ({
        ...storeFilters,
        ...defaultFilters,
    }))
    const [initialSearch] = useState<string>(() => storeSearch)

    const listQuery = useListQuery<ITemplate[], TemplateFilters>({
        endpoint: API_ROUTES.TEMPLATES.LIST,
        defaultFilters: initialFilters,
        defaultSearch: initialSearch,
        customQueryKey: (params) => queryKeys.list('config/templates', params),
        requireActiveFilters: true,
    })

    const { response: templates, setData, filters, search } = listQuery

    useEffect(() => {
        setStoreFilters(filters)
    }, [filters, setStoreFilters])

    useEffect(() => {
        setStoreSearch(search)
    }, [search, setStoreSearch])

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
        ...store,
        ...listQuery,
        templates,
    }
}

export default useTemplates;
