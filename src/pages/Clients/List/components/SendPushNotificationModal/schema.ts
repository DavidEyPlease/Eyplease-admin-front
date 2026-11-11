import { z } from "zod";

import { APP_LINK_PATTERN, isAppLink } from "./appLinks";

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
/** El primer instante del día elegido (la repetición sale desde la mañana de ese día). */
export const startOfDay = (date: string) => new Date(`${date}T00:00:00`);

/** Cuentas que NO lo reciben por omisión: la 028616 es la cuenta sin cobro (la mamá de David). */
export const DEFAULT_EXCLUDED_ACCOUNTS = "028616";

/** «028616, 186234MX» o una por renglón → ["028616", "186234MX"] */
export const parseAccounts = (text: string) => [...new Set(text.split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean))];

/**
 * La app de tienda no puede anunciar precios ni cómo pagar (Apple 3.1.1 / 3.1.3, Pagos de Google: causa de baja de la
 * cuenta de desarrollador). Se avisa en el formulario si el texto lo parece; no bloquea (el aviso también llega a la web).
 */
export const looksLikePrice = (text: string) => /\$\s?\d|\bprecio|\bdescuento|\bpaga[rs]?\b|\bcuesta\b|\bofert|\bpromoci[oó]n|%\s?(de\s)?desc/i.test(text);

export const ClientNotificationSchema = z.object({
    title: z.string().min(1, { message: "El título es requerido" }).max(120, { message: "El título no puede superar 120 caracteres" }),
    body: z.string().min(1, { message: "El mensaje es requerido" }).max(500, { message: "El mensaje no puede superar 500 caracteres" }),
    segment: z.enum(["ios", "android", "all"], { message: "Selecciona un segmento" }),
    kind: z.enum(NOTICE_KINDS),
    /** Web (https://…) o interna (`app://retos`: abre esa pantalla adentro de la app; ver `appLinks.ts`) */
    link: z.string().trim().max(500, { message: "La liga no puede superar 500 caracteres" })
        .refine((value) => !value || isWebUrl(value) || APP_LINK_PATTERN.test(value), { message: "Pon la liga completa, empezando con https://, o elige una pantalla de la app" }),
    link_label: z.string().trim().max(60, { message: "El texto del botón no puede superar 60 caracteres" }),
    /** Sólo a las clientas de estos planes (`plan_key`); vacío = a todos los planes */
    plan_keys: z.array(z.string()),
    /** «AAAA-MM-DDTHH:mm» del campo de fecha y hora; vacío si no es junta. */
    event_at: z.string(),
    pinned: z.boolean(),
    /** «AAAA-MM-DD»; vacío = el API decide (el día de la junta, o 7 días). */
    pinned_until: z.string(),
    /** La imagen vertical 4:5 ya subida (`url` que regresa `POST notifications/image`); vacío = sin imagen */
    image_url: z.string(),
    /** Cuentas que no lo reciben, separadas por coma o espacio */
    exclude_accounts: z.string().max(4000, { message: "Son demasiadas cuentas" }),
    /** «AAAA-MM-DDTHH:mm»: sale a esa hora; vacío = ya */
    send_at: z.string(),
    /** «AAAA-MM-DD»: la ventana de la app sale una vez más desde ese día; vacío = una sola vez */
    repeat_at: z.string(),
}).superRefine((values, ctx) => {
    if (values.send_at && new Date(values.send_at) < new Date()) {
        ctx.addIssue({ code: "custom", path: ["send_at"], message: "Esa hora ya pasó" });
    }
    if (values.repeat_at && !values.pinned) {
        ctx.addIssue({ code: "custom", path: ["repeat_at"], message: "Para repetir la ventana, fija el aviso en la app" });
    }
    if (values.repeat_at && values.pinned_until && startOfDay(values.repeat_at) > endOfDay(values.pinned_until)) {
        ctx.addIssue({ code: "custom", path: ["repeat_at"], message: "Debe ser antes de que deje de estar fijo" });
    }
    if (values.repeat_at && startOfDay(values.repeat_at) <= (values.send_at ? new Date(values.send_at) : new Date())) {
        ctx.addIssue({ code: "custom", path: ["repeat_at"], message: "Debe ser después de que salga el aviso" });
    }
    if (values.kind === "meeting" && !values.event_at) {
        ctx.addIssue({ code: "custom", path: ["event_at"], message: "Pon la fecha y la hora de la junta" });
    }
    if (values.kind === "update" && !values.link) {
        ctx.addIssue({ code: "custom", path: ["link"], message: "Pon la liga de la tienda para que puedan actualizar" });
    }
    if (values.kind !== "info" && values.link && isAppLink(values.link)) {
        ctx.addIssue({ code: "custom", path: ["link"], message: values.kind === "meeting" ? "La liga de una junta es la de Zoom (https://)" : "La liga de una actualización es la de la tienda (https://)" });
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
    plan_keys: [],
    event_at: "",
    pinned: false,
    pinned_until: "",
    image_url: "",
    exclude_accounts: DEFAULT_EXCLUDED_ACCOUNTS,
    send_at: "",
    repeat_at: "",
};

/**
 * Lo que va al API. Los campos del aviso sólo cuando aplican, y las fechas en UTC: el API las
 * lee con Carbon::parse, y una hora sin zona la tomaría como UTC (la junta de las 7 p. m. saldría
 * a la 1 p. m.). El navegador del equipo está en México, así que se convierten desde ahí.
 */
/** `country`: sólo a las clientas de ese país (el que se mira en el panel); sin él, a todas. `plan_keys` sólo si se marcó alguno. */
export const toPayload = (values: ClientNotificationForm, country?: string) => {
    const link = values.link.trim();
    const linkLabel = values.link_label.trim();
    const excluded = parseAccounts(values.exclude_accounts);

    return {
        ...(country ? { country } : {}),
        title: values.title,
        body: values.body,
        segment: values.segment,
        kind: values.kind,
        ...(values.plan_keys.length ? { plan_keys: values.plan_keys } : {}),
        ...(link ? { link, ...(linkLabel ? { link_label: linkLabel } : {}) } : {}),
        ...(values.kind === "meeting" && values.event_at ? { event_at: new Date(values.event_at).toISOString() } : {}),
        ...(values.pinned
            ? {
                pinned: true,
                ...(values.pinned_until ? { pinned_until: endOfDay(values.pinned_until).toISOString() } : {}),
                ...(values.repeat_at ? { repeat_at: startOfDay(values.repeat_at).toISOString() } : {}),
            }
            : {}),
        ...(values.image_url ? { image_url: values.image_url } : {}),
        ...(excluded.length ? { exclude_accounts: excluded } : {}),
        ...(values.send_at ? { send_at: new Date(values.send_at).toISOString() } : {}),
    };
};

export type ClientNotificationPayload = ReturnType<typeof toPayload>;
