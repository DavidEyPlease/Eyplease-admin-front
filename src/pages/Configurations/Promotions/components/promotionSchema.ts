import { z } from "zod"
import dayjs from "dayjs"

import { Promotion, PromotionPayload } from "@/interfaces/promotion"

export const promotionSchema = z
    .object({
        name: z.string().trim().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
        discountType: z.enum(["percent", "fixed"]),
        discount: z.number().min(0, "El descuento no puede ser negativo"),
        expiresAt: z.date(),
        active: z.boolean(),
    })
    .refine((values) => values.discountType !== "percent" || values.discount <= 100, {
        message: "El porcentaje no puede superar 100",
        path: ["discount"],
    })

export type PromotionFormValues = z.infer<typeof promotionSchema>

/** Form defaults for create (no promotion) or edit (existing promotion). */
export const buildPromotionDefaults = (promotion: Promotion | null): PromotionFormValues => ({
    name: promotion?.name ?? "",
    discountType: promotion?.discountType ?? "percent",
    discount: promotion?.discount ?? 0,
    expiresAt: promotion ? dayjs(promotion.expiresAt).toDate() : dayjs().add(1, "month").toDate(),
    active: promotion?.active ?? true,
})

/** Map form values to the API payload (date serialized as YYYY-MM-DD). */
export const toPromotionPayload = (values: PromotionFormValues): PromotionPayload => ({
    name: values.name.trim(),
    discount_type: values.discountType,
    discount: values.discount,
    expires_at: dayjs(values.expiresAt).format("YYYY-MM-DD"),
    active: values.active,
})
