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
import { FORM_DEFAULT_VALUES, PINK_CIRCLE_MONTHS_OPTIONS, TemplateSchema } from "../utils"
import useRequestQuery from "@/hooks/useRequestQuery"
import Button from "@/components/common/Button"
import Switch from "@/components/common/Inputs/Switch"
import { ApiResponse, INewsletterSectionItem } from "@/interfaces/common"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import useAuthStore from "@/store/auth"
import Dropdown from "@/components/common/Inputs/Dropdown"
import { MONTHS_OPTIONS } from "@/constants/app"
import useFetchQuery from "@/hooks/useFetchQuery"
import useTemplatePresets from "../useTemplatePresets"

interface TemplateFormProps {
    item?: ITemplate | null
    isReportsTemplates?: boolean
    onSuccess?: (template: ITemplate) => void;
}

type FormType = z.infer<typeof TemplateSchema>

const parseTemplateMonth = (month: number) => {
    if (month < 10) return `0${month}`
    return month.toString();
}

const TemplateForm = ({ item, isReportsTemplates, onSuccess }: TemplateFormProps) => {
    const { utilData } = useAuthStore(state => state)
    const form = useCustomForm(
        TemplateSchema,
        item ?? { ...FORM_DEFAULT_VALUES, template_group: isReportsTemplates ? 'reports' : '' }
    );

    const { request, requestState } = useRequestQuery({
        // Invalidate every cache key that may show this template's data:
        //   - the legacy `config/templates` list (used by some screens)
        //   - the detail (so the open Detail page refreshes after edits
        //     like changing preset_slug, name, group, etc.)
        invalidateQueries: [
            queryKeys.list('config/templates'),
            ...(item ? [queryKeys.detail('templates', item.id)] : []),
        ],
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
        const { metadata, ...rest } = values
        await request<FormType, ITemplate>(
            item ? 'PUT' : 'POST',
            endpoint,
            { ...rest, ...(metadata ? { metadata } : {}) }
        )
    }

    const {
        response: subGroups,
    } = useFetchQuery<INewsletterSectionItem[]>(API_ROUTES.GET_NEWSLETTER_SECTION_ITEMS.replace('{sectionKey}', form.watch('template_group')), {
        enabled: !!form.watch('template_group') && !['reports', 'customers-birthdays'].includes(form.watch('template_group')),
        customQueryKey: queryKeys.list('newsletter_section_items', { section: form.watch('template_group') })
    })

    // AI presets catalog — cached app-wide by useTemplatePresets.
    const { response: presets } = useTemplatePresets()
    const presetOptions = presets?.map(preset => ({ label: preset.name, value: preset.slug })) ?? []

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
                <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Dropdown
                                        label="Mes de la plantilla"
                                        placeholder="Selecciona un mes"
                                        value={field.value ? parseTemplateMonth(field.value) : ''}
                                        onChange={e => field.onChange(parseInt(e))}
                                        items={MONTHS_OPTIONS}
                                        error={form.formState?.errors?.month?.message}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="template_group"
                        // disabled={Boolean(item) || isReportsTemplates}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grupo</FormLabel>
                                <Select
                                    disabled={Boolean(item) || isReportsTemplates}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
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
                        name="template_subgroup"
                        render={({ field }) => (
                            <FormItem>
                                <Dropdown
                                    className="max-w-xs"
                                    label="Subgrupo"
                                    disabled={!templateGroupValue || templateGroupValue === 'reports'}
                                    placeholder="Selecciona un subgrupo"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={form.formState?.errors?.template_subgroup?.message}
                                    items={subGroups ? subGroups.map(s => ({ label: s.name, value: s.item_key })) : []}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {['pink_circle'].includes(templateGroupValue) &&
                    <div>
                        <FormField
                            control={form.control}
                            name="metadata.pink_circle_months"
                            render={({ field }) => (
                                <FormItem>
                                    <Dropdown
                                        className="max-w-xs"
                                        label="Meses del círculo rosa"
                                        disabled={!templateGroupValue || templateGroupValue === 'reports'}
                                        placeholder="Selecciona un mes o rango de meses"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        error={form.formState?.errors?.metadata?.pink_circle_months?.message}
                                        items={PINK_CIRCLE_MONTHS_OPTIONS}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                }

                <FormField
                    control={form.control}
                    name="preset_slug"
                    render={({ field }) => (
                        <FormItem>
                            <Dropdown
                                className="max-w-md"
                                label="Preset de IA"
                                disabled={templateGroupValue === 'reports'}
                                placeholder="Selecciona un preset"
                                value={field.value ?? ''}
                                onChange={value => field.onChange(value || null)}
                                error={form.formState?.errors?.preset_slug?.message}
                                items={presetOptions}
                            />
                            <p className="text-xs text-muted-foreground">
                                Composición de capas que la IA usará al analizar las variantes.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="font_color"
                    disabled={templateGroupValue !== 'reports'}
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
                    className="w-max mx-auto"
                    loading={requestState.loading}
                />
            </form>
        </Form>
    )
}

export default TemplateForm