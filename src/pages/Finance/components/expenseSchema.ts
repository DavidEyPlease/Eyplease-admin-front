import { z } from "zod"
import dayjs from "dayjs"

import { ExpenseItem, ExpensePayload } from "@/interfaces/finance"

export const expenseSchema = z.object({
    date: z.date(),
    description: z.string().trim().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
    amount: z.number().positive("El monto debe ser mayor a 0"),
    category: z.enum(["tools", "team", "other"]),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

/** Build the form defaults for create (no expense) or edit (existing expense). */
export const buildExpenseDefaults = (expense: ExpenseItem | null, fallbackDate: Date): ExpenseFormValues => ({
    date: expense ? dayjs(expense.date).toDate() : fallbackDate,
    description: expense?.description ?? "",
    amount: expense?.amount ?? 0,
    category: expense?.category ?? "other",
})

/** Map form values to the API payload (date serialized as YYYY-MM-DD). */
export const toExpensePayload = (values: ExpenseFormValues): ExpensePayload => ({
    date: dayjs(values.date).format("YYYY-MM-DD"),
    description: values.description.trim(),
    amount: values.amount,
    category: values.category,
})
