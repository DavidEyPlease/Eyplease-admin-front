import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/uishadcn/ui/table"
import { Skeleton } from "@/uishadcn/ui/skeleton"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, PencilLineIcon } from "lucide-react"
import { tableColumns } from "./TableColumns"
import { IClientListItem } from "@/interfaces/clients"
import { SortOrder } from "@/interfaces/common"
import useClientsTable from "@/pages/Clients/hooks/useClientsTable"
import { getPinningClasses, getPinningStyles, isEditableColumn } from "@/pages/Clients/utils"

const SKELETON_ROWS = 8

interface ClientsTableListProps {
    items: IClientListItem[]
    isLoading?: boolean
    sortBy: string
    sortOrder: SortOrder
    onSortChange: (_sortBy: string, _sortOrder: SortOrder) => void
}

const SortIcon = ({ direction }: { direction: false | 'asc' | 'desc' }) => {
    if (direction === 'asc') return <ArrowUpIcon className="size-3.5" />
    if (direction === 'desc') return <ArrowDownIcon className="size-3.5" />
    return <ChevronsUpDownIcon className="size-3.5 opacity-40" />
}

const ClientsTableList = ({ items, isLoading, sortBy, sortOrder, onSortChange }: ClientsTableListProps) => {
    const { table } = useClientsTable({ items, sortBy, sortOrder, onSortChange })

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-lg border w-full max-w-full">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const editable = isEditableColumn(header.column.id)
                                    const sortable = header.column.getCanSort()

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
                                                : <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5',
                                                        sortable && 'cursor-pointer select-none hover:text-foreground'
                                                    )}
                                                    role={sortable ? 'button' : undefined}
                                                    onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {sortable && <SortIcon direction={header.column.getIsSorted()} />}
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
                        {isLoading ? (
                            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {table.getVisibleLeafColumns().map((column) => (
                                        <TableCell
                                            key={column.id}
                                            className={cn('p-4', getPinningClasses(column))}
                                            style={getPinningStyles(column)}
                                        >
                                            {column.id === 'account' ? (
                                                <div className="flex gap-x-2 items-center">
                                                    <Skeleton className="size-10 rounded-full shrink-0" />
                                                    <div className="flex flex-col gap-1.5 w-full">
                                                        <Skeleton className="h-3.5 w-3/4" />
                                                        <Skeleton className="h-3 w-1/2" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Skeleton className="h-4 w-full" />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const planColor = row.original.user?.plan?.color
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={cn(
                                            "relative z-0",
                                        )}
                                    // style={planColor ? { backgroundColor: `${planColor}20` } : undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isPinned = cell.column.getIsPinned()
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        'p-3',
                                                        getPinningClasses(cell.column),
                                                    )}
                                                    style={{
                                                        ...getPinningStyles(cell.column),
                                                        ...(isPinned && planColor ? { backgroundColor: `color-mix(in srgb, ${planColor} 30%, var(--background))` } : {})
                                                    }}
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
        </div>
    )
}

export default ClientsTableList