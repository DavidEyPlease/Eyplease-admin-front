import { useEffect, useMemo, useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    OnChangeFn,
    RowSelectionState,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/uishadcn/ui/table"
import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card"
import { Checkbox } from "@/uishadcn/ui/checkbox"
import { cn } from "@/lib/utils"
import Spinner from "../common/Spinner"

interface DataTableProps<TData, TValue> {
    isLoading?: boolean
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    contentHeader?: React.ReactNode
    caption?: React.ReactNode
    containerClasses?: string
    enableSelection?: boolean
    rowSelection?: RowSelectionState
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
    onSelectionChange?: (rows: TData[]) => void
    getRowId?: (row: TData, index: number) => string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    caption,
    containerClasses,
    contentHeader,
    enableSelection = false,
    rowSelection: rowSelectionProp,
    onRowSelectionChange,
    onSelectionChange,
    getRowId,
}: DataTableProps<TData, TValue>) {
    const isControlled = rowSelectionProp !== undefined
    const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})
    const rowSelection = isControlled ? rowSelectionProp : internalSelection
    const handleSelectionChange: OnChangeFn<RowSelectionState> = isControlled
        ? (updater) => onRowSelectionChange?.(updater)
        : setInternalSelection

    const selectionColumn = useMemo<ColumnDef<TData, TValue>>(() => ({
        id: '__select',
        size: 40,
        enableSorting: false,
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                            ? 'indeterminate'
                            : false
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todo"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Seleccionar fila"
            />
        ),
    }), [])

    const finalColumns = useMemo(
        () => (enableSelection ? [selectionColumn, ...columns] : columns),
        [enableSelection, columns, selectionColumn]
    )

    const table = useReactTable({
        data,
        columns: finalColumns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: enableSelection,
        state: enableSelection ? { rowSelection } : undefined,
        onRowSelectionChange: enableSelection ? handleSelectionChange : undefined,
        getRowId,
    })

    useEffect(() => {
        if (!enableSelection || !onSelectionChange) return
        const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
        onSelectionChange(selectedRows)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection, enableSelection])

    return (
        <Card className={cn("w-full  relative overflow-hidden rounded-2xl py-0 gap-y-0", containerClasses)}>
            {!!contentHeader && <CardHeader>{contentHeader}</CardHeader>}
            <CardContent className="p-0">
                {isLoading && (
                    <div className="absolute bottom-0 right-1 z-50 p-2 flex justify-center items-center">
                        <Spinner color="primary" label="Actualizando..." />
                    </div>
                )}
                <Table>
                    {caption && <TableCaption>{caption}</TableCaption>}

                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="relative z-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={finalColumns.length} className="h-24 text-center">
                                    No se encontrarón resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
