import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import { replaceRecordIdInPath } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/** Lo que devuelve `GET admin/clients/{id}/insights` (ClientInsightsService en la API). */
export interface ClientInsights {
    month: string
    indicators: {
        month: string
        unit_size: number
        leaders: { count: number, period: string | null }
        ordered: { count: number | null, total: number, source: 'sales' | 'hearts' | null }
        with_hearts: { count: number | null }
        near_gift: { count: number | null }
    }
    production: Array<{ month: string, current: boolean, loaded: boolean, unit_points: number | null, own_points: number | null, ordered: number | null }>
    activity: {
        last_active_at: string | null
        last_sign_in_at: string | null
        has_app: boolean
        devices: Array<{ platform: string | null, model: string | null, since: string | null }>
    }
    usage_days: number
    usage: {
        areas: Array<{ key: string, label: string, total: number, app?: number, web?: number, shared?: number, saved?: number, via_assistant?: number }>
        posts_by_section: Array<{ key: string, label: string, total: number }>
        library_by_section: Array<{ key: string, label: string, total: number }>
    }
    trend: Array<{ month: string, posts_shared: number, assistant_messages: number }>
}

const useClientInsights = (clientId: string) => useFetchQuery<ClientInsights>(replaceRecordIdInPath(API_ROUTES.CLIENTS.INSIGHTS, clientId), {
    customQueryKey: queryKeys.detail('client-insights', clientId),
    enabled: !!clientId,
    staleTime: 60_000,
})

export default useClientInsights

/** «hace 5 min», «hace 3 h», «ayer», «hace 12 días» */
export const ago = (value: string | null | undefined) => {
    if (!value) return null
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
    if (minutes < 2) return 'ahora mismo'
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `hace ${hours} h`
    const days = Math.round(hours / 24)
    if (days === 1) return 'ayer'
    if (days < 60) return `hace ${days} días`
    return `hace ${Math.round(days / 30)} meses`
}

const PLATFORMS: Record<string, string> = { ios: 'iPhone', android: 'Android' }

/** «la app en Android» / «la app en iPhone y Android» / null si no la tiene */
export const appDevices = (devices: ClientInsights['activity']['devices']) => {
    const names = [...new Set(devices.map(device => PLATFORMS[(device.platform || '').toLowerCase()] ?? device.platform).filter(Boolean))]
    return names.length ? `la app en ${names.join(' y ')}` : null
}
