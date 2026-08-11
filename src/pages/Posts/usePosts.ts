import { useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import {
    IClientCoverageResponse,
    IPostRenderRun,
    IPostsCoverageResponse,
    IPublishPostsPayload,
    PostArtifact,
} from '@/interfaces/posts'
import { queryKeys } from '@/utils/queryKeys'
import { ACTIVE_RUN_STATUSES, CLIENTS_PER_PAGE, periodToMonthNumber, RUNS_POLL_INTERVAL_MS } from './page-utils'

const COVERAGE_STALE_TIME_MS = 60_000

const coverageKey = (period: string, newsletter?: string) => queryKeys.list('posts/coverage', { period, newsletter })
const clientCoverageKey = (params: Record<string, unknown>) => queryKeys.list('posts/coverage/clients', params)
const RUNS_QUERY_KEY = queryKeys.generic('posts/render-runs')

const EMPTY_COVERAGE: IPostsCoverageResponse = {
    period: '',
    snapshot_at: null,
    current_target_period: '',
    sections: [],
}

export const usePostsCoverage = (period: string, newsletter?: string) => {
    const { response, loading, isRefetching } = useFetchQuery<IPostsCoverageResponse>(API_ROUTES.POSTS.COVERAGE, {
        queryParams: { period, newsletter },
        customQueryKey: coverageKey(period, newsletter),
        staleTime: COVERAGE_STALE_TIME_MS,
    })

    return {
        coverage: response ?? EMPTY_COVERAGE,
        loading,
        isRefetching,
    }
}

export const useClientCoverage = (period: string, page: number, newsletter?: string, search?: string) => {
    const queryParams = { period, page, perPage: CLIENTS_PER_PAGE, newsletter, search }

    const { response, loading, isRefetching } = useFetchQuery<IClientCoverageResponse>(API_ROUTES.POSTS.CLIENT_COVERAGE, {
        queryParams,
        customQueryKey: clientCoverageKey(queryParams),
        staleTime: COVERAGE_STALE_TIME_MS,
    })

    /* Cada página y cada búsqueda son una queryKey distinta, así que sin esto la
       tabla se desmonta y da un salto. Se retiene la última respuesta y se atenúa. */
    const lastResponse = useRef<IClientCoverageResponse | null>(null)
    if (response) lastResponse.current = response

    const data = response ?? lastResponse.current

    return {
        clientCoverage: data,
        /* Solo es carga "de verdad" la primera, cuando aún no hay nada que mostrar */
        loading: loading && !data,
        updating: (loading || isRefetching) && !!data,
    }
}

/**
 * Polling condicional: solo mientras haya lotes en queued/running.
 * Mismo patrón que useDownloadRuns en /reportes.
 */
export const usePostRenderRuns = () => {
    const { response, loading } = useFetchQuery<IPostRenderRun[]>(API_ROUTES.POSTS.RUNS, {
        customQueryKey: RUNS_QUERY_KEY,
        refetchInterval: (data) => {
            const runs = data as IPostRenderRun[] | undefined
            return runs?.some(run => ACTIVE_RUN_STATUSES.includes(run.status)) ? RUNS_POLL_INTERVAL_MS : false
        },
    })

    return { runs: response ?? [], loading }
}

/**
 * Publicación. Se manda una petición por sección a propósito: el controlador
 * responde 422 del lote completo si alguna sección tiene has_posts = false, y
 * encadena todo en un único Bus::chain secuencial.
 */
export const usePublishPosts = (period: string) => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [RUNS_QUERY_KEY, queryKeys.listBase('posts/coverage')],
    })

    const publish = async (sectionKeys: string[], artifacts: PostArtifact[]) => {
        if (!sectionKeys.length || !artifacts.length) return false

        const month = periodToMonthNumber(period)
        const results = await Promise.allSettled(
            sectionKeys.map(sectionKey => {
                const payload: IPublishPostsPayload = { month, artifacts, section_keys: [sectionKey] }
                return request('POST', API_ROUTES.POSTS.PUBLISH_NEWSLETTER, payload)
            }),
        )

        const failed = results.filter(result => result.status === 'rejected').length

        if (failed === sectionKeys.length) {
            toast.error('No se pudo encolar ninguna sección')
            return false
        }

        if (failed) {
            toast.warning(`${sectionKeys.length - failed} secciones encoladas · ${failed} fallaron`)
            return true
        }

        toast.success(
            sectionKeys.length === 1
                ? 'Sección encolada para publicación'
                : `${sectionKeys.length} secciones encoladas para publicación`,
        )
        return true
    }

    return { publish, publishing: requestState.loading }
}

/** Totales del periodo. Todo sale de posts + files salvo `pending`, que viene del snapshot. */
export const usePeriodTotals = (coverage: IPostsCoverageResponse) =>
    useMemo(() => {
        const sections = coverage.sections

        return {
            posts: sections.reduce((total, section) => total + section.posts, 0),
            missingVideo: sections.reduce(
                (total, section) => total + (section.artifacts.includes('video') ? section.posts - section.with_video : 0),
                0,
            ),
            emptySections: sections.filter(section => section.posts === 0).length,
            pending: sections.reduce((total, section) => total + (section.pending ?? 0), 0),
            hasPendingData: sections.some(section => section.pending !== null),
        }
    }, [coverage])
