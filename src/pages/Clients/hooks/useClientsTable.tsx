import { cn } from "@/lib/utils"
import { Column, ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import { tableColumns } from "../List/components/Table/TableColumns"
import { IClient } from "@/interfaces/clients"
import EditableTextCell from "../List/components/Table/EditableTextCell"

interface UseClientsTableProps {
    items: IClient[]
}

declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

const EDITABLE_COLUMN_IDS = new Set([
    'accountPw',
    'guestAccount',
])

const TRANSLATE_COLUMNS = {
    accountPw: 'Contraseña de Cuenta',
    guestAccount: 'Cuenta de Invitado',
    status: 'Estado',
    plan: 'Plan',
    email: 'Correo Electrónico',
    createdAt: 'Fecha de Creación',
    lastSignInAt: 'Último Inicio de Sesión',
}

const isEditableColumn = (columnId: string) => EDITABLE_COLUMN_IDS.has(columnId)

const getPinningClasses = (column: Column<IClient>): string => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
        isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
        isPinned === 'right' && column.getIsFirstColumn('right')

    const baseClasses = 'transition-colors duration-200'

    if (!isPinned) {
        return baseClasses
    }

    // Clases para columnas pineadas
    const pinnedClasses = cn(
        'sticky',
        // 'bg-muted/90 dark:bg-muted/60',
        'font-semibold',
        'shadow-sm',
        baseClasses,
        isLastLeftPinnedColumn && 'shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)]',
        isFirstRightPinnedColumn && 'shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.3)]',
    )

    return pinnedClasses
}

const getPinningStyles = (column: Column<IClient>): CSSProperties => {
    const isPinned = column.getIsPinned()

    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        width: column.getSize(),
        minWidth: column.getSize(),
        maxWidth: column.getSize(),
        zIndex: isPinned ? 10 : 0,
    }
}

const useClientsTable = ({ items }: UseClientsTableProps) => {
    const [tableData, setTableData] = useState<IClient[]>(items)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const columnsWithEditing: ColumnDef<IClient>[] = useMemo(() => {
        return tableColumns.map((column) => {
            const accessorKey = 'accessorKey' in column ? column.accessorKey : undefined
            const columnId = String(column.id ?? accessorKey ?? '')

            if (!EDITABLE_COLUMN_IDS.has(columnId)) {
                return column
            }

            return {
                ...column,
                cell: EditableTextCell,
            }
        })
    }, [])

    const table = useReactTable({
        data: tableData,
        columns: columnsWithEditing,
        state: {
            columnFilters
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
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
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

export {
    getPinningClasses,
    getPinningStyles,
    useClientsTable,
    isEditableColumn,
    TRANSLATE_COLUMNS
}