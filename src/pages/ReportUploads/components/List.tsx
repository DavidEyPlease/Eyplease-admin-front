import { API_ROUTES } from "@/constants/api"
import useListQuery from "@/hooks/useListQuery"
import { ReportUpload } from "@/interfaces/reportUpload"
import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { queryKeys } from "@/utils/queryKeys"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/uishadcn/ui/table"
import { cn } from "@/lib/utils"
import { Badge } from "@/uishadcn/ui/badge"
import { MAP_LABEL_STATUS } from "../utils"
import { formatDate } from "@/utils/dates"
import { ScrollArea } from "@/uishadcn/ui/scroll-area"

interface Props {
    yearMonth?: string
    userId?: string
}

const ReportUploadList = ({ yearMonth, userId }: Props) => {
    const {
        isLoading,
        response: items,
    } = useListQuery<ReportUpload[], { year_month?: string; user_id?: string }>({
        endpoint: API_ROUTES.REPORTS.GET_UPLOADS,
        enabled: !!yearMonth && !!userId,
        defaultFilters: { year_month: yearMonth, user_id: userId },
        customQueryKey: (params) => queryKeys.list(`reports/get-uploads/${yearMonth}/${userId}`, params)
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Reportes cargados
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reporte</TableHead>
                                <TableHead>F. Boletín</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(items || []).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.newsletter_section.name} <br />
                                        {formatDate(item.created_at)}
                                    </TableCell>
                                    <TableCell>{item.year_month}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            className={cn({
                                                'bg-amber-400': item.status === 'processing',
                                                'bg-red-500': item.status === 'failed',
                                                'bg-emerald-500': item.status === 'completed',
                                            })}
                                        >
                                            {MAP_LABEL_STATUS[item.status]}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default ReportUploadList