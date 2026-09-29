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
    /** Activa: si la app sólo la deja entrar a pagar. Dada de baja: si así quedaría al reactivarla. */
    account_blocked: boolean
    /** Dada de baja: el mes en curso que se le crearía al reactivarla (null si ya lo debe o no se le cobra por fecha). */
    on_reactivation?: { period: string, amount: number } | null
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
