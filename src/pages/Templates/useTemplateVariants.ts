import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useRequestQuery from '@/hooks/useRequestQuery'
import {
    ITemplateVariant,
    ITemplateVariantCreate,
    ITemplateVariantUpdate,
} from '@/interfaces/templates'
import { ApiResponse } from '@/interfaces/common'
import { queryKeys } from '@/utils/queryKeys'

interface UseVariantMutationOptions<TData> {
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
}

/**
 * Build the standard set of query keys to invalidate after a successful
 * variant mutation. The template detail endpoint eager-loads variants, so
 * refreshing its entry is enough to keep the UI in sync.
 */
const buildInvalidateKeys = (templateId: string) => [
    queryKeys.detail('templates', templateId),
]

/**
 * Create a new variant for a template.
 */
export const useCreateTemplateVariant = (
    templateId: string,
    options?: UseVariantMutationOptions<ITemplateVariant>,
) => {
    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<ITemplateVariant>) => {
            toast.success('Variante creada correctamente')
            options?.onSuccess?.(response?.data)
        },
        onError: (error) => {
            toast.error(`Error al crear variante: ${error.message ?? 'desconocido'}`)
            options?.onError?.(error)
        },
        invalidateQueries: buildInvalidateKeys(templateId),
    })

    const createVariant = (data: ITemplateVariantCreate) => {
        const url = API_ROUTES.TEMPLATES.VARIANTS.CREATE.replace('{templateId}', templateId)
        return request<ITemplateVariantCreate, ITemplateVariant>('POST', url, data)
    }

    return { createVariant, requestState }
}

/**
 * Update an existing variant. `kind` is not updatable — backend rejects
 * any attempt to change it because it would break the UNIQUE constraint.
 */
export const useUpdateTemplateVariant = (
    templateId: string,
    variantId: string,
    options?: UseVariantMutationOptions<ITemplateVariant>,
) => {
    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<ITemplateVariant>) => {
            toast.success('Variante actualizada')
            options?.onSuccess?.(response?.data)
        },
        onError: (error) => {
            toast.error(`Error al actualizar variante: ${error.message ?? 'desconocido'}`)
            options?.onError?.(error)
        },
        invalidateQueries: buildInvalidateKeys(templateId),
    })

    const updateVariant = (data: ITemplateVariantUpdate) => {
        const url = API_ROUTES.TEMPLATES.VARIANTS.UPDATE
            .replace('{templateId}', templateId)
            .replace('{variantId}', variantId)
        return request<ITemplateVariantUpdate, ITemplateVariant>('PUT', url, data)
    }

    return { updateVariant, requestState }
}

/**
 * Delete a variant. The backend removes any owned S3 assets along with
 * the DB row; the parent Template is untouched.
 */
export const useDeleteTemplateVariant = (
    templateId: string,
    variantId: string,
    options?: UseVariantMutationOptions<{ id: string }>,
) => {
    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<{ id: string }>) => {
            toast.success('Variante eliminada')
            options?.onSuccess?.(response?.data)
        },
        onError: (error) => {
            toast.error(`Error al eliminar variante: ${error.message ?? 'desconocido'}`)
            options?.onError?.(error)
        },
        invalidateQueries: buildInvalidateKeys(templateId),
    })

    const deleteVariant = () => {
        const url = API_ROUTES.TEMPLATES.VARIANTS.DELETE
            .replace('{templateId}', templateId)
            .replace('{variantId}', variantId)
        return request<undefined, { id: string }>('DELETE', url)
    }

    return { deleteVariant, requestState }
}
