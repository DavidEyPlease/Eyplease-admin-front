import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ExpenseItem, ExpensePayload } from "@/interfaces/finance"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"

const EXPENSES_ENTITY = "finance-expenses"

/**
 * Server state for the Expenses tab. Fetches the whole year once (react-query
 * cached) so the list, KPIs and the monthly history chart all derive from a
 * single query, and exposes the create/update/delete mutations that invalidate
 * it on success.
 */
export const useExpenses = (year: number) => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<ExpenseItem[]>(
        API_ROUTES.FINANCE.EXPENSES.LIST,
        {
            queryParams: { year },
            customQueryKey: queryKeys.list(EXPENSES_ENTITY, { year }),
        }
    )

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(EXPENSES_ENTITY)],
    })

    const createExpense = (data: ExpensePayload) =>
        request<ExpensePayload, ExpenseItem>("POST", API_ROUTES.FINANCE.EXPENSES.CREATE, data)

    const updateExpense = (id: string, data: ExpensePayload) =>
        request<ExpensePayload, ExpenseItem>(
            "PUT",
            replaceRecordIdInPath(API_ROUTES.FINANCE.EXPENSES.UPDATE, id),
            data
        )

    const deleteExpense = (id: string) =>
        request<undefined, { message: string }>(
            "DELETE",
            replaceRecordIdInPath(API_ROUTES.FINANCE.EXPENSES.DELETE, id)
        )

    return {
        expenses: response ?? [],
        loading,
        isRefetching,
        error,
        fetchRetry,
        createExpense,
        updateExpense,
        deleteExpense,
        mutating: requestState.loading,
    }
}

export default useExpenses
