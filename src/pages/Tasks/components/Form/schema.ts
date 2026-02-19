import { TaskTypes } from "@/interfaces/tasks"
import { z } from "zod"

// Schema base para todas las tareas
const BaseTaskSchema = z.object({
    // category: z.string().nonempty({ message: "La categoría es requerida" }),
    started_at: z.date(),
    user: z.string().optional(),
    title: z.string().min(3, { message: "El título es requerido" }).max(255),
    description: z.string().optional(),
    expired_at: z.date(),
    expired_at_time: z.string().optional(),
})

// Specified Metadata Schema for Tools Task
const ToolsMetadataSchema = z.object({
    tools_section: z.string().min(1, { message: "La sección de herramientas es requerida" }),
    publication_date: z.date({ message: "La fecha de publicación es requerida" }),
    plan_ids: z.array(z.string()).min(1, { message: "El ID del plan es requerido" }),
})

// Schema for Tasks of type TOOLS
const ToolsTaskSchema = BaseTaskSchema.extend({
    type: z.literal(TaskTypes.TOOLS),
    metadata: ToolsMetadataSchema,
})

export const TaskSchema = z.discriminatedUnion("type", [
    ToolsTaskSchema,
]).refine((data) => !data.expired_at || data.expired_at <= data.started_at, {
    message: "La fecha de entrega no puede ser mayor a la fecha de inicio",
    path: ["expired_at"],
})

export const FORM_DEFAULT_VALUES: z.infer<typeof TaskSchema> = {
    // category: '',
    started_at: new Date(),
    type: TaskTypes.TOOLS,
    user: undefined,
    title: "",
    description: "",
    expired_at_time: "23:59:59",
    expired_at: new Date(),
    metadata: {
        tools_section: "",
        publication_date: new Date(),
        plan_ids: [],
    },
}