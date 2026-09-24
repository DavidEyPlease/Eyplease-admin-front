import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { PaginationResponse } from '@/interfaces/common'
import { DirectorProspect, PlanGift, PlanInterest } from '@/interfaces/sales'
import { queryKeys } from '@/utils/queryKeys'

export type SalesTab = 'gifts' | 'interests' | 'prospects'

const ENDPOINTS: Record<SalesTab, string> = {
    gifts: API_ROUTES.SALES.PLAN_GIFTS,
    interests: API_ROUTES.SALES.PLAN_INTERESTS,
    prospects: API_ROUTES.SALES.DIRECTOR_PROSPECTS,
}

const PER_PAGE = 20

/** HttpService lanza el JSON de la API, no un Error: el mensaje útil viene en `.message`. */
const showServerError = (error: unknown) => {
    const message = (error as { message?: string })?.message
    toast.error(message || 'No se pudo guardar. Intenta de nuevo.')
}

/** Una lista de Ventas, paginada, con el filtro "sólo pendientes". El `pending=1` lo entiende la API en las tres. */
export const useSalesList = <T,>(tab: SalesTab, pendingOnly: boolean) => {
    const [page, setPage] = useState(1)
    const queryParams = useMemo(() => ({ page, perPage: PER_PAGE, ...(pendingOnly ? { pending: 1 } : {}), ...(tab === 'interests' ? { days: 60 } : {}) }), [page, pendingOnly, tab])
    const query = useFetchQuery<PaginationResponse<T>>(ENDPOINTS[tab], {
        queryParams,
        customQueryKey: queryKeys.list(`sales/${tab}`, queryParams),
        staleTime: 60 * 1000,
    })

    return { ...query, page, setPage, perPage: PER_PAGE }
}

/** Marcar contactada / activado. Refresca las listas de esa pestaña al terminar. */
export const useSalesActions = () => {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery({ onError: showServerError })
    const [busy, setBusy] = useState<string | null>(null)

    const run = async (tab: SalesTab, id: string, url: string, body: Record<string, boolean>) => {
        setBusy(id)
        try {
            await request('PATCH', url.replace('{id}', id), body)
            await queryClient.invalidateQueries({ queryKey: queryKeys.listBase(`sales/${tab}`) })
        } finally {
            setBusy(null)
        }
    }

    return {
        busy,
        setInterestContacted: (item: PlanInterest, contacted: boolean) => run('interests', item.id, API_ROUTES.SALES.PLAN_INTEREST_CONTACTED, { contacted }),
        setGiftContacted: (item: PlanGift, contacted: boolean) => run('gifts', item.id, API_ROUTES.SALES.PLAN_GIFT_CONTACTED, { contacted }),
        setGiftFulfilled: (item: PlanGift, fulfilled: boolean) => run('gifts', item.id, API_ROUTES.SALES.PLAN_GIFT_FULFILLED, { fulfilled }),
    }
}

export type { DirectorProspect, PlanGift, PlanInterest }
