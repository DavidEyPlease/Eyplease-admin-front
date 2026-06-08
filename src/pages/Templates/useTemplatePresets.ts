import { API_ROUTES } from "@/constants/api"
import useFetchQuery, { UseFetchResult } from "@/hooks/useFetchQuery"
import { ITemplatePreset } from "@/interfaces/templates"
import { queryKeys } from "@/utils/queryKeys"

// Presets rarely change (static catalog on the backend), so we hold the
// result for an hour. The dropdown shows the latest list on first load
// and falls back to cache on subsequent visits.
const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Fetches the AI presets catalog from the backend. Single network call
 * per session under normal use; shared across every component that uses
 * the hook thanks to react-query's cache.
 */
const useTemplatePresets = (): UseFetchResult<ITemplatePreset[]> => {
    return useFetchQuery<ITemplatePreset[]>(API_ROUTES.TEMPLATES.PRESETS, {
        customQueryKey: queryKeys.list("template-presets"),
        staleTime: ONE_HOUR_MS,
    })
}

export default useTemplatePresets
