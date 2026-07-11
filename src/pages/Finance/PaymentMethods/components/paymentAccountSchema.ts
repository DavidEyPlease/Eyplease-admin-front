import { z } from "zod"

import { PaymentAccount, PaymentAccountPayload } from "@/interfaces/finance"

export const paymentAccountSchema = z.object({
    bank: z.string().trim().min(1, "El banco es obligatorio").max(255, "Máximo 255 caracteres"),
    beneficiary: z.string().trim().min(1, "El beneficiario es obligatorio").max(255, "Máximo 255 caracteres"),
    number: z.string().trim().min(1, "El número es obligatorio").max(255, "Máximo 255 caracteres"),
    numberType: z.enum(["clabe", "tarjeta"]),
    isActive: z.boolean(),
})

export type PaymentAccountFormValues = z.infer<typeof paymentAccountSchema>

/** Form defaults for create (no account) or edit (existing account). */
export const buildPaymentAccountDefaults = (account: PaymentAccount | null): PaymentAccountFormValues => ({
    bank: account?.bank ?? "",
    beneficiary: account?.beneficiary ?? "",
    number: account?.number ?? "",
    numberType: account?.numberType ?? "clabe",
    isActive: account?.isActive ?? true,
})

/** Map form values to the API payload (snake_case). */
export const toPaymentAccountPayload = (values: PaymentAccountFormValues): PaymentAccountPayload => ({
    bank: values.bank.trim(),
    beneficiary: values.beneficiary.trim(),
    number: values.number.trim(),
    number_type: values.numberType,
    is_active: values.isActive,
})
