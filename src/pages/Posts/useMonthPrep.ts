import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { ApiResponse } from '@/interfaces/common'
import { MonthPrepResponse } from '@/interfaces/monthPrep'
import { queryKeys } from '@/utils/queryKeys'

const prepKey = (period: string) => queryKeys.list('month-prep', { period })

/**
 * Preparar el mes. La API guarda la revisión de los diseños y la refresca sola cada hora y al subir una plantilla;
 * aquí se vuelve a pedir cada 5 min mientras la página está abierta. «Revisar ahora» pide la cuenta desde cero.
 */
export const useMonthPrep = (period: string, enabled = true) => {
    const { response, loading, isRefetching, setData } = useFetchQuery<MonthPrepResponse>(API_ROUTES.MONTH_PREP.INDEX, {
        queryParams: { period },
        customQueryKey: prepKey(period),
        staleTime: 60_000,
        refetchInterval: 5 * 60_000,
        enabled,
    })

    return { prep: response, loading: loading && !response, isRefetching, setPrep: setData }
}

/** Palomear a mano, «no va este mes» y los pendientes propios. Cada acción devuelve la lista ya al día. */
export const useMonthPrepActions = (period: string, setPrep: (data: MonthPrepResponse) => void) => {
    const { request, requestState } = useRequestQuery({ onError: () => undefined })

    const send = async (url: string, body: Record<string, unknown>, ok: string, fail: string) => {
        try {
            const result = await request<Record<string, unknown>, MonthPrepResponse>('POST', url, { period, ...body }) as ApiResponse<MonthPrepResponse>
            if (result?.data) setPrep(result.data)
            if (ok) toast.success(ok)
            return true
        } catch {
            toast.error(fail)
            return false
        }
    }

    return {
        saving: requestState.loading,
        /** `done` = listo, `skip` = no va este mes, null = quitar la marca */
        mark: (key: string, state: 'done' | 'skip' | null, note?: string) => send(
            API_ROUTES.MONTH_PREP.MARKS,
            { key, state, note: note ?? null },
            state === 'skip' ? 'Marcado: no va este mes' : state === 'done' ? 'Palomeado' : 'Se quitó la marca',
            'No se pudo guardar la marca',
        ),
        addCustom: (title: string) => send(API_ROUTES.MONTH_PREP.CUSTOM, { title }, 'Pendiente agregado', 'No se pudo agregar'),
        toggleCustom: (id: string, done: boolean) => send(API_ROUTES.MONTH_PREP.CUSTOM_TOGGLE, { id, done }, '', 'No se pudo guardar'),
        removeCustom: (id: string) => send(API_ROUTES.MONTH_PREP.CUSTOM_REMOVE, { id }, 'Pendiente quitado', 'No se pudo quitar'),
    }
}

/** «Revisar ahora»: la API vuelve a revisar los diseños (tarda unos segundos). */
export const useMonthPrepRefresh = (period: string, setPrep: (data: MonthPrepResponse) => void) => {
    const { request, requestState } = useRequestQuery({ onError: () => undefined })

    const refresh = async () => {
        try {
            const result = await request<undefined, MonthPrepResponse>('GET', `${API_ROUTES.MONTH_PREP.INDEX}?period=${period}&fresh=1`) as ApiResponse<MonthPrepResponse>
            if (result?.data) setPrep(result.data)
        } catch {
            toast.error('No se pudo revisar')
        }
    }

    return { refresh, refreshing: requestState.loading }
}
