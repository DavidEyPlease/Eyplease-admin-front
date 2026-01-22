import { TableColumn } from "@/interfaces/common"
import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    // TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/uishadcn/ui/table"
import clsx from "clsx"

interface Props {
    contentHeader?: React.ReactNode
    children: React.ReactNode
    caption?: React.ReactNode
    columns: TableColumn[]
    containerClasses?: string
}

const TableContainer = ({ children, columns, caption, containerClasses, contentHeader }: Props) => {
    return (
        <Card className={clsx("w-full rounded-2xl", containerClasses)}>
            {!!contentHeader && <CardHeader>{contentHeader}</CardHeader>}
            <CardContent>
                <Table>
                    {caption && <TableCaption>{caption}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            {columns.map(column => (<TableHead key={column.key}>{column.label}</TableHead>))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {children}
                    </TableBody>
                    {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
                </Table>
            </CardContent>
        </Card>
    )
}

export default TableContainer