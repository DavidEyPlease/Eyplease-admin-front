import { FilterItem, FilterTypes } from "@/components/generics/FiltersAndSearch/types";

export type TemplateFilters = {
    template_group: string
    not_template_group: string
    active: string
}

export type TemplateFilterKeys = keyof TemplateFilters

export const TEMPLATES_FILTER_ITEMS: FilterItem[] = [
    {
        id: 'template_group',
        label: 'Grupo',
        type: FilterTypes.MULTI_SELECT,
        options: []
    },
    {
        id: 'active',
        label: 'Estado',
        type: FilterTypes.SELECT,
        options: [
            { label: 'Activas', value: 'true' },
            { label: 'Inactivas', value: 'false' },
        ]
    }
]
