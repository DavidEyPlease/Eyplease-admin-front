import { useEffect, useState } from "react"
import dayjs from "dayjs"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import NumericInput from "@/components/common/Inputs/NumericInput"
import ErrorText from "@/components/common/Inputs/ErrorText"
import CalendarInput from "@/components/common/Inputs/CalendarInput"
import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import { Switch } from "@/uishadcn/ui/switch"
import useCustomForm from "@/hooks/useCustomForm"
import { DISCOUNT_TYPE_OPTIONS, Promotion } from "@/interfaces/promotion"
import { buildPromotionDefaults, PromotionFormValues, promotionSchema } from "./promotionSchema"

interface Props {
    /** Promotion being edited, or null when creating. */
    promotion: Promotion | null
    loading?: boolean
    onSubmit: (values: PromotionFormValues) => Promise<void> | void
}

const fieldLabelCls = "text-xs font-medium text-slate-500"
const dateTriggerCls =
    "flex h-9 w-full items-center rounded-md border border-input bg-white px-3 py-1 text-sm text-slate-700 outline-none focus:border-primary"

const PromotionForm = ({ promotion, loading, onSubmit }: Props) => {
    const isEdit = Boolean(promotion)
    const [dateOpen, setDateOpen] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useCustomForm<PromotionFormValues>(promotionSchema, buildPromotionDefaults(promotion))

    useEffect(() => {
        reset(buildPromotionDefaults(promotion))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [promotion])

    const submit = handleSubmit(async (values) => {
        await onSubmit(values)
    })

    const expiresAt = watch("expiresAt")
    const discountType = watch("discountType")
    const active = watch("active")

    return (
        <form onSubmit={submit} className="grid gap-4">
            <div className="flex flex-col gap-1">
                <label className={fieldLabelCls}>Nombre</label>
                <TextInput label="Ej. Promo verano" register={register("name")} error={errors.name?.message} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Tipo de descuento</label>
                    <Select
                        value={discountType}
                        onValueChange={(value) => setValue("discountType", value as PromotionFormValues["discountType"], { shouldValidate: true })}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Selecciona un tipo" />
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
                        prefix={discountType === "percent" ? "%" : "$"}
                        decimalScale={discountType === "percent" ? 0 : 2}
                        onChange={(value) => setValue("discount", value as number, { shouldValidate: true })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Fecha de expiración</label>
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

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Estado</label>
                    <div className="flex h-9 items-center gap-2">
                        <Switch checked={active} onCheckedChange={(value) => setValue("active", value, { shouldValidate: true })} />
                        <span className="text-sm text-slate-600">{active ? "Activa" : "Inactiva"}</span>
                    </div>
                </div>
            </div>

            <div className="mt-1 flex justify-end">
                <Button text={isEdit ? "Guardar cambios" : "Crear promoción"} type="submit" color="primary" rounded size="sm" loading={loading} />
            </div>
        </form>
    )
}

export default PromotionForm
