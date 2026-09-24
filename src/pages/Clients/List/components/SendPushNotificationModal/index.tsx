import { CalendarClockIcon, MegaphoneIcon, PinIcon, SmartphoneIcon } from "lucide-react";
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

    const kind = form.watch("kind");
    const pinned = form.watch("pinned");
    const eventAt = form.watch("event_at");
    const pinnedUntil = form.watch("pinned_until");
    const kindOption = KIND_OPTIONS.find((option) => option.value === kind) ?? KIND_OPTIONS[0];

    const onSubmit = form.handleSubmit(async (values) => {
        const response = await request<ApiResponse<boolean>, ClientNotificationPayload>(API_ROUTES.CLIENTS_NOTIFICATIONS, toPayload(values));

        if (response.success) {
            toast.success(values.pinned ? "Aviso enviado y fijado arriba de Hoy en la app" : "Aviso enviado a las clientas");
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
                                    <FormLabel>{kind === "update" ? "Liga de la tienda" : "Liga (opcional)"}</FormLabel>
                                    <FormControl>
                                        <Input type="url" inputMode="url" placeholder={kindOption.linkPlaceholder} {...field} />
                                    </FormControl>
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
                                        <Input placeholder={kindOption.linkLabel} maxLength={60} {...field} />
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
