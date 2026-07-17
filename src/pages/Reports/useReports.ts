import { useMemo } from "react"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { queryKeys } from "@/utils/queryKeys"

/* ----------------------------- Resumen (tab Resumen) ----------------------------- */
export type NewsletterGroupKey = "unit" | "national"

export interface SummarySection {
    section_key: string
    name: string
    group: NewsletterGroupKey
    expected: number
    done: number
}

export interface SummaryKpis {
    entitled_clients: number
    avance_pct: number
    total_expected: number
    total_done: number
    missing: number
    rejected: number
}

export interface ReportSummary {
    kpis: SummaryKpis
    sections: SummarySection[]
}

export interface MissingClient {
    user_id: string
    name: string
    account: string
    status: "missing" | "failed"
    last_upload_at: string | null
}

export interface SectionMissing {
    section_id: string
    section_key: string
    year_month: string
    clients: MissingClient[]
}

/**
 * KPIs + estadísticas por sección del periodo. Todo el derecho por plan y el
 * conteo cargados/esperados lo resuelve el backend (endpoint /reports/summary).
 */
export const useReportSummary = (period: string) => {
    const { response, loading, isRefetching } = useFetchQuery<ReportSummary>(API_ROUTES.REPORTS.SUMMARY, {
        queryParams: { year_month: period },
        customQueryKey: queryKeys.generic("report-summary", { period }),
    })
    return { summary: response, loading, isRefetching }
}

export interface EarlyDaily {
    date: string
    loaded: number
    rejected: number
    last_at: string | null
}

/** Tempraneras: flujo diario (sección "early"). Cargadas/rechazadas del día de hoy. */
export const useEarlyDaily = () => {
    const { response, loading } = useFetchQuery<EarlyDaily>(API_ROUTES.REPORTS.EARLY_DAILY, {
        customQueryKey: queryKeys.generic("report-early-daily"),
    })
    return { early: response, loading }
}

/** Clientes con derecho a una sección que no la tienen cargada (modal "Faltan: …"). */
export const useSectionMissing = (period: string, sectionKey: string | null) => {
    const { response, loading } = useFetchQuery<SectionMissing>(API_ROUTES.REPORTS.SUMMARY_MISSING, {
        queryParams: { year_month: period, section_key: sectionKey ?? "" },
        customQueryKey: queryKeys.list("report-summary-missing", { period, sectionKey }),
        enabled: !!sectionKey,
    })
    return { data: response, loading }
}

/* ----------------------------- Estado por cliente (tab Estado) ----------------------------- */
export interface SectionCatalog {
    section_key: string
    name: string
    group: NewsletterGroupKey
    plans: string[]
}

export interface ClientStatus {
    id: string
    name: string
    account: string
    plan: string
    cells: Record<string, string>
}

interface ClientsStatusResponse {
    sections: SectionCatalog[]
    clients: ClientStatus[]
}

/**
 * Matriz cliente × sección del tab "Estado por cliente": columnas (catálogo con los planes
 * que conceden cada sección) + estado de cada celda. Todo resuelto en el backend (derecho por
 * plan real, demo excluidas, mes por-sección); el front no hardcodea catálogo ni planes.
 */
export const useClientsStatus = (period: string) => {
    const { response, loading } = useFetchQuery<ClientsStatusResponse>(API_ROUTES.REPORTS.CLIENTS_STATUS, {
        queryParams: { year_month: period },
        customQueryKey: queryKeys.generic("report-clients-status", { period }),
    })
    return { sections: response?.sections ?? [], clients: response?.clients ?? [], loading }
}

/* Subidas rechazadas del periodo (tab Rechazos). Mismo universo que el KPI "Rechazados"
 * del Resumen: demo excluidas y mes por-sección (cumples/aniv +1) — resuelto en el backend. */
interface ApiRejected {
    id: string
    name: string
    account: string
    newsletter: string
    section: string
    reason: string | null
    created_at: string
}

export interface RejectedUpload {
    id: string
    name: string
    account: string
    section: string
    reason: string | null
    created_at: string
}

export const useRejectedUploads = (period: string) => {
    const { response, loading } = useFetchQuery<ApiRejected[]>(API_ROUTES.REPORTS.REJECTED, {
        queryParams: { year_month: period },
        customQueryKey: queryKeys.list("report-rejected", { period }),
    })
    const items: RejectedUpload[] = useMemo(
        () =>
            (response ?? []).map((u) => ({
                id: u.id,
                name: u.name || "—",
                account: u.account || "",
                section: `${u.newsletter || ""} · ${u.section || ""}`,
                reason: u.reason,
                created_at: u.created_at,
            })),
        [response]
    )
    return { items, loading }
}

/* Disparo de importación (endpoint real, encola RunReportImportCommandJob). */
export interface DispatchImportInput {
    month: number
    type: string
    sections?: string[]
    only_new?: boolean
}
export const useDispatchImport = () => {
    const { request, requestState } = useRequestQuery()
    const dispatch = (body: DispatchImportInput) => request("POST", API_ROUTES.REPORTS.DISPATCH_IMPORT_JOB, body)
    return { dispatch, dispatching: requestState.loading }
}
