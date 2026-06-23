import { useMemo, useState } from "react"
import dayjs from "dayjs"
import { TicketPercentIcon } from "lucide-react"
import { toast } from "sonner"

import Button from "@/components/common/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/uishadcn/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover"
import NumericInput from "@/components/common/Inputs/NumericInput"
import ErrorText from "@/components/common/Inputs/ErrorText"
import CalendarInput from "@/components/common/Inputs/CalendarInput"
import useCustomForm from "@/hooks/useCustomForm"
import { ClientPromotion, IClient } from "@/interfaces/clients"
import { DISCOUNT_TYPE_OPTIONS } from "@/interfaces/promotion"
import { formatMoney } from "@/utils/finance"
import usePromotions from "@/pages/Finance/Promotions/usePromotions"
import useClientPromotion from "@/pages/Clients/hooks/useClientPromotion"
import {
    buildClientPromotionDefaults,
    ClientPromotionFormValues,
    clientPromotionSchema,
    toApplyPromotionPayload,
} from "./clientPromotionSchema"

const fieldLabelCls = "text-xs font-medium text-slate-500"
const dateTriggerCls =
    "flex h-9 w-full items-center rounded-md border border-input bg-white px-3 py-1 text-sm text-slate-700 outline-none focus:border-primary"

const formatDiscount = (promotion: ClientPromotion) =>
    promotion.discount_type === "percent" ? `${promotion.discount}%` : formatMoney(promotion.discount)

const ClientPromotionForm = ({ client, onDone }: { client: IClient; onDone: () => void }) => {
    const { promotions } = usePromotions()
    const { applyPromotion, removePromotion, saving } = useClientPromotion()
    const [dateOpen, setDateOpen] = useState(false)

    const selectable = useMemo(() => promotions.filter((p) => p.active && !p.isExpired), [promotions])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useCustomForm<ClientPromotionFormValues>(clientPromotionSchema, buildClientPromotionDefaults(client.promotion))

    const promotionId = watch("promotionId")
    const discountType = watch("discountType")
    const expiresAt = watch("expiresAt")

    const onSelectPromotion = (id: string) => {
        const promotion = selectable.find((p) => p.id === id)
        setValue("promotionId", id, { shouldValidate: true })
        if (promotion) {
            setValue("discountType", promotion.discountType, { shouldValidate: true })
            setValue("discount", promotion.discount, { shouldValidate: true })
            setValue("expiresAt", dayjs(promotion.expiresAt).toDate(), { shouldValidate: true })
        }
    }

    const submit = handleSubmit(async (values) => {
        await applyPromotion(client.id, toApplyPromotionPayload(values))
        toast.success("Promoción aplicada")
        onDone()
    })

    const onRemove = async () => {
        await removePromotion(client.id)
        toast.success("Promoción quitada")
        onDone()
    }

    return (
        <form onSubmit={submit} className="grid gap-4">
            <div className="flex flex-col gap-1">
                <label className={fieldLabelCls}>Promoción</label>
                <Select value={promotionId ?? undefined} onValueChange={onSelectPromotion}>
                    <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Selecciona una promoción" />
                    </SelectTrigger>
                    <SelectContent>
                        {selectable.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-slate-400">No hay promociones activas</div>
                        ) : (
                            selectable.map((promotion) => (
                                <SelectItem key={promotion.id} value={promotion.id}>
                                    {promotion.name} · {promotion.discountType === "percent" ? `${promotion.discount}%` : formatMoney(promotion.discount)}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">Se usa como plantilla; puedes ajustar los campos para este cliente.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Tipo de descuento</label>
                    <Select
                        value={discountType}
                        onValueChange={(value) => setValue("discountType", value as ClientPromotionFormValues["discountType"], { shouldValidate: true })}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DISCOUNT_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Descuento {discountType === "percent" ? "(%)" : "($)"}</label>
                    <NumericInput
                        label="Descuento"
                        value={watch("discount")}
                        register={register("discount")}
                        error={errors.discount?.message}
                        decimalScale={discountType === "percent" ? 0 : 2}
                        onChange={(value) => setValue("discount", value as number, { shouldValidate: true })}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={fieldLabelCls}>Fecha límite</label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                        <button type="button" className={dateTriggerCls}>
                            {expiresAt ? dayjs(expiresAt).format("DD/MM/YYYY") : "Selecciona una fecha"}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarInput
                            value={expiresAt}
                            onChange={(value) => {
                                setValue("expiresAt", value, { shouldValidate: true })
                                setDateOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
                {errors.expiresAt?.message && <ErrorText error={errors.expiresAt.message} />}
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
                {client.promotion ? (
                    <Button text="Quitar" variant="ghost" color="danger" size="sm" onClick={onRemove} loading={saving} />
                ) : (
                    <span />
                )}
                <Button text="Guardar" type="submit" color="primary" rounded size="sm" loading={saving} />
            </div>
        </form>
    )
}

const ClientPromotionCell = ({ client }: { client: IClient }) => {
    const [open, setOpen] = useState(false)
    const applied = client.promotion
    const expired = applied ? dayjs(applied.expires_at).isBefore(dayjs(), "day") : false

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                text={
                    applied ? (
                        <span className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">{applied.name ?? "Promoción"}</span>
                            <span className="rounded-md bg-[#5B47E0]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#5B47E0]">{formatDiscount(applied)}</span>
                            {expired && <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-600">Vencida</span>}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-[#5B47E0]">
                            <TicketPercentIcon className="h-3.5 w-3.5" /> Aplicar
                        </span>
                    )
                }
                onClick={() => setOpen(true)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg rounded-2xl border-slate-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Promoción · {client.name}</DialogTitle>
                    </DialogHeader>
                    <ClientPromotionForm client={client} onDone={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ClientPromotionCell
