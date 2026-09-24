import { z } from "zod";

/** Los tres avisos que entiende la app: cada uno se pinta distinto en Hoy. */
export const NOTICE_KINDS = ["info", "meeting", "update"] as const;
export type NoticeKind = (typeof NOTICE_KINDS)[number];

const isWebUrl = (value: string) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
};

/** El último instante del día elegido, en la hora del navegador (la de México para el equipo). */
export const endOfDay = (date: string) => new Date(`${date}T23:59:59`);

export const ClientNotificationSchema = z.object({
    title: z.string().min(1, { message: "El título es requerido" }).max(120, { message: "El título no puede superar 120 caracteres" }),
    body: z.string().min(1, { message: "El mensaje es requerido" }).max(500, { message: "El mensaje no puede superar 500 caracteres" }),
    segment: z.enum(["ios", "android", "all"], { message: "Selecciona un segmento" }),
    kind: z.enum(NOTICE_KINDS),
    link: z.string().trim().max(500, { message: "La liga no puede superar 500 caracteres" })
        .refine((value) => !value || isWebUrl(value), { message: "Pon la liga completa, empezando con https://" }),
    link_label: z.string().trim().max(60, { message: "El texto del botón no puede superar 60 caracteres" }),
    /** «AAAA-MM-DDTHH:mm» del campo de fecha y hora; vacío si no es junta. */
    event_at: z.string(),
    pinned: z.boolean(),
    /** «AAAA-MM-DD»; vacío = el API decide (el día de la junta, o 7 días). */
    pinned_until: z.string(),
}).superRefine((values, ctx) => {
    if (values.kind === "meeting" && !values.event_at) {
        ctx.addIssue({ code: "custom", path: ["event_at"], message: "Pon la fecha y la hora de la junta" });
    }
    if (values.kind === "update" && !values.link) {
        ctx.addIssue({ code: "custom", path: ["link"], message: "Pon la liga de la tienda para que puedan actualizar" });
    }
    if (values.link_label && !values.link) {
        ctx.addIssue({ code: "custom", path: ["link"], message: "El botón necesita una liga" });
    }
    if (values.pinned && values.pinned_until && endOfDay(values.pinned_until) < new Date()) {
        ctx.addIssue({ code: "custom", path: ["pinned_until"], message: "Esa fecha ya pasó" });
    }
});

export type ClientNotificationForm = z.infer<typeof ClientNotificationSchema>;

export const FORM_DEFAULT_VALUES: ClientNotificationForm = {
    title: "",
    body: "",
    segment: "all",
    kind: "info",
    link: "",
    link_label: "",
    event_at: "",
    pinned: false,
    pinned_until: "",
};

/**
 * Lo que va al API. Los campos del aviso sólo cuando aplican, y las fechas en UTC: el API las
 * lee con Carbon::parse, y una hora sin zona la tomaría como UTC (la junta de las 7 p. m. saldría
 * a la 1 p. m.). El navegador del equipo está en México, así que se convierten desde ahí.
 */
export const toPayload = (values: ClientNotificationForm) => {
    const link = values.link.trim();
    const linkLabel = values.link_label.trim();

    return {
        title: values.title,
        body: values.body,
        segment: values.segment,
        kind: values.kind,
        ...(link ? { link, ...(linkLabel ? { link_label: linkLabel } : {}) } : {}),
        ...(values.kind === "meeting" && values.event_at ? { event_at: new Date(values.event_at).toISOString() } : {}),
        ...(values.pinned
            ? {
                pinned: true,
                ...(values.pinned_until ? { pinned_until: endOfDay(values.pinned_until).toISOString() } : {}),
            }
            : {}),
    };
};

export type ClientNotificationPayload = ReturnType<typeof toPayload>;
