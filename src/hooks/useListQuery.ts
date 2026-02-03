import { useState, useMemo } from 'react'
import { QueryKey } from '@tanstack/react-query'

import useFetchQuery from './useFetchQuery';
import { JSONValue } from '@/interfaces/common';

type UseListInitResult<T, F> = {
    response: T | undefined;
    isLoading: boolean;
    isRefetching: boolean;
    page: number;
    search: string;
    error: Error | null;
    orderBy: string;
    perPage: number;
    // sort: SortDirectionTypes;
    filters: Partial<F>;
    selectedFilters: Partial<F>;
    setData: (_data: T) => void;
    // setFilters: (_filters: FilterValues) => void;
    setSearch: (_query: string) => void;
    onApplyFilters: (_values: Partial<F>) => void;
    onChangePage: (_page: number) => void;
    setSortBy: (_sortBy: string) => void;
    fetchRetry: () => void;
    setPerPage: (_perPage: number) => void;
    onSelectedFilter: (_key: string, _value: JSONValue) => void
    onChangeFilter: (_key: string, _value: JSONValue) => void
    cleanSelectedFilters: () => void
};

type UseListInitParams<F = unknown> = {
    endpoint: string;
    defaultPerPage?: number
    defaultSearch?: string;
    defaultPage?: number;
    sortActive?: string;
    customQueryKey?: QueryKey | ((params: any) => QueryKey)
    defaultFilters?: F extends object ? Partial<F> : never;
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    refetchOnWindowFocus?: boolean
}

const useListQuery = <T, F = unknown>({
    endpoint,
    sortActive = '',
    defaultPerPage = 15,
    defaultSearch = '',
    defaultPage = 1,
    defaultFilters,
    customQueryKey,
    staleTime,
    cacheTime,
    enabled,
    refetchOnWindowFocus
}: UseListInitParams<F>): UseListInitResult<T, F> => {
    const [search, setSearch] = useState(defaultSearch)
    const [page, setPage] = useState(defaultPage)
    const [perPage, setPerPage] = useState(defaultPerPage)
    const [filters, setFilters] = useState<Partial<F>>(defaultFilters || {})
    const [selectedFilters, setSelectedFilters] = useState<Partial<F>>({})
    const [orderBy, setSortBy] = useState(sortActive)

    const queryParams = useMemo(() => {
        return { search, page, perPage, orderBy, ...filters }
    }, [search, page, perPage, orderBy, filters])

    const generatedQueryKey = useMemo(() => {
        if (typeof customQueryKey === 'function') return customQueryKey(queryParams)
        return customQueryKey || ['list', endpoint, queryParams]
    }, [customQueryKey, endpoint, queryParams])

    const {
        error,
        loading: isLoading,
        isRefetching,
        response: apiResponse,
        setData,
        fetchRetry,
    } = useFetchQuery<T>(endpoint, {
        queryParams,
        customQueryKey: generatedQueryKey,
        staleTime,
        cacheTime,
        enabled,
        refetchOnWindowFocus,
    })

    const handleSearch = (newQuery: string) => {
        setSearch(newQuery)
        setPage(1)
    }

    const onApplyFilters = (newFilters: Partial<F>) => {
        const onlyWithValues = Object.fromEntries(
            Object.entries({ ...filters, ...newFilters }).filter(([, value]) => {
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

    const cleanSelectedFilters = () => {
        setSelectedFilters({})
        setFilters(defaultFilters || {})
        // onApplyFilters({})
        setPage(1)
    }

    const onSelectedFilter = (key: string, value: JSONValue) => setSelectedFilters(prev => ({ ...prev, [key]: value }))
    const onChangeFilter = (key: string, value: JSONValue) => setFilters({ ...selectedFilters, [key]: value })

    return {
        response: apiResponse,
        filters,
        isLoading,
        error,
        page,
        orderBy,
        search,
        perPage,
        selectedFilters,
        isRefetching,
        setPerPage,
        onApplyFilters,
        fetchRetry,
        setData,
        setSearch: handleSearch,
        onChangePage: setPage,
        onSelectedFilter,
        setSortBy,
        cleanSelectedFilters,
        onChangeFilter
    }
}

export default useListQuery