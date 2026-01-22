import { z } from "zod";

export const EditProfileSchema = z.object({
  name: z
    .string({ error: 'El usuario debe ser válido' })
    .min(1, 'Ingresa el usuario/cuenta'),
  email: z
.email('El correo electrónico debe ser válido')
    .min(1, 'Ingresa el correo electrónico')
    .max(30, 'El correo electrónico debe tener menos de 30 caracteres'),
  phone: z
    .string()
    .min(1, 'Ingresa el número de teléfono')
    .nullable(),
});


export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: 'El usuario debe ser válido' })
      .min(1, 'Ingresa el usuario/cuenta'),
    newPassword: z
      .string({ error: 'La contraseña debe ser válida' })
      .min(1, 'Ingresa la contraseña')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z
      .string({ error: 'La contraseña debe ser válida' })
      .min(1, 'Ingresa la contraseña')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Las contraseñas no coinciden',
    }
  );