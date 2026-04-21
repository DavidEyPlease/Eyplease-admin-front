import { z } from "zod"

export const TemplateSchema = z.object({
    name: z.string().min(3, { message: "El nombre es requerido" }).max(255),
    active: z.boolean(),
    template_group: z.string('El grupo de la plantilla es requerido').nonempty(),
    template_asset_type: z.enum(['image', 'video']).nullable().optional(),
    enabled_all_clients: z.boolean(),
    font_color: z.string().nullable().optional(),
}).superRefine((val, ctx) => {
    // Si el grupo no es 'reports' y el asset_type está vacío/undefined
    if (val.template_group !== 'reports' && !val.template_asset_type) {
        ctx.addIssue({
            code: 'custom',
            message: "El tipo de asset es requerido para este grupo de plantilla",
            input: val.template_asset_type,
        });
    }
});

export const FORM_DEFAULT_VALUES = {
    name: "",
    active: false,
    template_group: "",
    font_color: null,
    template_asset_type: null,
    enabled_all_clients: false
}

export const RENDER_ASSETS_TYPES = [
    { label: 'Texto', value: 'data' },
    { label: 'Imagen', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' }
]