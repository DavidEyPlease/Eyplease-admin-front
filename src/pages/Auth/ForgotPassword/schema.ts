import { object, string, pipe, email } from 'zod'

export const ForgotPasswordSchema = object({
    email: pipe(
        string('El correo electrónico debe ser válido'),
        email('El correo electrónico ingresado es invalido'),
    ),
})