import { FilterItem, FilterTypes } from "@/components/generics/FiltersAndSearch/types";

export const CLIENTS_FILTER_ITEMS: FilterItem[] = [
    {
        id: 'plan',
        label: 'Plan',
        type: FilterTypes.SELECT,
        options: []
    },
    {
        id: 'active',
        label: 'Estado',
        type: FilterTypes.SELECT,
        options: [
            { label: 'Activo', value: 'true' },
            { label: 'Inactivo', value: 'false' },
        ]
    }
]