import { EypleaseFile, FileTypes } from "@/interfaces/files"
import { z } from "zod"

export const TrainingFormSchema = z.object({
    title: z.string().nonempty({ message: "El título es requerido" }).max(255),
    plan_ids: z.array(z.string()).nonempty({ message: "El plan es requerido" }),
    category_id: z.string().nonempty({ message: "La categoría es requerida" }),
})

export type FormType = z.infer<typeof TrainingFormSchema>

export const FORM_DEFAULT_VALUES: FormType = {
    title: '',
    plan_ids: [],
    category_id: '',
}

export const getTrainingFileByType = (files: EypleaseFile[], type: FileTypes) => {
    return files.find(file => file.type === type) || null
}