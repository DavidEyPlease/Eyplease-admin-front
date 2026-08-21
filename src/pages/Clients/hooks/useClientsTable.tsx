import { ColumnDef, ColumnFiltersState, OnChangeFn, SortingState, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { tableColumns } from "../List/components/Table/TableColumns"
import { IClientListItem } from "@/interfaces/clients"
import { SortOrder } from "@/interfaces/common"
import EditableTextCell from "../List/components/Table/EditableTextCell"
import EditablePhoneCell from "../List/components/Table/EditablePhoneCell"
import { COLUMN_BY_SORT_FIELD, DESC_FIRST_COLUMNS, EDITABLE_COLUMN_IDS, SORT_FIELD_BY_COLUMN, isSortableColumn } from "../utils"

interface UseClientsTableProps {
    items: IClientListItem[]
    sortBy: string
    sortOrder: SortOrder
    onSortChange: (_sortBy: string, _sortOrder: SortOrder) => void
}
declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}


const useClientsTable = ({ items, sortBy, sortOrder, onSortChange }: UseClientsTableProps) => {
    const [tableData, setTableData] = useState<IClientListItem[]>(items)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const columnsWithEditing: ColumnDef<IClientListItem>[] = useMemo(() => {
        return tableColumns.map((column) => {
            const accessorKey = 'accessorKey' in column ? column.accessorKey : undefined
            const columnId = String(column.id ?? accessorKey ?? '')

            return {
                ...column,
                enableSorting: isSortableColumn(columnId),
                sortDescFirst: DESC_FIRST_COLUMNS.has(columnId),
                ...(EDITABLE_COLUMN_IDS.has(columnId) && {
                    cell: columnId === 'phone' ? EditablePhoneCell : EditableTextCell,
                }),
            }
        })
    }, [])

    const sorting: SortingState = useMemo(() => (
        sortBy ? [{ id: COLUMN_BY_SORT_FIELD[sortBy] ?? sortBy, desc: sortOrder === 'desc' }] : []
    ), [sortBy, sortOrder])

    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        const [nextSort] = typeof updater === 'function' ? updater(sorting) : updater

        if (!nextSort) {
            onSortChange('', 'asc')
            return
        }

        onSortChange(SORT_FIELD_BY_COLUMN[nextSort.id] ?? nextSort.id, nextSort.desc ? 'desc' : 'asc')
    }

    const table = useReactTable({
        data: tableData,
        columns: columnsWithEditing,
        manualSorting: true,
        enableSortingRemoval: false,
        state: {
            columnFilters,
            sorting
        },
        meta: {
            updateData: (rowIndex, columnId, value) => {
                setTableData((oldData) =>
                    oldData.map((row, index) => {
                        if (index !== rowIndex) {
                            return row
                        }

                        return {
                            ...row,
                            [columnId]: value,
                        }
                    })
                )
            },
        },
        initialState: {
            columnPinning: {
                left: ["account"],
            }
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // Effects
    useEffect(() => {
        setTableData(items)
    }, [items])

    return {
        table,
    }
}

export default useClientsTable
