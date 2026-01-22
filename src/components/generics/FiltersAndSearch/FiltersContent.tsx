import Dropdown from "@/components/common/Inputs/Dropdown"
import { FiltersAndSearchProps, FilterTypes } from "./types"

interface FilterContentProps extends Pick<FiltersAndSearchProps, 'filters' | 'columns' | 'onSelectFilter'> {
    selectedFilters: Record<string, any>
    // setSelectedFilters: (filters: Record<string, any>) => void
    onOpenChange: () => void
}

const FiltersContent = ({ filters, selectedFilters, columns = '2', onSelectFilter }: FilterContentProps) => {
    const onChangeFilter = (key: string, value: any) => {
        onSelectFilter(key, value)
        // setSelectedFilters({
        //     ...selectedFilters,
        //     [key]: value
        // })
    }

    return (
        <div className={`grid grid-cols-${columns} gap-5 py-2`}>
            {filters.map((filter) => {
                const { type } = filter

                if (type === FilterTypes.SELECT) {
                    return (
                        <Dropdown
                            key={filter.id}
                            className="max-w-xs"
                            label={filter.label}
                            placeholder="Selecciona una opción"
                            value={selectedFilters?.[filter.id] || null}
                            onChange={(value) => onChangeFilter(filter.id, value)}
                            items={filter.options}
                        />
                    )
                }

                // if (type === FilterKeys.AUTOCOMPLETE) {
                //     return (
                //         <Autocomplete
                //             key={filter.id}
                //             label={filter.label}
                //             items={filter.options}
                //             onSelected={(selected) => onChangeFilter(filter.id, selected)}
                //         />
                //     )
                // }

                // if (type === FilterKeys.USER_AUTOCOMPLETE) {
                //     return (
                //         <UsersAutocomplete
                //             key={filter.id}
                //             label={filter.label}
                //             endpoint={filter.endpoint}
                //             onSelected={(selected) => onChangeFilter(filter.id, selected)}
                //         />
                //     )
                // }

                // if (type === FilterKeys.CUSTOM_DATE) {
                //     return (
                //         <div className="grid gap-y-2" key={filter.id}>
                //             <p className="text-xs font-semibold">{filter.label}</p>

                //             <CustomDateFilter
                //                 filter={filter}
                //                 selectedFilters={selectedFilters}
                //                 onChangeFilter={onChangeFilter}
                //                 onApplyFilters={onApplyFilters}
                //                 onOpenChange={onOpenChange}
                //             />
                //         </div>
                //     )
                // }
            })}
        </div>
    )
}

export default FiltersContent