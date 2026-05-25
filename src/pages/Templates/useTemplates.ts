import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useListQuery from "@/hooks/useListQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore, { TemplatesType } from "@/store/templates"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"
import { useCallback, useEffect, useState } from "react"
import { TemplateFilters } from "./page-utils"

const useTemplates = (templatesType: TemplatesType, defaultFilters?: Partial<TemplateFilters>) => {
    const store = useTemplatesStore(state => state)
    const {
        setFilters: setStoreFilters,
        setSearch: setStoreSearch,
        filters: storeFilters,
        search: storeSearch,
    } = store
    const [initialFilters] = useState<Partial<TemplateFilters>>(() => ({
        ...defaultFilters,
        ...storeFilters[templatesType],
    }))
    const [initialSearch] = useState<string>(() => storeSearch[templatesType] ?? '')

    const listQuery = useListQuery<ITemplate[], TemplateFilters>({
        endpoint: API_ROUTES.TEMPLATES.LIST,
        defaultFilters: initialFilters,
        defaultSearch: initialSearch,
        customQueryKey: (params) => queryKeys.list(`templates/${templatesType}`, params),
        requireActiveFilters: true,
    })

    const { response: templates, setData, filters, search } = listQuery

    useEffect(() => {
        setStoreFilters(templatesType, filters)
    }, [filters, templatesType, setStoreFilters])

    useEffect(() => {
        setStoreSearch(templatesType, search)
    }, [search, templatesType, setStoreSearch])

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
