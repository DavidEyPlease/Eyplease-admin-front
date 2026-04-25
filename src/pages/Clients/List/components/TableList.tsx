import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/uishadcn/ui/table"
import { getPinningClasses, getPinningStyles, isEditableColumn, useClientsTable } from "../../hooks/useClientsTable"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"
import { Button } from "@/uishadcn/ui/button"
import { PencilLineIcon } from "lucide-react"
import { tableColumns } from "./TableColumns"
import { IClient } from "@/interfaces/clients"

interface ClientsTableListProps {
    items: IClient[]
}

const ClientsTableList = ({ items }: ClientsTableListProps) => {
    const { table } = useClientsTable({ items })

    return (
        <div className="overflow-x-auto rounded-lg border w-full max-w-full">
            <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const editable = isEditableColumn(header.column.id)

                                return (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            'p-3',
                                            getPinningClasses(header.column),
                                            editable && 'bg-emerald-50/60 dark:bg-emerald-950/20'
                                        )}
                                        style={getPinningStyles(header.column)}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : <span className="inline-flex items-center gap-1.5">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {editable && (
                                                    <span
                                                        title="Columna editable"
                                                        className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 text-[11px] font-medium"
                                                    >
                                                        <PencilLineIcon className="size-3" />
                                                    </span>
                                                )}
                                            </span>
                                        }
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody
                    className={cn(
                        "**:data-[slot=table-cell]:first:w-8"
                    )}
                >
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "relative z-0",
                                        // BG_COLOR_STATUS[row.original?.status as PlantingProgramStatusTypes] || ''
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const isPinned = cell.column.getIsPinned()
                                        // const statusKey = row.original?.status as PlantingProgramStatusTypes

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    'p-4',
                                                    getPinningClasses(cell.column),
                                                    // isPinned && (BG_COLOR_STATUS_PINNED[statusKey] || ''),
                                                )}
                                                style={getPinningStyles(cell.column)}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                No se encontrarón resultados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default ClientsTableList