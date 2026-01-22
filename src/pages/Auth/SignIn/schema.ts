import { object, string } from 'zod'

export const SignInSchema = object({
    username: string('El usuario debe ser válido'),
    password: string('La contraseña debe ser válida')
})