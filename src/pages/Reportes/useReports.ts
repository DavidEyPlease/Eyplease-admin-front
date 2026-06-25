import { useMemo } from "react"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { PaginationResponse } from "@/interfaces/common"
import { queryKeys } from "@/utils/queryKeys"
import { SECTION_CATALOG, BOLETIN_PLANS, DAILY_KEY } from "./reports.constants"

/* ----------------------------- Tipos API ----------------------------- */
export interface ReportMetrics {
    active_clients: number
    total_upload_reports: number
    upload_percentage: number
    missing_reports: number
    inactive: number
    pending_payment: number
}

interface ApiUpload {
    id: string
    user?: { id: string; name?: string; username?: string }
    newsletter?: { code?: string; importDisplayName?: string; name?: string }
    newsletter_section?: { sectionKey?: string; name?: string }
    status: string
    error_message: string | null
    created_at: string
}

interface ApiClient {
    id: string
    name?: string
    account?: string
    user?: { id?: string; username?: string; active?: number | boolean; plan?: { name?: string } | null }
}

/* ----------------------------- Hooks base ----------------------------- */
export const useReportMetrics = () => {
    const { response, loading, isRefetching } = useFetchQuery<ReportMetrics>(API_ROUTES.CLIENTS.METRICS, {
        customQueryKey: queryKeys.generic("report-metrics"),
    })
    return { metrics: response, loading, isRefetching }
}

const usePeriodUploads = (period: string) => {
    const { response, loading, isRefetching } = useFetchQuery<PaginationResponse<ApiUpload>>(API_ROUTES.REPORTS.GET_UPLOADS, {
        queryParams: { year_month: period, perPage: 1000 },
        customQueryKey: queryKeys.list("report-uploads", { period }),
    })
    return { uploads: response?.items ?? [], loading, isRefetching }
}

// Todos los clientes (sin filtrar por active): el flag "active" es poco fiable
// para boletín — hay clientes marcados inactivos que sí suben su boletín. El
// filtrado real se hace en buildGrid (plan + actividad).
const useAllClients = () => {
    const { response, loading, isRefetching } = useFetchQuery<PaginationResponse<ApiClient>>(API_ROUTES.CLIENTS.LIST, {
        queryParams: { perPage: 1000 },
        customQueryKey: queryKeys.list("report-clients", { all: true }),
    })
    return { clients: response?.items ?? [], loading, isRefetching }
}

/* ----------------------------- Tipos derivados ----------------------------- */
export interface GridRow {
    uid: string
    name: string
    account: string
    plan: string
    active: boolean
    cells: Record<string, string>
}
export interface SectionStat {
    Y: number
    done: number
    failed: number
    proc: number
    missing: number
}
export interface DailyStat {
    done: number
    failed: number
    last: string | null
}

/**
 * Rejilla cliente × sección respetando el derecho por plan, más las
 * estadísticas por sección (cargados/esperados) y el indicador diario.
 */
export const useReportGrid = (period: string) => {
    const { clients, loading: lc } = useAllClients()
    const { uploads, loading: lu } = usePeriodUploads(period)

    const data = useMemo(() => {
        // uid -> { sectionKey: status }  (completed gana si hay varios)
        const status = new Map<string, Record<string, string>>()
        uploads.forEach((u) => {
            const uid = u.user?.id
            const k = u.newsletter_section?.sectionKey
            if (!uid || !k) return
            if (!status.has(uid)) status.set(uid, {})
            const cur = status.get(uid)!
            if (cur[k] !== "completed") cur[k] = u.status
        })

        const boletinClients = clients
            .map((c) => ({
                uid: c.user?.id ?? c.id,
                name: c.name ?? "—",
                account: c.account ?? c.user?.username ?? "",
                plan: c.user?.plan?.name ?? "",
                active: !!(c.user?.active),
            }))
            // Todos los clientes en un plan con boletín (el flag active no es
            // fiable para esto). Los inactivos se marcan con etiqueta en la matriz.
            .filter((c) => BOLETIN_PLANS.includes(c.plan))
            .sort((a, b) => a.name.localeCompare(b.name))

        const stats: Record<string, SectionStat> = {}
        SECTION_CATALOG.forEach((s) => (stats[s.key] = { Y: 0, done: 0, failed: 0, proc: 0, missing: 0 }))

        const rows: GridRow[] = boletinClients.map((c) => {
            const up = status.get(c.uid) || {}
            const cells: Record<string, string> = {}
            SECTION_CATALOG.forEach((s) => {
                if (!s.plans.includes(c.plan)) {
                    cells[s.key] = "na"
                    return
                }
                const st = up[s.key] || "missing"
                cells[s.key] = st
                const acc = stats[s.key]
                acc.Y++
                if (st === "completed") acc.done++
                else if (st === "failed") acc.failed++
                else if (st === "processing") acc.proc++
                else acc.missing++
            })
            return { ...c, cells }
        })

        const early = uploads.filter((u) => u.newsletter_section?.sectionKey === DAILY_KEY)
        const daily: DailyStat = {
            done: new Set(early.filter((u) => u.status === "completed").map((u) => u.user?.id)).size,
            failed: new Set(early.filter((u) => u.status === "failed").map((u) => u.user?.id)).size,
            last: early.map((u) => u.created_at).sort().pop() ?? null,
        }

        return { rows, stats, daily }
    }, [clients, uploads])

    return { ...data, loading: lc || lu }
}

/* Subidas rechazadas del periodo (para la pestaña Rechazos). */
export interface RejectedUpload {
    id: string
    name: string
    account: string
    section: string
    reason: string | null
    created_at: string
}
export const useRejectedUploads = (period: string) => {
    const { response, loading } = useFetchQuery<PaginationResponse<ApiUpload>>(API_ROUTES.REPORTS.GET_UPLOADS, {
        queryParams: { year_month: period, status: "failed", perPage: 200 },
        customQueryKey: queryKeys.list("report-uploads-failed", { period }),
    })
    const items: RejectedUpload[] = useMemo(
        () =>
            (response?.items ?? []).map((u) => ({
                id: u.id,
                name: u.user?.name ?? "—",
                account: u.user?.username ?? "",
                section: `${u.newsletter?.importDisplayName || u.newsletter?.name || ""} · ${u.newsletter_section?.name || ""}`,
                reason: u.error_message,
                created_at: u.created_at,
            })),
        [response]
    )
    return { items, loading }
}

/* Disparo de importación (endpoint real, encola RunReportImportCommandJob). */
export interface DispatchImportInput {
    month: number
    type: "unit_newsletter" | "national_newsletter"
    sections?: string[]
}
export const useDispatchImport = () => {
    const { request, requestState } = useRequestQuery()
    const dispatch = (body: DispatchImportInput) => request("POST", API_ROUTES.REPORTS.DISPATCH_IMPORT_JOB, body)
    return { dispatch, dispatching: requestState.loading }
}
