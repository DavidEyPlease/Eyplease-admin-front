import { z } from "zod"

export const CreateClientSchema = z.object({
    name: z.string().nonempty({ message: "El nombre es requerido" }).max(255),
    username: z.string().nonempty({ message: "El nombre de usuario es requerido" }).max(255),
    email: z.email({ message: "El correo electrónico no es válido" }),
    plan_id: z.uuidv4({ message: "El plan es requerido" }),
    mk_password: z.string().nullable(),
    country: z.string(),
})

export type FormType = z.infer<typeof CreateClientSchema>

export type FormSteps = 'basic-info' | 'pictures' | 'network'

export const FORM_DEFAULT_VALUES: FormType = {
    name: '',
    username: '',
    email: '',
    plan_id: '',
    country: '',
    mk_password: null
}