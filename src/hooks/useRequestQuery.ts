import { ApiResponse, HttpMethods } from '@/interfaces/common';
import HttpService from '@/services/http';
import { useMutation, useQueryClient, MutationKey } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseRequestOptions {
    onSuccess?: (data: any, variables: any) => void | Promise<void>;
    onError?: (error: Error, variables: any) => void | Promise<void>;
    onSettled?: (data: any | undefined, error: Error | null, variables: any) => void | Promise<void>;
    mutationKey?: MutationKey;
    invalidateQueries?: MutationKey[];
}

interface RequestPayload<T = unknown> {
    url: string
    method: HttpMethods
    body?: T
}

const useRequestQuery = (options: UseRequestOptions = {}) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationKey: options.mutationKey,
        mutationFn: async <TRequest, TResponse>({ url, method, body }: RequestPayload<TRequest>): Promise<ApiResponse<TResponse>> => {
            const isFormData = body instanceof FormData
            return await HttpService._fetchWithRetry<ApiResponse<TResponse>>(url, {
                method,
                ...(body ? {
                    body: isFormData ? body : JSON.stringify(body)
                } : {})
            })
        },
        onSuccess: async (data, variables) => {
            if (options.onSuccess) {
                await options.onSuccess(data, variables);
            }

            if (options.invalidateQueries && options.invalidateQueries.length > 0) {
                for (const queryKey of options.invalidateQueries) {
                    await queryClient.invalidateQueries({ queryKey });
                }
            }
        },
        onError: (e, v) => {
            if (options.onError) {
                return options.onError(e, v)
            }
            toast.error('Ha ocurrido un error interno')
        },
        onSettled: options.onSettled,
    });

    const request = async <TRequest = unknown, TResponse = unknown>(method: HttpMethods, url: string, body?: TRequest): Promise<ApiResponse<TResponse>> => {
        return await mutation.mutateAsync({ url, body, method });
    };

    return {
        request,
        requestState: {
            loading: mutation.isPending,
            error: mutation.error as Error | null
        },
        mutation
    };
};

export default useRequestQuery;