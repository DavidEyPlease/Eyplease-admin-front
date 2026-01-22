import { object, string } from 'zod'

export interface IResetPassword {
    password: string
    confirmPassword: string
}

export const ResetPasswordSchema = object({
    password: string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: string().min(8, { message: "La confirmación de la nueva contraseña debe tener al menos 8 caracteres" }),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Las contraseñas no coinciden",
            path: ['confirmPassword']
        });
    }
})