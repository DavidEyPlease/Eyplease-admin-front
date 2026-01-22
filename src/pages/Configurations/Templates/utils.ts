import { z } from "zod"

export const TemplateSchema = z.object({
    name: z.string().min(3, { message: "El nombre es requerido" }).max(255),
    active: z.boolean(),
    template_group: z.string('El grupo de la plantilla es requerido').nonempty(),
    enabled_all_clients: z.boolean()
})

export const FORM_DEFAULT_VALUES = {
    name: "",
    active: false,
    template_group: "",
    enabled_all_clients: false
}

export const TEMPLATE_GROUPS = [
    { label: 'Reportes', value: 'reports' },
    { label: 'Cumpleaños', value: 'birthdays' },
    { label: 'Estrellas', value: 'stars' },
    { label: 'Cuador de honor', value: 'honor_board' },
    { label: 'Nuevos inicios', value: 'new_beginnings' },
    { label: 'Camino al éxito', value: 'path_to_success' },
    { label: 'Aniversarios', value: 'anniversaries' },
    { label: 'Directora en calificación', value: 'director_in_rating' },
    { label: 'Corte de ventas', value: 'sales_cut' },
    { label: 'Corte de iniciación', value: 'initiation_cut' },
    { label: 'Unit club', value: 'unit_club' },
]

export const RENDER_ASSETS_TYPES = [
    { label: 'Texto', value: 'data' },
    { label: 'Imagen', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' }
]