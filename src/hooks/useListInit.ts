import { useState } from 'react'
import useFetch from './useFetch'

type UseListInitResult<T, F> = {
    response: T | undefined;
    isLoading: boolean;
    page: number;
    search: string;
    error: Error | null;
    orderBy: string;
    perPage: number;
    // sort: SortDirectionTypes;
    filters: Partial<F>;
    setData: (_data: T) => void;
    // setFilters: (_filters: FilterValues) => void;
    setSearch: (_query: string) => void;
    setFilter: (_values: Partial<F>) => void;
    onChangePage: (_page: number) => void;
    setSortBy: (_sortBy: string) => void;
    fetchRetry: () => void;
    setPerPage: (_perPage: number) => void;
    // setSortDirection: (_sortDirection: SortDirectionTypes) => void;
};

type UseListInitParams<F = unknown> = {
    endpoint: string;
    defaultSearch?: string;
    defaultPage?: number;
    sortActive?: string;
    recordsPerPage?: number;
    // sortDirection?: SortDirectionTypes;
    defaultFilters?: F extends object ? Partial<F> : never;
    // setStoreFilters?: (_filters: Partial<FilterValues>) => void;
}

const useListInit = <T, F = unknown>({
    endpoint,
    sortActive = '',
    // sortDirection = 'DESC',
    defaultSearch = '',
    defaultPage = 1,
    defaultFilters,
    recordsPerPage = 5,
    // setStoreFilters,
}: UseListInitParams<F>): UseListInitResult<T, F> => {
    const [search, setSearch] = useState(defaultSearch)

    const [page, setPage] = useState(defaultPage)
    const [perPage, setPerPage] = useState(recordsPerPage)
    const [filters, setFilters] = useState<Partial<F>>(defaultFilters || {})
    const [orderBy, setSortBy] = useState(sortActive)
    // const [sort, setSortDirection] = useState<SortDirectionTypes>(sortDirection)

    const { error, loading, response, setData, fetchRetry } = useFetch<T, F>(endpoint, {
        search,
        page,
        per_page: perPage,
        filters: filters ?? {},
    })

    const handleSearch = (newQuery: string) => {
        setSearch(newQuery)
        setPage(1)
    }

    const setFilter = (filters: Partial<F>) => {
        const onlyWithValues = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => {
                const typeofValue = typeof value

                if (['string', 'number', 'boolean'].includes(typeofValue)) return value !== ''
                if (typeofValue === 'object') {
                    if (Array.isArray(value)) return value.length > 0
                    return value && Object.values(value).some(i => i !== '')
                }
            }),
        ) as Partial<F>
        setFilters(onlyWithValues)
        setPage(1)
    }

    const onChangePage = (page: number) => setPage(page)

    return {
        response,
        filters,
        isLoading: loading,
        error,
        page,
        orderBy,
        search,
        perPage,
        setPerPage,
        setFilter,
        fetchRetry,
        setData,
        setSearch: handleSearch,
        onChangePage,
        setSortBy,
    }
}

export default useListInit