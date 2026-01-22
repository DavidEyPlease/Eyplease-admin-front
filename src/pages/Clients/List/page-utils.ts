import { FilterItem, FilterTypes } from "@/components/generics/FiltersAndSearch/types";
import { TableColumn } from "@/interfaces/common";

export const LIST_TABLE_COLUMNS: TableColumn[] = [
    {
        key: 'created_at',
        label: 'Registrado desde',
    },
    {
        key: 'name',
        label: 'Nombre',
    },
    {
        key: 'username',
        label: 'Usuario',
    },
    {
        key: 'plan',
        label: 'Plan activo',
    },
    {
        key: 'quick_actions',
        label: 'Acciones Rápidas',
    },
    {
        key: 'actions',
        label: 'Acciones',
    }
]

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