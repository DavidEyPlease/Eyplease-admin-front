import useCustomForm from "@/hooks/useCustomForm";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form"
import { CreateClientSchema, FORM_DEFAULT_VALUES, FormType } from "../Create/form";
import { Input } from "@/uishadcn/ui/input";
import { Separator } from "@/uishadcn/ui/separator";
import Button from "@/components/common/Button";
import PlanSelector from "@/components/generics/PlanSelector";
import Dropdown from "@/components/common/Inputs/Dropdown";
import { COUNTRIES_LIST } from "@/constants/app";
import useRequestQuery from "@/hooks/useRequestQuery";
import { IClient } from "@/interfaces/clients";
import { ApiResponse } from "@/interfaces/common";
import { toast } from "sonner";
import { API_ROUTES } from "@/constants/api";

interface BasicInfoProps {
    client?: IClient;
    onSuccess: (client: IClient) => void;
}

const BasicInfoForm = ({ client, onSuccess }: BasicInfoProps) => {
    const form = useCustomForm(
        CreateClientSchema,
        client ? {
            name: client.name,
            email: client.user.email,
            username: client.account,
            plan_id: client.user.plan?.id || '',
            country: client.country,
            mk_password: '',
        } : FORM_DEFAULT_VALUES
    );

    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<IClient>) => {
            toast.success(`Cliente creado exitosamente`);
            onSuccess(response.data);
        },
        onError: (error) => {
            toast.error(`Error al crear el cliente: ${error.message}`);
        }
    })

    const onSubmit = async (values: FormType) => {
        await request<FormType, IClient>(
            'POST',
            API_ROUTES.CLIENTS.CREATE,
            values
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el nombre del cliente" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el correo electrónico" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cuenta de Mary Kay (Usuario Eyplease)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el número de cuenta" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mk_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña de Mary Kay</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa la contraseña" {...field} value={field.value || ''} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>País del cliente</FormLabel>
                                <Dropdown
                                    placeholder="Selecciona un pais"
                                    value={field.value}
                                    onChange={e => field.onChange(e)}
                                    items={COUNTRIES_LIST}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="plan_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan del cliente</FormLabel>
                                <FormControl>
                                    <PlanSelector
                                        mode="single"
                                        value={field.value}
                                        onChange={e => field.onChange(e)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                <Button
                    text='Guardar'
                    type="submit"
                    color="primary"
                    rounded
                    loading={requestState.loading}
                />
            </form>
        </Form>
    )
}

export default BasicInfoForm;