import { z } from "zod"
import { ITemplate } from "@/interfaces/templates"

const GenericMetadataSchema = z.object({
    pink_circle_months: z.string().nullable().optional(),
})

// `template_asset_type` was removed from the create/edit form: the new
// TemplateVariant model is the source of truth for the output format(s)
// each template supports. The column still exists for backwards compat
// with legacy rows but is no longer set from this form.
export const TemplateSchema = z.object({
    name: z.string().min(3, { message: "El nombre es requerido" }).max(255),
    active: z.boolean(),
    template_group: z.string('El grupo de la plantilla es requerido').nonempty('El grupo de la plantilla es requerido'),
    template_subgroup: z.string().nullable().optional(),
    enabled_all_clients: z.boolean(),
    font_color: z.string().nullable().optional(),
    month: z.int('El mes de la plantilla es requerido'),
    metadata: GenericMetadataSchema.optional().nullable(),
    // AI preset slug — declares the layer composition the analyzer
    // must detect. Must live in the schema or Zod strips it on submit
    // (the dropdown lives in the form but never reaches the backend).
    preset_slug: z.string().nullable().optional(),
})

// The backend caps the template name at 50 chars (the create form schema
// allows more, but the API rejects anything longer).
const MAX_TEMPLATE_NAME_LENGTH = 50
const CLONE_NAME_SUFFIX = " (copia)"

/**
 * Suggested name for a cloned template: original + " (copia)", trimmed so the
 * suffix always survives within the backend's 50-char limit.
 */
export const buildCloneName = (name: string): string => {
    const candidate = `${name}${CLONE_NAME_SUFFIX}`
    if (candidate.length <= MAX_TEMPLATE_NAME_LENGTH) return candidate

    const baseMaxLength = MAX_TEMPLATE_NAME_LENGTH - CLONE_NAME_SUFFIX.length
    return `${name.slice(0, baseMaxLength).trimEnd()}${CLONE_NAME_SUFFIX}`
}

/**
 * Pre-fill values for the create-template form when cloning: every editable
 * field copied from the source, with a suggested clone name. The variant
 * configuration is cloned server-side and isn't part of this form.
 */
export const buildCloneFormValues = (template: ITemplate): z.infer<typeof TemplateSchema> => ({
    name: buildCloneName(template.name),
    active: template.active,
    template_group: template.template_group,
    template_subgroup: template.template_subgroup ?? null,
    enabled_all_clients: template.enabled_all_clients,
    font_color: template.font_color ?? null,
    month: template.month,
    metadata: template.metadata ?? { pink_circle_months: null },
    preset_slug: template.preset_slug ?? null,
})

export const FORM_DEFAULT_VALUES = {
    name: "",
    active: false,
    template_group: "",
    template_subgroup: null,
    font_color: null,
    enabled_all_clients: false,
    month: 0,
    metadata: {
        pink_circle_months: null,
    },
    preset_slug: null,
}

export const RENDER_ASSETS_TYPES = [
    { label: 'Texto', value: 'data' },
    { label: 'Imagen', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' }
]

export const PINK_CIRCLE_MONTHS_OPTIONS = [
    { label: '2 Meses', value: '2-months' },
    { label: '3 Meses', value: '3-months' },
    { label: '4 Meses', value: '4-months' },
    { label: '5 Meses', value: '5-months' },
    { label: '6 Meses', value: '6-months' },
    { label: '7 Meses', value: '7-months' },
    { label: '8 Meses', value: '8-months' },
    { label: '9 Meses', value: '9-months' },
    { label: '10 Meses', value: '10-months' },
    { label: '11 Meses', value: '11-months' },
    { label: '12 Meses', value: '12-months' },
    { label: '13 - 23 Meses', value: '13_23-months' },
    { label: '24 - 35 Meses', value: '24_35-months' },
    { label: '36 - 300 Meses', value: '36_300-months' },
]