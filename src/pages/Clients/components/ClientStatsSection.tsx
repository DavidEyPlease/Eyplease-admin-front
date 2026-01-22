import React from 'react';
import { Badge } from '@/uishadcn/ui/badge';
import { Progress } from '@/uishadcn/ui/progress';
import {
    Download,
    FileText,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import { IClientStats } from '@/interfaces/clients';
import { StatCard } from '@/components/generics/StatCard';

interface ClientStatsSectionProps {
    stats: IClientStats;
}

export const ClientStatsSection: React.FC<ClientStatsSectionProps> = ({ stats }) => {
    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPercentageBgColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-100';
        if (percentage >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Month Header */}
            <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                    Estadísticas de {stats.month}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
                <StatCard
                    title='Noticias Enviadas'
                    color="blue"
                    startContent={
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                    }
                    endContent={
                        <Badge
                            className={`${getPercentageBgColor(stats.tools_download_percentage)} ${getPercentageColor(stats.tools_download_percentage)} border-0`}
                        >
                            {stats.tools_download_percentage}%
                        </Badge>
                    }
                >
                    <div className="space-y-2">
                        <Progress
                            value={stats.tools_download_percentage}
                            className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{0} enviadas</span>
                            <span>{0} total</span>
                        </div>
                    </div>
                </StatCard>

                {/* Tools Download Percentage */}
                <StatCard
                    title='Herramientas Descargadas'
                    color="purple"
                    startContent={
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Download className="h-4 w-4 text-purple-600" />
                        </div>
                    }
                    endContent={
                        <Badge
                            className={`${getPercentageBgColor(stats.tools_download_percentage)} ${getPercentageColor(stats.tools_download_percentage)} border-0`}
                        >
                            {stats.tools_download_percentage}%
                        </Badge>
                    }
                >
                    <Progress
                        value={stats.tools_download_percentage}
                        className="h-2"
                    />
                </StatCard>

                <StatCard
                    title='Publicaciones Recibidas'
                    description='Contenido del mes'
                    color="success"
                    startContent={
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-4 w-4 text-green-600" />
                        </div>
                    }
                    endContent={
                        <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                                {stats.monthly_posts}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                publicaciones
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
};