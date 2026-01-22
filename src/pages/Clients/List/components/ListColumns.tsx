import { ColumnDef } from "@tanstack/react-table"
import { CalendarDaysIcon } from "lucide-react"
import { formatDate } from "@/utils/dates"
import { IClient } from "@/interfaces/clients"
import ClientAvatar from "../../components/ClientAvatar"
import QuickActionsClient from "../../components/QuickActions"
import ClientActions from "../../components/Actions"
import { Badge } from "@/uishadcn/ui/badge"

export const clientsColumns: ColumnDef<IClient>[] = [
    {
        accessorKey: "created_at",
        header: "Fecha Registro",
        cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-x-2">
                <CalendarDaysIcon className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(row.original.created_at)}</p>
            </div>
        ),
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Cliente",
        cell: ({ row }) => (
            <ClientAvatar client={row.original} />
        )
    },
    {
        accessorKey: "plan",
        header: "Plan actual",
        cell: ({ row }) => (
            <Badge variant={row.original.user?.plan ? "default" : "secondary"}>
                {row.original.user?.plan?.name ?? 'Sin plan'}
            </Badge>
        )
    },
    {
        accessorKey: "quickActions",
        header: "Acciones rápidas",
        cell: ({ row }) => <QuickActionsClient />
    },
    {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => <ClientActions />,
    },
]
