import { useEffect } from "react"
import { XIcon } from "lucide-react"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import SwitchInput from "@/components/common/Inputs/Switch"
import ErrorText from "@/components/common/Inputs/ErrorText"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import useCustomForm from "@/hooks/useCustomForm"
import { PaymentAccount, PaymentAccountType, PAYMENT_ACCOUNT_TYPE_OPTIONS } from "@/interfaces/finance"
import { buildPaymentAccountDefaults, PaymentAccountFormValues, paymentAccountSchema } from "./paymentAccountSchema"

interface Props {
    /** Account being edited, or null when creating. */
    account: PaymentAccount | null
    loading?: boolean
    onSubmit: (values: PaymentAccountFormValues) => Promise<void> | void
    onCancelEdit: () => void
}

const fieldLabelCls = "text-xs font-medium text-slate-500"

const PaymentAccountForm = ({ account, loading, onSubmit, onCancelEdit }: Props) => {
    const isEdit = Boolean(account)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useCustomForm<PaymentAccountFormValues>(paymentAccountSchema, buildPaymentAccountDefaults(account))

    useEffect(() => {
        reset(buildPaymentAccountDefaults(account))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account])

    const submit = handleSubmit(async (values) => {
        await onSubmit(values)
        if (!account) reset(buildPaymentAccountDefaults(null))
    })

    return (
        <form onSubmit={submit} className="rounded-xl bg-slate-50/70 p-3.5">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">{isEdit ? "Editar cuenta" : "Agregar cuenta"}</h4>
                {isEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
                    >
                        <XIcon className="h-3.5 w-3.5" /> Cancelar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Banco</label>
                    <TextInput label="Ej. BBVA" register={register("bank")} error={errors.bank?.message} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Beneficiario</label>
                    <TextInput label="Titular de la cuenta" register={register("beneficiary")} error={errors.beneficiary?.message} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Número (CLABE / tarjeta)</label>
                    <TextInput label="Número" register={register("number")} error={errors.number?.message} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Tipo</label>
                    <Select
                        value={watch("numberType")}
                        onValueChange={(value) => setValue("numberType", value as PaymentAccountType, { shouldValidate: true })}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_ACCOUNT_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.numberType?.message && <ErrorText error={errors.numberType.message} />}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <SwitchInput
                    id="payment-account-active"
                    label="Cuenta activa"
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked, { shouldValidate: true })}
                />
                <Button text={isEdit ? "Guardar cambios" : "Agregar cuenta"} type="submit" color="primary" rounded size="sm" loading={loading} />
            </div>
        </form>
    )
}

export default PaymentAccountForm
