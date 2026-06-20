import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { FinanceSummary } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"

/**
 * Financial summary (year series + portfolio aggregates + selected-month
 * metrics), computed server-side. Filterable by year and month.
 */
export const useFinanceSummary = (year: number, month: number) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<FinanceSummary>(
        API_ROUTES.FINANCE.SUMMARY,
        {
            queryParams: { year, month },
            customQueryKey: queryKeys.list("finance-summary", { year, month }),
        }
    )

    return { summary: response, loading, isRefetching, error, fetchRetry }
}

export default useFinanceSummary
