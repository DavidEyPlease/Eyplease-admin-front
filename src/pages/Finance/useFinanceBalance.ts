import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { FinanceBalance } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"

/**
 * Income vs. expense balance for a year (12-month series + year totals),
 * computed server-side. Filterable by year.
 */
export const useFinanceBalance = (year: number) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<FinanceBalance>(
        API_ROUTES.FINANCE.BALANCE,
        {
            queryParams: { year },
            customQueryKey: queryKeys.list("finance-balance", { year }),
        }
    )

    return { balance: response, loading, isRefetching, error, fetchRetry }
}

export default useFinanceBalance
