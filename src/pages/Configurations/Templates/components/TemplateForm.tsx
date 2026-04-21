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
import { FORM_DEFAULT_VALUES, TemplateSchema } from "../utils"
import useRequestQuery from "@/hooks/useRequestQuery"
import Button from "@/components/common/Button"
import Switch from "@/components/common/Inputs/Switch"
import { ApiResponse } from "@/interfaces/common"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import useAuthStore from "@/store/auth"
import { RadioGroup, RadioGroupItem } from "@/uishadcn/ui/radio-group"
import { Label } from "@/uishadcn/ui/label"

interface TemplateFormProps {
    item?: ITemplate | null
    onSuccess?: (template: ITemplate) => void;
}

type FormType = z.infer<typeof TemplateSchema>

const TemplateForm = ({ item, onSuccess }: TemplateFormProps) => {
    const { utilData } = useAuthStore(state => state)
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

    const templateGroups = [
        {
            label: 'Reportes de boletín',
            value: 'reports'
        },
        {
            label: 'Cumpleaños Mis Clientes',
            value: 'customers-birthdays'
        },
        ...utilData.newsletters.map(n => {
            return n.sections.filter(i => i.has_publish_posts).map(s => ({
                label: `${n.name} - ${s.name}`,
                value: s.sectionKey
            }))
        }).flat()
    ]

    const templateGroupValue = form.watch('template_group');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="template_group"
                        disabled={Boolean(item)}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grupo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="w-full">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar grupo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {templateGroups.map((type) => (
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
                </div>

                {templateGroupValue === 'reports' && (
                    <FormField
                        control={form.control}
                        name="font_color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color de la fuente</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el color de la fuente" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {templateGroupValue && templateGroupValue !== 'reports' && (
                    <FormField
                        control={form.control}
                        name="template_asset_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de recurso</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={e => field.onChange(e as 'image' | 'video')}
                                        className="w-fit"
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="image" id="r1" />
                                            <Label htmlFor="r1">Imagen</Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="video" id="r2" />
                                            <Label htmlFor="r2">Video</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="grid md:grid-cols-2 gap-4">
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
                </div>

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