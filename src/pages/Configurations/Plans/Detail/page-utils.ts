import { z } from "zod";

export const PlanSchema = z.object({
  name: z
    .string({ error: 'El nombre del plan debe ser válido' })
    .min(1, 'Ingresa el nombre del plan'),
  free: z.boolean(),
  active: z.boolean(),
  is_default: z.boolean(),
  price: z
    .number({ error: 'Ingresa el costo del plan' })
    .min(0, 'Ingresa el costo del plan'),
  features: z.array(
    z.object({
      label: z.string(),
    })
  ),
  accesses: z.array(
    z.object({
      key: z.string(),
      nested_modules: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
        })
      ),
    })
  ),
});
