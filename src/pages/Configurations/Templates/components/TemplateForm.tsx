import { Input } from "@/uishadcn/ui/input"
import { Separator } from "@/uishadcn/ui/separator"
import useCustomForm from "@/hooks/useCustomForm"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form"
import { z } from "zod"
import { API_ROUTES } from "@/constants/api"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import { useEffect } from "react"
import { ITemplate } from "@/interfaces/templates"
import { FORM_DEFAULT_VALUES, TEMPLATE_GROUPS, TemplateSchema } from "../utils"
import useRequestQuery from "@/hooks/useRequestQuery"
import Button from "@/components/common/Button"
import Switch from "@/components/common/Inputs/Switch"
import { ApiResponse } from "@/interfaces/common"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"

interface TemplateFormProps {
    item?: ITemplate | null
    onSuccess?: (template: ITemplate) => void;
}

type FormType = z.infer<typeof TemplateSchema>

const TemplateForm = ({ item, onSuccess }: TemplateFormProps) => {
    const form = useCustomForm(
        TemplateSchema,
        item ?? FORM_DEFAULT_VALUES
    );

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('config/templates')],
        onSuccess: (response: ApiResponse<ITemplate>) => {
            toast.success(`Plantilla guardada`);
            if (!item) form.reset();
            onSuccess?.(response.data);
        },
        onError: (error) => {
            toast.error(`Error al guardar la plantilla: ${error.message}`);
        }
    })

    const onSubmit = async (values: FormType) => {
        let endpoint = API_ROUTES.TEMPLATES.CREATE
        if (item) {
            endpoint = API_ROUTES.TEMPLATES.UPDATE.replace('{id}', item.id)
        }
        await request<FormType, ITemplate>(
            item ? 'PUT' : 'POST',
            endpoint,
            values
        )
    }

    useEffect(() => {
        return () => {
            // Reset form and item update when component unmounts
            form.reset();
        }
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <FormField
                    control={form.control}
                    name="template_group"
                    disabled={Boolean(item)}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Grupo
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar grupo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {TEMPLATE_GROUPS.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ingresa el nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Activar en el sistema</FormLabel>
                            <FormControl>
                                <Switch
                                    id="active"
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                    aria-readonly
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enabled_all_clients"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Activar a todos los clientes</FormLabel>
                            <FormControl>
                                <Switch
                                    id="enabled_all_clients"
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                    aria-readonly
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Separator />

                <Button
                    text='Guardar'
                    type="submit"
                    color="primary"
                    rounded
                    block
                    loading={requestState.loading}
                />
            </form>
        </Form>
    )
}

export default TemplateForm