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
import { MAP_ERROR_CODE, MAP_LABEL_STATUS } from "../utils"
import { formatDate } from "@/utils/dates"
import { ScrollArea } from "@/uishadcn/ui/scroll-area"
import { PaginationResponse } from "@/interfaces/common"
import UIPagination from "@/components/generics/Pagination"

interface Props {
    yearMonth?: string
    userId?: string
}

const ReportUploadList = ({ yearMonth, userId }: Props) => {
    const {
        response,
        perPage,
        page,
        onChangePage,
        setPerPage,
    } = useListQuery<PaginationResponse<ReportUpload>, { year_month?: string; user_id?: string }>({
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
                            {(response?.items || []).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.newsletter.name} - <br />
                                        {item.newsletter_section.name} <br />
                                        <small className="text-muted-foreground">
                                            F. Carga: {formatDate(item.created_at, { date: 'medium', time: 'short' })}
                                        </small>
                                    </TableCell>
                                    <TableCell>
                                        {item.year_month}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            className={cn('w-max', {
                                                'bg-amber-400': item.status === 'processing',
                                                'bg-red-500': item.status === 'failed',
                                                'bg-emerald-500': item.status === 'completed',
                                            })}
                                        >
                                            {MAP_LABEL_STATUS[item.status]}
                                        </Badge>
                                        {item.error_message && (<small>{MAP_ERROR_CODE[item.error_message] ?? item.error_message}</small>)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <div className="mt-4">
                    <UIPagination
                        totalPages={response?.last_page || 0}
                        perPage={perPage || 15}
                        page={page || 1}
                        onChangePage={onChangePage}
                        onChangePerPage={setPerPage}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default ReportUploadList