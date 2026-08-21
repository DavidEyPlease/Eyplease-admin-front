import Link from "@/components/common/Link";
import Avatar from "@/components/generics/Avatar";
import { APP_ROUTES } from "@/constants/app";
import { IClientListItem } from "@/interfaces/clients";
import { formatPoints, replaceRecordIdInPath } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import PlanBadge from "@/pages/Configurations/Plans/components/PlanBadge";
import { formatDate } from "@/utils/dates";
import QuickActionsClient from "../../../components/QuickActions";
import ClientPromotionCell from "./ClientPromotionCell";

export const tableColumns: ColumnDef<IClientListItem>[] = [
    {
        id: 'account',
        accessorKey: 'account',
        size: 300,
        minSize: 200,
        header: 'Cuenta',
        cell: ({ row }) => (
            <div className="flex gap-x-2 items-center">
                <Avatar
                    // canEdit
                    sizeClasses='size-12'
                    src={row.original.photo?.url}
                    alt={row.original.name}
                // loading={loadingAction}
                />
                <div className="flex flex-col gap-1">
                    <Link className="text-sm underline font-semibold text-gray-800 dark:text-white" to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, row.original.id)} text={row.original.name} />
                    <PlanBadge plan={row.original.user?.plan} />
                </div>
                {/* 
                    <p className="text-xs text-gray-800 dark:text-white">
                        {row.original.account} - {row.original.rank}
                    </p>
                </div> */}
            </div>
        )
    },
    {
        id: 'previous_month_points',
        size: 120,
        accessorKey: 'previous_month_points',
        header: 'MP',
        cell: ({ row }) => <span className="tabular-nums">{formatPoints(row.original.previous_month_points)}</span>
    },
    {
        id: 'current_month_points',
        size: 120,
        accessorKey: 'current_month_points',
        header: 'MA',
        cell: ({ row }) => <span className="tabular-nums">{formatPoints(row.original.current_month_points)}</span>
    },
    {
        id: 'guestAccount',
        accessorKey: 'platform_guest_account',
        header: 'Login',
        cell: ({ row }) => row.original.platform_guest_account || row.original.account
    },
    {
        id: 'accountPw',
        accessorKey: 'external_company_pw',
        header: 'Acceso',
        cell: ({ row }) => row.original.external_company_pw
    },
    {
        id: 'logo',
        size: 100,
        minSize: 100,
        accessorKey: 'logo',
        header: 'Logotipo',
        cell: ({ row }) => (
            <Avatar
                sizeClasses='size-10'
                src={row.original.logotype?.url}
                alt={`Logotipo de ${row.original.name}`}
            />
        )
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => (
            <QuickActionsClient client={row.original} />
        )
    },
    {
        id: 'promotion',
        size: 220,
        minSize: 180,
        header: 'Promoción',
        cell: ({ row }) => (
            <ClientPromotionCell client={row.original} />
        )
    },
    {
        id: 'email',
        accessorKey: 'email',
        size: 220,
        minSize: 260,
        header: 'Correo',
        cell: ({ row }) => row.original.user?.email
    },
    {
        id: 'phone',
        accessorKey: 'user.phone',
        size: 220,
        minSize: 260,
        header: 'Teléfono',
        cell: ({ row }) => row.original.user?.phone
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
        id: 'start_date',
        size: 180,
        minSize: 180,
        accessorKey: 'start_date',
        header: 'Fecha Inicio',
        cell: ({ row }) => row.original.start_date ? formatDate(new Date(row.original.start_date), { date: 'medium' }) : 'N/A'
    },
    {
        id: 'last_order_date',
        size: 180,
        minSize: 180,
        accessorKey: 'last_order_date',
        header: 'Fecha Ult Orden',
        cell: ({ row }) => row.original.last_order_date ? formatDate(new Date(row.original.last_order_date), { date: 'medium' }) : 'N/A'
    }
]