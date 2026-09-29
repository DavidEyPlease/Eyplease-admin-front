import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { GrowthContact, GrowthFunnelResponse, GrowthPeriod, GrowthProspect, GrowthProspectsResponse } from '@/interfaces/growth'
import { firstName } from '@/pages/Sales/sales.utils'
import { queryKeys } from '@/utils/queryKeys'

import { GROUPS, recentlyWritten } from './growth.utils'

export const useGrowthFunnel = (period: GrowthPeriod) => {
    const queryParams = useMemo(() => ({ period }), [period])
    return useFetchQuery<GrowthFunnelResponse>(API_ROUTES.GROWTH.FUNNEL, {
        queryParams,
        customQueryKey: queryKeys.list('growth/funnel', queryParams),
        staleTime: 60 * 1000,
    })
}

const GROUP_ORDER = Object.fromEntries(GROUPS.map((group, index) => [group.key, index]))

/**
 * Los prospectos ordenados como conviene escribirles: por grupo y, dentro, primero a quien no le has escrito
 * (o le escribiste hace más de 2 días sin respuesta) y luego lo más reciente.
 */
export const useGrowthProspects = () => {
    const queryParams = useMemo(() => ({ days: 60 }), [])
    const query = useFetchQuery<GrowthProspectsResponse>(API_ROUTES.GROWTH.PROSPECTS, {
        queryParams,
        customQueryKey: queryKeys.list('growth/prospects', queryParams),
        staleTime: 60 * 1000,
    })

    const rows = useMemo(() => [...(query.response?.items ?? [])].sort((a, b) => {
        const group = GROUP_ORDER[a.group] - GROUP_ORDER[b.group]
        if (group) return group
        const written = Number(recentlyWritten(a)) - Number(recentlyWritten(b))
        if (written) return written
        const last = (row: GrowthProspect) => Date.parse(row.last_activity_at ?? row.registered_at) || 0
        return last(b) - last(a)
    }), [query.response])

    return { ...query, rows }
}

/** HttpService lanza el JSON de la API, no un Error: el mensaje útil viene en `.message`. */
const showServerError = (error: unknown) => {
    const message = (error as { message?: string })?.message
    toast.error(message || 'No se pudo guardar. Intenta de nuevo.')
}

export const useGrowthActions = () => {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery({ onError: showServerError })
    const [busy, setBusy] = useState<string | null>(null)

    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.listBase('growth/prospects') })

    const run = async <T,>(key: string, fn: () => Promise<T>) => {
        setBusy(key)
        try {
            const result = await fn()
            await refresh()
            return result
        } finally {
            setBusy(null)
        }
    }

    const undo = async (contact: GrowthContact | undefined | null, message: string) => {
        if (!contact?.id) return
        const done = await run(contact.id, () => request('DELETE', API_ROUTES.GROWTH.CONTACT.replace('{id}', contact.id))).catch(() => null)
        if (done) toast.success(message)
    }

    const undoable = (message: string, contact: GrowthContact | undefined, undoMessage: string) =>
        toast.success(message, { action: { label: 'Deshacer', onClick: () => { void undo(contact, undoMessage) } } })

    const log = async (row: GrowthProspect, action: 'written' | 'dropped') => {
        /* El error ya lo avisó `showServerError`: aquí sólo no se sigue */
        const response = await run(row.key, () => request<unknown, GrowthContact>('POST', API_ROUTES.GROWTH.CONTACTS, { target: row.key, action })).catch(() => null)
        if (!response) return
        const name = firstName(row.name) || 'Ella'
        undoable(
            action === 'written' ? `Anotado: le escribiste a ${name}. Si no contesta en 2 días, vuelve a subir.` : `${name} salió de la lista.`,
            response?.data,
            `${name} vuelve a la lista`,
        )
    }

    const toSales = async (row: GrowthProspect) => {
        const response = await run(row.key, () => request<unknown, GrowthContact>(
            'POST',
            API_ROUTES.GROWTH.TO_SALES.replace('{id}', row.id),
            row.suggested_plan ? { plan_id: row.suggested_plan.id } : {},
        )).catch(() => null)
        if (!response) return
        await queryClient.invalidateQueries({ queryKey: queryKeys.listBase('sales/interest') })
        undoable(`${firstName(row.name) || 'Ella'} pasó a Ventas: ya está en «Te esperan».`, response?.data, `${firstName(row.name) || 'Ella'} regresó a Crecimiento`)
    }

    return { busy, log, toSales }
}

export type GrowthActions = ReturnType<typeof useGrowthActions>
