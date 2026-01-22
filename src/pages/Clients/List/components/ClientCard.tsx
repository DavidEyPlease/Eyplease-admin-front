import { Card, CardContent, CardHeader } from '@/uishadcn/ui/card';
import { Badge } from '@/uishadcn/ui/badge';
import { BarChart3Icon, Calendar, ChevronDownIcon, ChevronUpIcon, MailIcon } from 'lucide-react';
import { IClient, IClientStats } from '@/interfaces/clients';
import ClientAvatar from '../../components/ClientAvatar';
import { formatDate } from '@/utils/dates';
// import ClientActions from '../../components/Actions';
import QuickActionsClient from '../../components/QuickActions';
import FieldValue from '@/components/generics/FieldValue';
import { Button } from '@/uishadcn/ui/button';
import Spinner from '@/components/common/Spinner';
import { useState } from 'react';
import useFetchQuery from '@/hooks/useFetchQuery';
import { API_ROUTES } from '@/constants/api';
import { replaceRecordIdInPath } from '@/utils';
import { queryKeys } from '@/utils/queryKeys';
import { ClientStatsSection } from '../../components/ClientStatsSection';

interface ClientCardProps {
    client: IClient;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
    const [showStats, setShowStats] = useState(false);

    const { response: stats, loading } = useFetchQuery<IClientStats>(replaceRecordIdInPath(API_ROUTES.CLIENTS.STATS, client.id || ''), {
        customQueryKey: queryKeys.detail(`client/stats`, client.id),
        enabled: showStats
    })


    const getStatusColor = () => {
        return client.user?.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200';
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
            <CardHeader className="pb-4 pt-3">
                <div className="flex justify-between">
                    <ClientAvatar client={client} />

                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor()}>
                            {client.user?.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {/* <ClientActions /> */}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <Badge variant={client.user?.plan ? "default" : "secondary"}>
                        {client.user?.plan?.name ?? 'Sin plan'}
                    </Badge>
                    <FieldValue
                        label={<MailIcon className="h-4 w-4" />}
                        value={client.user?.email}
                    />
                    <FieldValue
                        label={<Calendar className="h-4 w-4" />}
                        value={`Cliente desde: ${formatDate(client.created_at)}`}
                    />
                    <FieldValue
                        label={<Calendar className="h-4 w-4" />}
                        value={`Ultimo ingreso: ${client.last_sign_in_at ? formatDate(client.last_sign_in_at) : 'No disponible'}`}
                    />
                    <QuickActionsClient />

                    <div className="mt-4 pt-4 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowStats(!showStats)}
                            disabled={loading}
                            className="w-full justify-between hover:bg-primary/5 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <BarChart3Icon className="h-4 w-4" />
                                <span>
                                    {loading ? 'Cargando estadísticas...' : 'Ver estadísticas del mes'}
                                </span>
                            </div>
                            {loading ? (
                                <Spinner className='w-fit' />
                            ) : stats ? (
                                showStats ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                            ) : (
                                <ChevronDownIcon className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Stats Section */}
                    {showStats && stats && !loading && (
                        <ClientStatsSection stats={stats} />
                    )}
                </div>
            </CardContent>
        </Card >
    );
};