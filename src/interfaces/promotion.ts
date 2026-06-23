// Promotions / discounts module types.

export type DiscountType = "percent" | "fixed"

/** Display labels (UI is in Spanish; stored values stay in English). */
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
    percent: "Porcentaje",
    fixed: "Monto fijo",
}

export const DISCOUNT_TYPE_OPTIONS = (Object.keys(DISCOUNT_TYPE_LABELS) as DiscountType[]).map(
    (value) => ({ value, label: DISCOUNT_TYPE_LABELS[value] })
)

export interface Promotion {
    id: string
    name: string
    discountType: DiscountType
    /** For percent: 0-100. For fixed: amount in MXN. */
    discount: number
    /** Expiration date 'YYYY-MM-DD'. */
    expiresAt: string
    active: boolean
    /** Computed server-side: expiration day is before today. */
    isExpired: boolean
}

/** Payload sent to the backend on create/update. */
export interface PromotionPayload {
    name: string
    discount_type: DiscountType
    discount: number
    expires_at: string
    active: boolean
}
