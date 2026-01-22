import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
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
import clsx from "clsx"
import PageLoader from "./PageLoader"

interface DataTableProps<TData, TValue> {
    isLoading?: boolean
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    contentHeader?: React.ReactNode
    caption?: React.ReactNode
    containerClasses?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    caption,
    containerClasses,
    contentHeader
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden">
            <Card className={clsx("w-full rounded-2xl", containerClasses)}>
                {!!contentHeader && <CardHeader>{contentHeader}</CardHeader>}
                <CardContent>
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <Table>
                            {caption && <TableCaption>{caption}</TableCaption>}

                            <TableHeader className="sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} className="px-5 py-4">
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
                                                <TableCell key={cell.id} className="px-5 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No se encontrarón resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
