import { useMemo } from 'react'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { IClientListItem } from '@/interfaces/clients'
import { PaginationResponse } from '@/interfaces/common'
import { defaultPeriod, STATUS_LOADED } from '@/pages/Reports/reports.constants'
import { ClientStatus } from '@/pages/Reports/useReports'
import { queryKeys } from '@/utils/queryKeys'

/** Todas caben en una sola carga (la cartera son ~100); así buscar, filtrar y ordenar es instantáneo */
const ALL = 500

export type PaymentState = 'ok' | 'pending' | 'in_review' | 'overdue' | 'unknown'

export interface BoardClient {
    client: IClientListItem
    payment: PaymentState
    /** Reportes del mes cargados / a los que su plan le da derecho; null si no aplica */
    reports: { loaded: number, entitled: number } | null
    hasPortalPassword: boolean
}

interface FinanceIds { items: Array<{ id: string | null }> }

const accountsOf = (response?: FinanceIds) => new Set((response?.items ?? []).map(item => item.id).filter((id): id is string => !!id))

/**
 * El padrón con TODO su estado en una fila: a la lista de clientas de siempre se le cruzan, por
 * número de cuenta, la cobranza del año (quién debe, quién está por vencer, quién espera
 * validación) y la matriz de reportes del mes. Nada se calcula aquí que el servidor no haya
 * decidido: sólo se junta.
 */
const useClientsBoard = () => {
    const year = new Date().getFullYear()
    const period = defaultPeriod()

    const clients = useFetchQuery<PaginationResponse<IClientListItem>>(API_ROUTES.CLIENTS.LIST, {
        queryParams: { page: 1, perPage: ALL, sort_by: 'previous_month_points', sort_order: 'desc' },
        customQueryKey: queryKeys.list('clients/board'),
        staleTime: 60_000,
    })

    const finance = (status: string) => ({
        queryParams: { year, page: 1, perPage: ALL, collection_status: status },
        customQueryKey: queryKeys.list('clients/board-finance', { year, status }),
        staleTime: 60_000,
    })
    const overdue = useFetchQuery<FinanceIds>(API_ROUTES.FINANCE.CLIENTS, finance('overdue'))
    const inReview = useFetchQuery<FinanceIds>(API_ROUTES.FINANCE.CLIENTS, finance('in_review'))
    const pending = useFetchQuery<FinanceIds>(API_ROUTES.FINANCE.CLIENTS, finance('pending'))

    const matrix = useFetchQuery<{ clients: ClientStatus[] }>(API_ROUTES.REPORTS.CLIENTS_STATUS, {
        queryParams: { year_month: period },
        customQueryKey: queryKeys.generic('report-clients-status', { period }),
        staleTime: 60_000,
    })

    const rows = useMemo<BoardClient[]>(() => {
        const late = accountsOf(overdue.response)
        const review = accountsOf(inReview.response)
        const soon = accountsOf(pending.response)
        const financeReady = !!overdue.response && !!inReview.response && !!pending.response
        const reportsByAccount = new Map((matrix.response?.clients ?? []).map(item => [item.account, item]))

        return (clients.response?.items ?? []).map(client => {
            const status = reportsByAccount.get(client.account)
            const cells = status ? Object.values(status.cells) : []
            return {
                client,
                /* El orden importa: quien debe, debe, aunque además tenga un pago por vencer */
                payment: !financeReady ? 'unknown' : late.has(client.account) ? 'overdue' : review.has(client.account) ? 'in_review' : soon.has(client.account) ? 'pending' : 'ok',
                reports: cells.length ? { loaded: cells.filter(cell => cell === STATUS_LOADED).length, entitled: cells.length } : null,
                hasPortalPassword: !!client.external_company_pw,
            }
        })
    }, [clients.response, overdue.response, inReview.response, pending.response, matrix.response])

    return { rows, loading: clients.loading && !clients.response, period }
}

export default useClientsBoard
