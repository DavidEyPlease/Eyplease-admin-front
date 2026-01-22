import HttpService from '@/services/http'
import { useState } from 'react'
import { toast } from 'sonner'
// import { JSONObject } from '@/types/common'

// type Data = JSONObject | null

interface RequestState {
    loading: boolean;
    error: Error | null;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const useRequest = (method: RequestMethod) => {

    const [state, setState] = useState<RequestState>({
        loading: false,
        error: null
    })

    const request = async <R, V>(url: string, body?: V): Promise<R> => {
        setState({ loading: true, error: null })

        try {
            const response = await HttpService._fetchWithRetry<R>(url, {
                method,
                ...(body ? { body: JSON.stringify(body) } : {}),
            })

            setState({ loading: false, error: null })

            return response
        } catch (e) {
            console.log(e.error)
            setState({ loading: false, error: e })

            toast.error(e.message || e.error || 'Error')

            throw e
        }
    }

    const requestFormData = async <R>(url: string, body: FormData): Promise<R> => {
        setState({ loading: true, error: null })

        try {
            const response = await HttpService._fetchWithRetry<R>(url, {
                method,
                body,
            })

            setState({ loading: false, error: null })

            return response
        } catch (e) {
            setState({ loading: false, error: e })

            toast.error(e.message || e.error || 'Error')

            throw e
        }
    }

    return { request, requestFormData, requestState: state }
}

export default useRequest