import { useState, useEffect } from 'react'
import HttpService from '@/services/http'
import { QueryParams } from '@/interfaces/common'
import { ApiResponse } from '@/interfaces/common'

interface UseFetchResult<T> {
    response: T | undefined,
    loading: boolean,
    error: Error | null,
    setData: (_data: T) => void
    fetchRetry: () => void
}

export default function useFetch<T, F = unknown>(url: string, queryParams: QueryParams<F> = {}): UseFetchResult<T> {
    const [data, setData] = useState<T>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [fetchTrigger, setFetchTrigger] = useState<string>('')

    const fetchRetry = () => {
        setFetchTrigger(prevQueryKey => prevQueryKey + '1')
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                const { filters, ...rest } = queryParams
                Object.entries({ ...rest, ...(filters ? filters : {}) }).forEach(([key, value]) => {
                    params.append(key, value as string)
                })
                let parseUrl = url
                if (params && params.toString()) {
                    parseUrl += `?${params.toString()}`
                }
                const result = await HttpService.get<ApiResponse<T>>(parseUrl)
                setData(result.data)
            } catch (e) {
                console.log(e)
                setError(e)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 50)
            }
        }
        fetchData()
    }, [url, queryParams.search, queryParams.filters, fetchTrigger, queryParams.page, queryParams.per_page, /*params.orderBy, params.sort*/])

    return { response: data, loading, error, setData, fetchRetry }
}