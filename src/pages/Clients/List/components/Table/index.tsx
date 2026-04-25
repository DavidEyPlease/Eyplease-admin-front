import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/uishadcn/ui/table"
import { getPinningClasses, getPinningStyles, isEditableColumn, useClientsTable } from "../../../hooks/useClientsTable"
import { cn } from "@/lib/utils"
import { flexRender } from "@tanstack/react-table"
import { PencilLineIcon } from "lucide-react"
import { tableColumns } from "./TableColumns"
import { IClient } from "@/interfaces/clients"

interface ClientsTableListProps {
    items: IClient[]
}

const ClientsTableList = ({ items }: ClientsTableListProps) => {
    const { table } = useClientsTable({ items })

    return (
        <div className="flex flex-col gap-4">
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-max">
                        <Columns2Icon />
                        <span className="hidden lg:inline">Customizar Columnas</span>
                        <span className="lg:hidden">Columnas</span>
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {table
                        .getAllColumns()
                        .filter(
                            (column) =>
                                typeof column.accessorFn !== "undefined" &&
                                column.getCanHide() && !column.getIsPinned()
                        )
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {TRANSLATE_COLUMNS[column.id as keyof typeof TRANSLATE_COLUMNS] || column.id}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                </DropdownMenuContent>
            </DropdownMenu> */}
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
                                                        'p-4',
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