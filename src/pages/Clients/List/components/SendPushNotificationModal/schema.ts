import { z } from "zod";

export const ClientNotificationSchema = z.object({
    title: z.string().min(1, { message: "El título es requerido" }).max(120, { message: "El título no puede superar 120 caracteres" }),
    body: z.string().min(1, { message: "El mensaje es requerido" }).max(500, { message: "El mensaje no puede superar 500 caracteres" }),
    segment: z.enum(["ios", "android", "all"], { message: "Selecciona un segmento" }),
});

export type ClientNotificationForm = z.infer<typeof ClientNotificationSchema>;

export const FORM_DEFAULT_VALUES: ClientNotificationForm = {
    title: "",
    body: "",
    segment: "all",
};