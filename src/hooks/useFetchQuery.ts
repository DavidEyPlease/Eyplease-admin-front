import { useMemo } from 'react'
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query'

import HttpService from '@/services/http'
import { ApiResponse } from '@/interfaces/common'

interface UseFetchResult<T> {
    response: T | undefined,
    loading: boolean,
    isRefetching: boolean,
    error: Error | null,
    setData: (_data: T) => void
    fetchRetry: () => void
}

interface UseFetchOptions {
    queryParams?: QueryParams
    customQueryKey?: QueryKey
    // additional options for react-query
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    refetchOnWindowFocus?: boolean
}

type QueryParams = { paginationToken?: string | null, perPage?: number, search?: string, page?: number } | Record<string, any>

export default function useFetchQuery<T>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> {
    const {
        queryParams = {},
        customQueryKey,
        staleTime,
        cacheTime,
        enabled = true,
        refetchOnWindowFocus = false,
    } = options
    const queryClient = useQueryClient()

    const queryKey = useMemo(() => {
        return customQueryKey || ['fetch', url, queryParams]
    }, [customQueryKey, url, queryParams])

    const fetcher = async () => {
        const params = new URLSearchParams()
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        params.append(`${key}[]`, v)
                    })
                } else {
                    params.append(key, value.toString())
                }
            }
        })
        const fullUrl = params.toString() ? `${url}?${params.toString()}` : url
        const { data } = await HttpService.get<ApiResponse<T>>(fullUrl)
        return data
    }

    const { data, error, isLoading, isRefetching, refetch } = useQuery<T>({
        queryKey,
        queryFn: fetcher,
        staleTime,
        gcTime: cacheTime,
        enabled,
        refetchOnWindowFocus,
    })

    const setData = (newData: T) => {
        queryClient.setQueryData(queryKey, newData)
    }

    return {
        response: data,
        loading: isLoading,
        isRefetching,
        error: error as Error | null,
        setData,
        fetchRetry: refetch
    }
}