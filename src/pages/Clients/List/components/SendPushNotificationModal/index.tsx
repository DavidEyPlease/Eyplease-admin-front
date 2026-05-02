import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import useCustomForm from "@/hooks/useCustomForm";
import useRequest from "@/hooks/useRequest";
import { API_ROUTES } from "@/constants/api";
import { ApiResponse } from "@/interfaces/common";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form";
import { Input } from "@/uishadcn/ui/input";
import { Label } from "@/uishadcn/ui/label";
import { RadioGroup, RadioGroupItem } from "@/uishadcn/ui/radio-group";
import { Textarea } from "@/uishadcn/ui/textarea";
import { toast } from "sonner";
import { ClientNotificationForm, ClientNotificationSchema, FORM_DEFAULT_VALUES } from "./schema";

interface SendPushNotificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SEGMENT_OPTIONS = [
    { label: "IOS", value: "ios" },
    { label: "Android", value: "android" },
    { label: "Todos", value: "all" },
];

const SendPushNotificationModal = ({ open, onOpenChange }: SendPushNotificationModalProps) => {
    const form = useCustomForm<ClientNotificationForm>(ClientNotificationSchema, FORM_DEFAULT_VALUES);
    const { request, requestState } = useRequest("POST");

    const onSubmit = form.handleSubmit(async (values) => {
        const response = await request<ApiResponse<boolean>, ClientNotificationForm>(API_ROUTES.CLIENTS_NOTIFICATIONS, values);

        if (response.success) {
            toast.success("Notificación enviada a los clientes");
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
            title="Enviar notificación push"
            description="Redacta el mensaje y selecciona el segmento de clientes que lo recibirá."
            size="lg"
        >
            <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el título de la notificación" {...field} />
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
                                    <Textarea placeholder="Escribe el contenido de la notificación" className="min-h-28 resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                            <Label
                                                key={option.value}
                                                className="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                                            >
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
                            text="Enviar notificación"
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