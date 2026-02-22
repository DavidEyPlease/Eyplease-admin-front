import { ReportUpload } from "@/interfaces/reportUpload";
import { cn } from "@/lib/utils";
import { Badge } from "@/uishadcn/ui/badge";
import { formatDate } from "@/utils/dates";
import { ColumnDef } from "@tanstack/react-table";
import { MAP_ERROR_CODE, MAP_LABEL_STATUS } from "../utils";

export const columns: ColumnDef<ReportUpload>[] = [
    {
        accessorKey: "created_at",
        header: "F. Carga: ",
        cell: ({ row }) => formatDate(row.original.created_at, { date: 'medium', time: 'short' }),
        enableHiding: false,
    },
    {
        accessorKey: "user",
        header: "Cliente",
        cell: ({ row }) => `${row.original.user.name} (${row.original.user.username})`,
        enableHiding: false,
    },
    {
        accessorKey: "report",
        header: "Reporte",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span>{row.original.newsletter.name}</span>
                <span className="text-sm text-muted-foreground">{row.original.newsletter_section.name}</span>
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "reportMonth",
        header: "Mes reporte",
        cell: ({ row }) => row.original.year_month,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <Badge
                    className={cn('w-max', {
                        'bg-amber-400': row.original.status === 'processing',
                        'bg-red-500': row.original.status === 'failed',
                        'bg-emerald-500': row.original.status === 'completed',
                    })}
                >
                    {MAP_LABEL_STATUS[row.original.status]}
                </Badge>
                {row.original.error_message && (<small>{MAP_ERROR_CODE[row.original.error_message] ?? row.original.error_message}</small>)}
            </div>
        )
    }
]