import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { replaceRecordIdInPath } from '@/utils'
import { queryKeys } from '@/utils/queryKeys'

/** Un mes sin pagar y lo que falta de él */
export interface DebtPeriod {
    period: string
    remaining: number
    status: string | null
}

/** Lo que debe una clienta en TODOS sus años y si, activa, la app sólo la dejaría entrar a pagar */
export interface ClientDebt {
    total: number
    currency: string
    periods: DebtPeriod[]
    days_overdue: number
    account_blocked: boolean
}

/**
 * Lo que debe la clienta, para avisarlo antes de activarla o desactivarla: una baja conserva su deuda
 * y le vuelve a aparecer si regresa. Se pide al abrir el diálogo y siempre fresco, porque un pago
 * registrado hace un minuto tiene que contar.
 */
const useClientDebt = (clientId: string | null) => {
    const { response, loading, error } = useFetchQuery<ClientDebt>(
        replaceRecordIdInPath(API_ROUTES.CLIENTS.DEBT, clientId ?? ''),
        {
            customQueryKey: queryKeys.generic('client-debt', { clientId }),
            enabled: !!clientId,
            staleTime: 0,
        }
    )

    return { debt: response ?? null, loading: !!clientId && loading, failed: !!error }
}

export default useClientDebt
