import { useFieldArray } from "react-hook-form";
import { z } from "zod"

import useCustomForm from "@/hooks/useCustomForm";
import { ITemplate } from "@/interfaces/templates";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form";
import Dropdown from "@/components/common/Inputs/Dropdown";
import { RENDER_ASSETS_TYPES } from "../utils";
import { Input } from "@/uishadcn/ui/input";
import Button from "@/components/common/Button";
import { Separator } from "@/uishadcn/ui/separator";
import { PlusIcon, Trash2Icon } from "lucide-react";
import useRequestQuery from "@/hooks/useRequestQuery";
import { toast } from "sonner";
import { API_ROUTES } from "@/constants/api";
import { queryKeys } from "@/utils/queryKeys";


const FormSchema = z.object({
    composition: z.string().nonempty().max(255),
    assets: z.array(z.object({
        layerName: z.string().nonempty().max(255),
        type: z.enum(['image', 'video', 'audio', 'data']),
        value: z.string().nonempty().max(30)
    }))
})

type FormType = z.infer<typeof FormSchema>

interface NexrenderFormSettingsProps {
    template: ITemplate;
}

const NexrenderFormSettings = ({ template }: NexrenderFormSettingsProps) => {
    const form = useCustomForm<FormType>(FormSchema, {
        composition: template.render_configuration?.composition || '',
        assets: template.render_configuration?.assets || [{
            layerName: '',
            type: 'data',
            value: ''
        }]
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "assets"
    });

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.detail(`template`, template.id)],
        onSuccess: () => {
            toast.success(`Configuración guardada`);
        },
        onError: (error) => {
            toast.error(`Error al guardar la configuracion: ${error.message}`);
        }
    })

    const onSubmit = async (data: FormType) => {
        await request<{ render_configuration: FormType }, ITemplate>(
            'PUT',
            API_ROUTES.TEMPLATES.UPDATE.replace('{id}', template.id),
            {
                render_configuration: {
                    composition: data.composition,
                    assets: data.assets
                }
            }
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <FormField
                    control={form.control}
                    name="composition"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Dropdown
                                    className="max-w-xs"
                                    label="Selecciona la composición a usar de la plantilla"
                                    placeholder="Selecciona una composición"
                                    value={field.value}
                                    onChange={field.onChange}
                                    items={(template.assets_data?.compositions || []).map(c => ({
                                        value: c,
                                        label: c
                                    }))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {fields.map((field, index) => (
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex gap-2">
                            <Button
                                color="danger"
                                text={<Trash2Icon className="text-red-500" />}
                                size='icon'
                                variant='ghost'
                                disabled={fields.length === 1}
                                className="mt-6"
                                onClick={remove.bind(null, index)}
                            />

                            <FormField
                                control={form.control}
                                name={`assets.${index}.layerName`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Dropdown
                                                label="Capas"
                                                placeholder="Selecciona una capa"
                                                value={field.value}
                                                onChange={field.onChange}
                                                items={(template.assets_data?.layers || []).map(l => ({
                                                    value: l.layerName,
                                                    label: l.layerName
                                                }))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name={`assets.${index}.type`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Dropdown
                                            label="Tipo de la capa"
                                            placeholder="Selecciona un tipo de capa"
                                            value={field.value}
                                            onChange={field.onChange}
                                            items={RENDER_ASSETS_TYPES.map(c => ({
                                                value: c.value,
                                                label: c.label
                                            }))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`assets.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor a reemplazar en la capa</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Valor (Propiedad del JSON)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Se debe ingresar el nombre de la propiedad del JSON que se usará para reemplazar el valor de la capa.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}

                <Button
                    text={
                        <div className="flex items-center gap-x-2">
                            <PlusIcon />
                            Agregar recurso
                        </div>
                    }
                    size='sm'
                    variant='ghost'
                    disabled={fields.length === (template.assets_data?.layers.length || 0)}
                    onClick={append.bind(null, { layerName: '', type: 'data', value: '' })}
                />

                <Separator />

                <Button
                    text='Guardar'
                    type="submit"
                    color="primary"
                    rounded
                    loading={requestState.loading}
                    className="mx-auto"
                />
            </form>
        </Form>
    )
}

export default NexrenderFormSettings