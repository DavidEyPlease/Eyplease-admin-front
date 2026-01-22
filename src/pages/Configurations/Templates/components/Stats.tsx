import StatCard from "@/components/generics/StatCard";
import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";
import { Power, Settings, Users } from "lucide-react";

interface StatsData {
    total: number
    active: number
    totalClients: number
    useAverage: number
}

const StatsTemplates = () => {
    const {
        response: stats,
    } = useFetchQuery<StatsData>(API_ROUTES.TEMPLATES.STATS, {
        customQueryKey: queryKeys.list('templates/stats')
    })

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
                title='Total Plantillas'
                stat={stats?.total ?? 0}
                color="primary"
                icon={<Settings className="w-4 h-4 text-primary" />}
            />
            <StatCard
                title='Plantillas Activas'
                stat={stats?.active ?? 0}
                color="success"
                icon={<Power className="w-4 h-4 text-emerald-500" />}
            />
            <StatCard
                title='Total Clientes'
                stat={stats?.totalClients ?? 0}
                color="cyan"
                icon={<Users className="w-4 h-4 text-cyan-500" />}
            />
            <StatCard
                title='Promedio Por Plantilla'
                stat={stats?.useAverage ?? 0}
                color="purple"
                icon={<Users className="w-4 h-4 text-purple-500" />}
            />
        </div>
    )
}

export default StatsTemplates;