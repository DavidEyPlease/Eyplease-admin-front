import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { DiscountType } from "@/interfaces/promotion"
import { queryKeys } from "@/utils/queryKeys"
import { replaceRecordIdInPath } from "@/utils"

const CLIENTS_ENTITY = "clients/list"

export interface ApplyPromotionPayload {
    promotion_id: string | null
    discount_type: DiscountType
    discount: number
    discount_expires_at: string
}

/**
 * Apply / remove a client's promotion snapshot. Invalidates the clients list so
 * the column reflects the change.
 */
export const useClientPromotion = () => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase(CLIENTS_ENTITY)],
    })

    const applyPromotion = (clientId: string, payload: ApplyPromotionPayload) =>
        request<ApplyPromotionPayload, { message: string }>(
            "PATCH",
            replaceRecordIdInPath(API_ROUTES.CLIENTS.SET_PROMOTION, clientId),
            payload
        )

    const removePromotion = (clientId: string) =>
        request<undefined, { message: string }>(
            "DELETE",
            replaceRecordIdInPath(API_ROUTES.CLIENTS.REMOVE_PROMOTION, clientId)
        )

    return { applyPromotion, removePromotion, saving: requestState.loading }
}

export default useClientPromotion
