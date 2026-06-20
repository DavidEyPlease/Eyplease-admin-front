import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { XIcon } from "lucide-react"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import NumericInput from "@/components/common/Inputs/NumericInput"
import ErrorText from "@/components/common/Inputs/ErrorText"
import CalendarInput from "@/components/common/Inputs/CalendarInput"
import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import useCustomForm from "@/hooks/useCustomForm"
import { ExpenseCategory, ExpenseItem, EXPENSE_CATEGORY_OPTIONS } from "@/interfaces/finance"
import { buildExpenseDefaults, ExpenseFormValues, expenseSchema } from "./expenseSchema"

interface Props {
    /** Expense being edited, or null when creating. */
    expense: ExpenseItem | null
    /** Default date used on create (within the selected period). */
    fallbackDate: Date
    loading?: boolean
    onSubmit: (values: ExpenseFormValues) => Promise<void> | void
    onCancelEdit: () => void
}

const fieldLabelCls = "text-xs font-medium text-slate-500"
const dateTriggerCls =
    "flex h-9 w-full items-center rounded-md border border-input bg-white px-3 py-1 text-sm text-slate-700 outline-none focus:border-primary"

const ExpenseForm = ({ expense, fallbackDate, loading, onSubmit, onCancelEdit }: Props) => {
    const isEdit = Boolean(expense)
    const [dateOpen, setDateOpen] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useCustomForm<ExpenseFormValues>(expenseSchema, buildExpenseDefaults(expense, fallbackDate))

    useEffect(() => {
        reset(buildExpenseDefaults(expense, fallbackDate))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expense])

    const submit = handleSubmit(async (values) => {
        await onSubmit(values)
        if (!expense) reset(buildExpenseDefaults(null, fallbackDate))
    })

    const date = watch("date")

    return (
        <form onSubmit={submit} className="rounded-xl bg-slate-50/70 p-3.5">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">{isEdit ? "Editar gasto" : "Agregar gasto"}</h4>
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
                    <label className={fieldLabelCls}>Fecha</label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                            <button type="button" className={dateTriggerCls}>
                                {date ? dayjs(date).format("DD/MM/YYYY") : "Selecciona una fecha"}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarInput
                                value={date}
                                onChange={(value) => {
                                    setValue("date", value, { shouldValidate: true })
                                    setDateOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.date?.message && <ErrorText error={errors.date.message} />}
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Descripción</label>
                    <TextInput
                        label="Ej. Servidores, Adobe…"
                        register={register("description")}
                        error={errors.description?.message}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Monto</label>
                    <NumericInput
                        label="Monto"
                        value={watch("amount")}
                        register={register("amount")}
                        error={errors.amount?.message}
                        decimalScale={2}
                        onChange={(value) => setValue("amount", value as number, { shouldValidate: true })}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={fieldLabelCls}>Categoría</label>
                    <Select
                        value={watch("category")}
                        onValueChange={(value) => setValue("category", value as ExpenseCategory, { shouldValidate: true })}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category?.message && <ErrorText error={errors.category.message} />}
                </div>
            </div>

            <div className="mt-3 flex justify-end">
                <Button text={isEdit ? "Guardar cambios" : "Agregar gasto"} type="submit" color="primary" rounded size="sm" loading={loading} />
            </div>
        </form>
    )
}

export default ExpenseForm
