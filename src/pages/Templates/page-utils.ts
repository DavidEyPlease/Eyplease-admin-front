export type TemplateFilters = {
    template_group: string
    not_template_group: string
    active: string
    month: string
    template_subgroup: string
    template_asset_type: 'image' | 'video' | ''
}

export type TemplateFilterKeys = keyof TemplateFilters

export const TEMPLATE_ASSET_TYPE_OPTIONS = [
    { label: 'Imagen', value: 'image' },
    { label: 'Video', value: 'video' },
]
