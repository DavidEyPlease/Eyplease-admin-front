import { IAutocompleteItem } from "@/interfaces/common"

export const FilterTypes = {
    TEXT: 'TEXT',
    DATE: 'DATE',
    SELECT: 'SELECT',
    ASYNC_AUTOCOMPLETE: 'ASYNC_AUTOCOMPLETE',
    AUTOCOMPLETE: 'AUTOCOMPLETE',
    USER_AUTOCOMPLETE: 'USER_AUTOCOMPLETE',
    MULTI_SELECT: 'MULTI_SELECT',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    CUSTOM_MULTI_SELECT: 'CUSTOM_MULTI_SELECT',
    CUSTOM_RANGE: 'CUSTOM_RANGE',
    CUSTOM_DATE: 'CUSTOM_DATE',
} as const;
export type FilterTypes = typeof FilterTypes[keyof typeof FilterTypes];

export interface IBaseFilterItem {
    id: string
    label: string
    description?: string
}

interface ISelectFilterItem extends IBaseFilterItem {
    type: typeof FilterTypes.SELECT
    options: IAutocompleteItem[]
}

interface IAutocomplete extends IBaseFilterItem {
    options: IAutocompleteItem[]
    type: typeof FilterTypes.AUTOCOMPLETE
    endpoint?: string
}

interface IUserAutocomplete extends Omit<IAutocomplete, 'type'> {
    type: typeof FilterTypes.USER_AUTOCOMPLETE
    endpoint: string
}

// interface IMultiSelectFilterItem extends IBaseFilterItem {
//     type: FilterTypes.MULTI_SELECT
//     options: AutocompleteItem[]
// }

export interface ICustomDateFilterItem extends IBaseFilterItem {
    keyFilter: string
    type: typeof FilterTypes.CUSTOM_DATE
}

export type FilterItem = ISelectFilterItem | IAutocomplete | ICustomDateFilterItem | IUserAutocomplete

export interface FiltersAndSearchProps {
    title?: string
    showBadge?: boolean
    activeFilters: Record<string, any>
    filters: FilterItem[]
    columns?: string
    renderComponent: 'modal' | 'popover'
    setSearch: (value: string) => void
    onSelectFilter: (key: string, value: any) => void
    onApplyFilters: (filters: Record<string, any>) => void
    resetFilters: () => void
}