import { z } from "zod"
import dayjs from "dayjs"

import { ClientPromotion } from "@/interfaces/clients"
import { ApplyPromotionPayload } from "../../../hooks/useClientPromotion"

export const clientPromotionSchema = z
    .object({
        promotionId: z.string().nullable(),
        discountType: z.enum(["percent", "fixed"]),
        discount: z.number().min(0, "El descuento no puede ser negativo"),
        expiresAt: z.date(),
    })
    .refine((values) => values.discountType !== "percent" || values.discount <= 100, {
        message: "El porcentaje no puede superar 100",
        path: ["discount"],
    })

export type ClientPromotionFormValues = z.infer<typeof clientPromotionSchema>

/** Prefill from the client's current snapshot, or sensible empty defaults. */
export const buildClientPromotionDefaults = (promotion: ClientPromotion | null): ClientPromotionFormValues => ({
    promotionId: promotion?.promotion_id ?? null,
    discountType: promotion?.discount_type ?? "percent",
    discount: promotion?.discount ?? 0,
    expiresAt: promotion ? dayjs(promotion.expires_at).toDate() : dayjs().add(1, "month").toDate(),
})

export const toApplyPromotionPayload = (values: ClientPromotionFormValues): ApplyPromotionPayload => ({
    promotion_id: values.promotionId,
    discount_type: values.discountType,
    discount: values.discount,
    discount_expires_at: dayjs(values.expiresAt).format("YYYY-MM-DD"),
})
