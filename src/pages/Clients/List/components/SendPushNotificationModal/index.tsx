import { useEffect } from "react";
import { CalendarClockIcon, MegaphoneIcon, PinIcon, SmartphoneIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import useCustomForm from "@/hooks/useCustomForm";
import useRequest from "@/hooks/useRequest";
import { API_ROUTES } from "@/constants/api";
import { ApiResponse } from "@/interfaces/common";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/uishadcn/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form";
import { Input } from "@/uishadcn/ui/input";
import { Label } from "@/uishadcn/ui/label";
import { RadioGroup, RadioGroupItem } from "@/uishadcn/ui/radio-group";
import { Textarea } from "@/uishadcn/ui/textarea";
import { ClientNotificationForm, ClientNotificationPayload, ClientNotificationSchema, endOfDay, FORM_DEFAULT_VALUES, NoticeKind, toPayload } from "./schema";
import useCountryStore from "@/store/country";
import { countryInfo } from "@/constants/countries";
import useFetchQuery from "@/hooks/useFetchQuery";
import { IPlan } from "@/interfaces/plans";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/uishadcn/ui/select";
import { APP_SECTIONS, appLinkKey, appSectionLabel, isAppLink, toAppLink, WEB_LINK } from "./appLinks";

interface SendPushNotificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SEGMENT_OPTIONS = [
    { label: "IOS", value: "ios" },
    { label: "Android", value: "android" },
    { label: "Todos", value: "all" },
];

const KIND_OPTIONS: Array<{ value: NoticeKind, label: string, hint: string, icon: typeof MegaphoneIcon, linkLabel: string, linkPlaceholder: string }> = [
    { value: "info", label: "Aviso", hint: "Un mensaje para todas", icon: MegaphoneIcon, linkLabel: "Ver más", linkPlaceholder: "https://…" },
    { value: "meeting", label: "Junta", hint: "Con fecha, hora y la liga de Zoom", icon: CalendarClockIcon, linkLabel: "Entrar a la junta", linkPlaceholder: "https://zoom.us/j/…" },
    { value: "update", label: "Actualización", hint: "Nueva versión de la app, con liga a la tienda", icon: SmartphoneIcon, linkLabel: "Actualizar la app", linkPlaceholder: "https://apps.apple.com/…" },
];

const OPTION_CARD = "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent";

/** "Plan Elite" · "Plan Elite y Plan Nacional" · "Plan Básico, Plan Elite y Plan Nacional" */
const listText = (names: string[]) => names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;

const whenText = (date: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date);
const dayText = (date: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(date);

/** Hasta cuándo se queda arriba de Hoy, dicho igual que lo decide el API: la fecha elegida, la junta o 7 días. */
const pinnedUntilText = ({ pinned_until, event_at, kind }: Pick<ClientNotificationForm, "pinned_until" | "event_at" | "kind">) => {
    if (pinned_until) return `hasta el ${dayText(endOfDay(pinned_until))}`;
    if (kind === "meeting" && event_at) return `hasta la junta (${whenText(new Date(event_at))})`;
    return `7 días, hasta el ${dayText(new Date(Date.now() + 7 * 86_400_000))}`;
};

const SendPushNotificationModal = ({ open, onOpenChange }: SendPushNotificationModalProps) => {
    const form = useCustomForm<ClientNotificationForm>(ClientNotificationSchema, FORM_DEFAULT_VALUES);
    const { request, requestState } = useRequest("POST");
    /* Una junta de México no les sirve a las de Colombia (ni al revés): el aviso va sólo al país que se mira arriba */
    const country = useCountryStore(state => state.country);
    const countryName = countryInfo(country).label;

    const kind = form.watch("kind");
    const pinned = form.watch("pinned");
    const eventAt = form.watch("event_at");
    const pinnedUntil = form.watch("pinned_until");
    const kindOption = KIND_OPTIONS.find((option) => option.value === kind) ?? KIND_OPTIONS[0];
    const link = form.watch("link");
    const planKeys = form.watch("plan_keys");
    const linkIsApp = isAppLink(link);

    /* Los planes, para mandar el aviso sólo a quien tiene (o no tiene) uno: «esto viene en el Plan Elite» */
    const { response: plans, loading: plansLoading } = useFetchQuery<IPlan[]>(API_ROUTES.PLANS.LIST, { customQueryKey: ["config", "plans", "aviso"], enabled: open });
    const plansWithKey = (plans ?? []).filter((plan) => !!plan.plan_key);
    const chosenPlans = plansWithKey.filter((plan) => planKeys.includes(plan.plan_key as string));
    const plansText = chosenPlans.length ? ` con ${listText(chosenPlans.map((plan) => plan.name))}` : "";

    // Una junta o una actualización llevan liga web (Zoom, la tienda): si venía una pantalla de la app, se limpia
    useEffect(() => {
        if (kind !== "info" && isAppLink(form.getValues("link"))) form.setValue("link", "", { shouldValidate: true });
    }, [kind, form]);

    const onSubmit = form.handleSubmit(async (values) => {
        const response = await request<ApiResponse<boolean>, ClientNotificationPayload>(API_ROUTES.CLIENTS_NOTIFICATIONS, toPayload(values, country));

        if (response.success) {
            toast.success(values.pinned ? `Aviso enviado a las clientas de ${countryName}${plansText} y fijado arriba de Hoy en la app` : `Aviso enviado a las clientas de ${countryName}${plansText}`);
            form.reset(FORM_DEFAULT_VALUES);
            onOpenChange(false);
        }
    });

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.reset(FORM_DEFAULT_VALUES);
        }
        onOpenChange(nextOpen);
    }

    return (
        <Modal
            open={open}
            onOpenChange={handleOpenChange}
            title="Enviar aviso"
            description="Les llega como notificación al celular. Si lo fijas, además se queda arriba de Hoy en la app hasta que lo cierren o venza."
            size="xl"
            className="max-h-[92vh] overflow-y-auto"
        >
            <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="kind"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de aviso</FormLabel>
                                <FormControl>
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {KIND_OPTIONS.map((option) => (
                                            <Label key={option.value} className={cn(OPTION_CARD, "items-start", field.value === option.value && "border-primary bg-primary/5")}>
                                                <RadioGroupItem value={option.value} className="mt-0.5" />
                                                <span className="grid gap-0.5">
                                                    <span className="flex items-center gap-1.5"><option.icon className="size-4" /> {option.label}</span>
                                                    <span className="text-xs font-normal text-muted-foreground">{option.hint}</span>
                                                </span>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título</FormLabel>
                                <FormControl>
                                    <Input placeholder={kind === "meeting" ? "Ej. Junta de Directoras este jueves" : "Ingresa el título del aviso"} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mensaje</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Escribe el contenido del aviso" className="min-h-28 resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {kind === "meeting" && (
                        <FormField
                            control={form.control}
                            name="event_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha y hora de la junta</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="sm:max-w-64 dark:[color-scheme:dark]" {...field} />
                                    </FormControl>
                                    <FormDescription>Hora del centro de México.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
                        <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{kind === "update" ? "Liga de la tienda" : kind === "meeting" ? "Liga de Zoom" : "Botón del aviso (opcional)"}</FormLabel>
                                    {kind === "info" && (
                                        /* Una pantalla de la app (app://retos) o una página web: la app abre la pantalla adentro, sin navegador */
                                        <Select value={appLinkKey(field.value) ?? WEB_LINK} onValueChange={(value) => field.onChange(value === WEB_LINK ? "" : toAppLink(value))}>
                                            <SelectTrigger aria-label="A dónde lleva el botón"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={WEB_LINK}>Una página web (pega la liga abajo)</SelectItem>
                                                <SelectGroup>
                                                    <SelectLabel>Abrir una pantalla de la app</SelectLabel>
                                                    {APP_SECTIONS.map((section) => (
                                                        <SelectItem key={section.key} value={section.key}>{section.label}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {linkIsApp ? (
                                        <FormDescription>
                                            Abre <b className="font-semibold text-foreground">{appSectionLabel(field.value) ?? field.value}</b> dentro de la app.
                                            Funciona desde la versión 2.2.0 (41); en las anteriores el botón no abre nada.
                                        </FormDescription>
                                    ) : (
                                        <FormControl>
                                            <Input type="url" inputMode="url" placeholder={kindOption.linkPlaceholder} {...field} />
                                        </FormControl>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="link_label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Texto del botón</FormLabel>
                                    <FormControl>
                                        <Input placeholder={linkIsApp ? `Ver ${appSectionLabel(link) ?? "en la app"}` : kindOption.linkLabel} maxLength={60} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="rounded-md border p-4">
                        <FormField
                            control={form.control}
                            name="pinned"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="flex cursor-pointer items-start gap-3">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} className="mt-0.5" />
                                        </FormControl>
                                        <span className="grid gap-0.5">
                                            <span className="flex items-center gap-1.5 text-sm font-medium"><PinIcon className="size-4" /> Fijar en la app</span>
                                            <span className="text-xs font-normal text-muted-foreground">Se queda arriba de Hoy hasta que la clienta lo cierre o venza.</span>
                                        </span>
                                    </Label>
                                </FormItem>
                            )}
                        />

                        {pinned && (
                            <FormField
                                control={form.control}
                                name="pinned_until"
                                render={({ field }) => (
                                    <FormItem className="mt-4 pl-7">
                                        <FormLabel>Fijar hasta (opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="sm:max-w-48 dark:[color-scheme:dark]" {...field} />
                                        </FormControl>
                                        <FormDescription>Se queda fijo {pinnedUntilText({ pinned_until: pinnedUntil, event_at: eventAt, kind })}.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name="segment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Segmento</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                                    >
                                        {SEGMENT_OPTIONS.map((option) => (
                                            <Label key={option.value} className={OPTION_CARD}>
                                                <RadioGroupItem value={option.value} />
                                                {option.label}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="plan_keys"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1.5"><UsersIcon className="size-4" /> Planes</FormLabel>
                                <FormDescription>Sin marcar ninguno va a todas. Márcalos para avisar sólo a quien tiene un plan, o a quien no lo tiene y le conviene.</FormDescription>
                                {plansWithKey.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        {plansWithKey.map((plan) => {
                                            const key = plan.plan_key as string;
                                            const checked = field.value.includes(key);
                                            return (
                                                <Label key={plan.id} className={cn(OPTION_CARD, "py-2.5", checked && "border-primary bg-primary/5")}>
                                                    <Checkbox checked={checked} onCheckedChange={(state) => field.onChange(state === true ? [...field.value, key] : field.value.filter((item) => item !== key))} />
                                                    <span className="flex items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: plan.color || "#999" }} />{plan.name}</span>
                                                </Label>
                                            );
                                        })}
                                    </div>
                                )}
                                {plansLoading && <p className="text-xs text-muted-foreground">Cargando los planes…</p>}
                                {!plansLoading && plansWithKey.length === 0 && <p className="text-xs text-muted-foreground">El API todavía no manda la llave de cada plan: el aviso va a todos los planes.</p>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                        Les llega sólo a las clientas de <b className="font-semibold text-foreground">{countryName}</b> (el país que estás viendo arriba)
                        {chosenPlans.length ? <> con <b className="font-semibold text-foreground">{listText(chosenPlans.map((plan) => plan.name))}</b></> : ", de todos los planes"}.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            text="Cancelar"
                            variant="outline"
                            rounded
                            disabled={requestState.loading}
                            onClick={() => handleOpenChange(false)}
                        />
                        <Button
                            text={pinned ? "Enviar y fijar" : "Enviar aviso"}
                            type="submit"
                            color="primary"
                            rounded
                            loading={requestState.loading}
                        />
                    </div>
                </form>
            </Form>
        </Modal>
    )
}

export default SendPushNotificationModal;
