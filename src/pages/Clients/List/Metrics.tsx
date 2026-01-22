import StatSimpleCard, { StatCard } from "@/components/generics/StatCard";
import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import { IUploadReportsStats } from "@/interfaces/dashboard";
import { Badge } from "@/uishadcn/ui/badge";
import { queryKeys } from "@/utils/queryKeys";
import { FileCheckIcon, TimerOffIcon, UserCheck2Icon, UserLockIcon } from "lucide-react";

const ClientsMetrics = () => {
    const { response: metrics } = useFetchQuery<{
        total: number,
        active_clients: number,
        inactive: number,
        pending_payment: number
    } & IUploadReportsStats>(API_ROUTES.CLIENTS.METRICS, {
        customQueryKey: queryKeys.list('clients/metrics')
    })

    return (
        <div className="grid md:grid-cols-4 gap-x-2">
            <StatSimpleCard
                title='Clientes activos'
                stat={metrics?.active_clients ?? 0}
                color="success"
                icon={<UserCheck2Icon className="w-4 h-4 text-success" />}
            />
            <StatSimpleCard
                title='Clientes inactivos'
                stat={metrics?.inactive ?? 0}
                color="danger"
                icon={<UserLockIcon className="w-4 h-4 text-red-500" />}
            />
            <StatSimpleCard
                title='Pendientes de pago'
                stat={metrics?.pending_payment ?? 0}
                color="orange"
                icon={<TimerOffIcon className="w-4 h-4 text-orange-500" />}
            />
            <StatCard
                title='Boletines Cargados'
                color="cyan"
                endContent={<FileCheckIcon className="w-4 h-4 text-cyan-500" />}
            >
                <p className="text-2xl font-bold text-cyan-500">{`${metrics?.upload_percentage ?? 0}%`}</p>
                <div className="flex items-center justify-between">
                    <span className="text-base text-muted-foreground">
                        {metrics?.total_upload_reports} de {metrics?.active_clients}
                    </span>
                    {metrics?.missing_reports ?? 0 > 0 ? (
                        <Badge variant="destructive" className="text-xs text-white">
                            -{metrics?.missing_reports} faltante{metrics?.missing_reports ?? 0 > 1 ? "s" : ""}
                        </Badge>
                    ) : (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                            ✓ Completo
                        </Badge>
                    )}
                </div>
            </StatCard>
        </div>
    )
}

export default ClientsMetrics;