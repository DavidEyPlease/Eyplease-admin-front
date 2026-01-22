import { TableColumn } from "@/interfaces/common";

export const LIST_TABLE_COLUMNS: TableColumn[] = [
    {
        key: 'created_at',
        label: 'F. Creación',
    },
    {
        key: 'name',
        label: 'Plan',
    },
    {
        key: 'price',
        label: 'Precio',
    },
    {
        key: 'active',
        label: 'Activo',
    },
    {
        key: 'free',
        label: 'Es gratis',
    },
    {
        key: 'is_default',
        label: 'Por defecto',
    },
]