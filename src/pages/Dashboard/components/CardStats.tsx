import StatSimpleCard, { StatCard } from "@/components/generics/StatCard";
import { IDashboardStats } from "@/interfaces/dashboard";
import { Badge } from "@/uishadcn/ui/badge";
import { Calendar1Icon, DollarSignIcon, FileCheckIcon, TargetIcon } from "lucide-react";

const CardStats = (props: Omit<IDashboardStats, 'users_logged_in_by_week' | 'user_request_services'>) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatSimpleCard
                title='Clientes Pagados'
                stat={'0%'}
                color="blue"
                icon={<DollarSignIcon className="w-4 h-4 text-blue-500" />}
            />
            <StatSimpleCard
                title='Usuarios Hoy'
                stat={`${props.percent_logged_in_today}%`}
                color="orange"
                icon={<Calendar1Icon className="w-4 h-4 text-amber-500" />}
            >
                <span className="text-base text-muted-foreground">
                    {props?.users_logged_in_today} de {props?.active_clients} usuarios clientes
                </span>
            </StatSimpleCard>
            <StatSimpleCard
                title='Seguimiento Promedio'
                stat={'0%'}
                color="primary"
                icon={<TargetIcon className="w-4 h-4 text-primary" />}
            />
            <StatCard
                title='Boletines Cargados'
                color="cyan"
                endContent={<FileCheckIcon className="w-4 h-4 text-cyan-500" />}
            >
                <p className="text-2xl font-bold text-cyan-500">{`${props?.upload_percentage ?? 0}%`}</p>
                <div className="flex items-center justify-between">
                    <span className="text-base text-muted-foreground">
                        {props?.total_upload_reports} de {props?.active_clients}
                    </span>
                    {props?.missing_reports ?? 0 > 0 ? (
                        <Badge variant="destructive" className="text-xs text-white">
                            -{props?.missing_reports} faltante{props?.missing_reports ?? 0 > 1 ? "s" : ""}
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

export default CardStats;