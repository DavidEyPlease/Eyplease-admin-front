import { useEffect } from "react";

import PageLoader from "@/components/generics/PageLoader";
import { API_ROUTES } from "@/constants/api";
import { IClient, IClientStats } from "@/interfaces/clients";
import { replaceRecordIdInPath } from "@/utils";
import { useParams } from "react-router";
import Network from "./components/Network";
import Summary from "./components/Summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/uishadcn/ui/tabs";
import SetPlan from "./components/SetPlan";
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";
import FadeInGrid from "@/components/generics/FadeInGrid";
import { ClientStatsSection } from "../components/ClientStatsSection";

const ClientDetailPage = () => {
    const params = useParams<{ id: string }>();

    const { response, loading, setData } = useFetchQuery<{ client: IClient, stats: IClientStats }>(replaceRecordIdInPath(API_ROUTES.CLIENTS.DETAIL, params.id || ''), {
        customQueryKey: queryKeys.detail('client', params.id || ''),
    })

    const client = response?.client;
    const stats = response?.stats;

    useEffect(() => {
        const handleClientUpdate = (event: BrowserEvent<IClient>) => {
            if (!response) return;
            setData({
                client: event.detail,
                stats: response.stats
            })
        };

        subscribeEvent('client-updated', handleClientUpdate as EventListener)

        return () => {
            unsubscribeEvent('client-updated', handleClientUpdate as EventListener)
        }
    }, [])

    return (
        <div>
            {
                loading ? (
                    <PageLoader />
                ) : (
                    client && (
                        <FadeInGrid gridClassName="md:grid-cols-1">
                            <div className="grid md:grid-cols-5 gap-4">
                                <div className="col-span-2 space-y-4">
                                    <Summary client={client} />
                                    {stats && <ClientStatsSection stats={stats} />}
                                </div>

                                <div className="col-span-3">
                                    <Tabs defaultValue="vendors">
                                        <TabsList>
                                            <TabsTrigger value="vendors">Vendedoras (es)</TabsTrigger>
                                            <TabsTrigger value="actions">Acciones</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="vendors">
                                            <Network clientId={params.id || ''} />
                                        </TabsContent>
                                        <TabsContent value="actions">
                                            <div className="grid grid-cols-1 md:grid-cols-2">
                                                <SetPlan
                                                    activePlanId={client.user?.plan?.id || ''}
                                                    clientId={client.id}
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </FadeInGrid>
                    )
                )
            }
        </div>
    )
}

export default ClientDetailPage;