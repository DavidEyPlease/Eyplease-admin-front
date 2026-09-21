import { useQueryClient } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import useRequestQuery from '@/hooks/useRequestQuery'
import { IClientListItem } from '@/interfaces/clients'
import { PaginationResponse } from '@/interfaces/common'
import { queryKeys } from '@/utils/queryKeys'

/**
 * Activar o desactivar una clienta desde el padrón «Estado».
 *
 * Es el MISMO endpoint que el interruptor de la «Tabla de trabajo» (`change-status`); lo que cambia es
 * a quién avisa después: el tablero guarda su lista en su propia caché (`clients/board`, todas de una
 * vez), así que se corrige en sitio para que la fila cambie al instante sin volver a pedir las 160, y
 * la tabla de siempre se marca como vieja para que al abrirla ya salga bien.
 */
const useClientStatus = () => {
    const queryClient = useQueryClient()
    const { request, requestState } = useRequestQuery({ onError: () => { } })

    const setActive = async (clientId: string, active: boolean) => {
        const response = await request<{ active: boolean }, unknown>(
            'PATCH',
            API_ROUTES.CLIENTS.SET_STATUS.replace('{id}', clientId),
            { active },
        )

        if (!response?.success) {
            throw new Error(response?.message || 'No se pudo cambiar el estado')
        }

        queryClient.setQueryData<PaginationResponse<IClientListItem>>(queryKeys.list('clients/board'), old => old && {
            ...old,
            items: old.items.map(item => item.id === clientId
                ? { ...item, user: { ...item.user, active } } as IClientListItem
                : item),
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.listBase('clients/list') })
    }

    return { setActive, busy: requestState.loading }
}

export default useClientStatus
