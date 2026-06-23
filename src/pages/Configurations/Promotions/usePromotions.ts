import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { DiscountType, Promotion, PromotionPayload } from "@/interfaces/promotion"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"

const PROMOTIONS_ENTITY = "promotions"

interface ApiPromotion {
    id: string
    name: string
    discount_type: DiscountType
    discount: number
    expires_at: string
    active: boolean
    is_expired: boolean
}

const mapPromotion = (p: ApiPromotion): Promotion => ({
    id: p.id,
    name: p.name,
    discountType: p.discount_type,
    discount: p.discount ?? 0,
    expiresAt: p.expires_at,
    active: p.active,
    isExpired: p.is_expired,
})

/**
 * Server state for the Promotions config page. Fetches the full list (small,
 * cached) so filtering by status/expiration and search by name happen
 * client-side, and exposes the create/update/delete mutations.
 */
export const usePromotions = () => {
    const { response, loading, isRefetching, error, fetchRetry } = useFetchQuery<ApiPromotion[]>(
        API_ROUTES.PROMOTIONS.LIST,
        { customQueryKey: queryKeys.list(PROMOTIONS_ENTITY) }
    )

    const promotions = useMemo(() => (response ?? []).map(mapPromotion), [response])

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(PROMOTIONS_ENTITY)],
    })

    const createPromotion = (data: PromotionPayload) =>
        request<PromotionPayload, ApiPromotion>("POST", API_ROUTES.PROMOTIONS.CREATE, data)

    const updatePromotion = (id: string, data: PromotionPayload) =>
        request<PromotionPayload, ApiPromotion>(
            "PUT",
            replaceRecordIdInPath(API_ROUTES.PROMOTIONS.UPDATE, id),
            data
        )

    const deletePromotion = (id: string) =>
        request<undefined, { message: string }>(
            "DELETE",
            replaceRecordIdInPath(API_ROUTES.PROMOTIONS.DELETE, id)
        )

    return {
        promotions,
        loading,
        isRefetching,
        error,
        fetchRetry,
        createPromotion,
        updatePromotion,
        deletePromotion,
        mutating: requestState.loading,
    }
}

export default usePromotions
