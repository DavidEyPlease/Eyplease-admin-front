import Link from "@/components/common/Link";
import Avatar from "@/components/generics/Avatar";
import { APP_ROUTES } from "@/constants/app";
import { IClient } from "@/interfaces/clients";
import { Badge } from "@/uishadcn/ui/badge";
import { replaceRecordIdInPath } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { getStatusColor } from "../../utils";
import PlanBadge from "@/pages/Configurations/Plans/components/PlanBadge";
import { formatDate } from "@/utils/dates";
import QuickActionsClient from "../../components/QuickActions";

export const tableColumns: ColumnDef<IClient>[] = [
    {
        id: 'account',
        accessorKey: 'account',
        size: 250,
        minSize: 200,
        header: 'Cuenta',
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                <Avatar
                    // canEdit
                    sizeClasses='size-10'
                    src={row.original.photo?.url}
                    alt={row.original.name}
                // loading={loadingAction}
                />
                <div>
                    <Link className="text-xs" to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, row.original.id)} text={row.original.name} />
                    <p className="text-xs text-gray-500">{row.original.account}</p>
                </div>
            </div>
        )
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => (
            <Badge className={getStatusColor(row.original.user?.active || false)}>
                {row.original.user?.active ? 'Activo' : 'Inactivo'}
            </Badge>
        )
    },
    {
        id: 'plan',
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => (
            <PlanBadge plan={row.original.user?.plan} />
        )
    },
    {
        id: 'accountPw',
        accessorKey: 'accountPw',
        header: 'Acceso',
        cell: ({ row }) => (
            <div className="flex flex-col text-xs gap-1">
                <span>{row.original.guest_account || row.original.account}</span>
                {row.original.account_pw}
            </div>
        )
    },
    {
        id: 'email',
        accessorKey: 'email',
        size: 220,
        minSize: 200,
        header: 'Correo',
        cell: ({ row }) => row.original.user?.email
    },
    {
        id: 'createdAt',
        size: 130,
        minSize: 100,
        accessorKey: 'createdAt',
        header: 'Cliente desde',
        cell: ({ row }) => formatDate(row.original.created_at, { date: 'medium' })
    },
    {
        size: 200,
        minSize: 100,
        id: 'lastSignInAt',
        accessorKey: 'lastSignInAt',
        header: 'Último inicio de sesión',
        cell: ({ row }) => row.original.last_sign_in_at ? formatDate(row.original.last_sign_in_at) : 'N/A'
    },
    {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Acciones',
        cell: ({ row }) => <QuickActionsClient client={row.original} />
    },
]