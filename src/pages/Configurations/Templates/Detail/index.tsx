import DynamicTabs from "@/components/generics/DynamicTabs"
import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITemplate } from "@/interfaces/templates"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { replaceRecordIdInPath } from "@/utils"
import { queryKeys } from "@/utils/queryKeys"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router"
import TemplateCover from "../components/TemplateCover"
import TemplateForm from "../components/TemplateForm"
import TemplateDetail from "../components/TemplateDetail"
import ManageClients from "../components/ManageClients"
import { Badge } from "@/uishadcn/ui/badge"
import { UsersIcon } from "lucide-react"
import FieldValue from "@/components/generics/FieldValue"
import SwitchAction from "../components/SwitchAction"
import { formatDate } from "@/utils/dates"
import { BrowserEvent, publishEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import NexrenderConfiguration from "../components/Nexrender"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import { TEMPLATE_GROUPS } from "../utils"

const TemplateDetailPage = () => {
    const [activeTab, setActiveTab] = useState<string>("template")
    const params = useParams<{ id: string }>()

    const { response: template, loading, setData, fetchRetry, isRefetching } = useFetchQuery<ITemplate>(replaceRecordIdInPath(API_ROUTES.TEMPLATES.DETAIL, params.id || ''), {
        customQueryKey: queryKeys.detail(`template`, params?.id || ''),
        enabled: !!params.id
    })

    const handleTemplateUpdate = useCallback((event: BrowserEvent<ITemplate>) => {
        setData({ ...template, ...event.detail })
    }, [template])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, handleTemplateUpdate as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, handleTemplateUpdate as EventListener)
        }
    }, [handleTemplateUpdate])

    const findTemplateGroup = TEMPLATE_GROUPS.find(group => group.value === template?.template_group)

    return (
        <Card className={cn("w-full rounded-2xl")}>
            <CardHeader>
                <CardTitle className="flex items-center gap-x-8">
                    {template && (
                        <TemplateCover
                            templateId={template.id}
                            cover={template.picture}
                            templateName={template.name}
                        />
                    )}
                    Plantilla: {template?.name}
                </CardTitle>
                {findTemplateGroup && (
                    <CardDescription>
                        Grupo: {findTemplateGroup.label}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex">
                    <DynamicTabs
                        value={activeTab}
                        onValueChange={e => setActiveTab(e)}
                        items={[
                            { label: 'Plantilla', value: 'template' },
                            { label: 'Ver Fondos', value: 'backgrounds', disabled: template?.template_group !== 'reports' },
                            { label: 'Editar', value: 'edit' },
                            { label: 'Gestionar Clientes', value: 'manage-clients' },
                            { label: 'Configuración Nexrender', value: 'nexrender-configuration', disabled: template?.template_group === 'reports' },
                        ]}
                    />
                </div>
                <div className="my-5">
                    {loading ? (
                        <PageLoader />
                    ) : (
                        <>
                            {activeTab === 'template' && template && (
                                <div className="flex flex-col gap-y-5">
                                    <FieldValue label="Clientes usando">
                                        <Badge variant="secondary" className="bg-[#4E31C0]/10 text-[#4E31C0]">
                                            <UsersIcon className="w-3 h-3 mr-1" />
                                            {template.clients_count}
                                        </Badge>
                                    </FieldValue>

                                    <FieldValue label="Estado en sistema">
                                        <SwitchAction templateId={template.id} actionField="active" checked={template.active} id={`template-${template.id}-status`} />
                                    </FieldValue>

                                    <FieldValue label="Usada en todos los clientes">
                                        <SwitchAction templateId={template.id} checked={template.enabled_all_clients} actionField="enabled_all_clients" id={`template-${template.id}-all_clients_enabled`} />
                                    </FieldValue>

                                    <FieldValue label="Última actualización" value={formatDate(template.updated_at)} />
                                </div>
                            )}

                            {activeTab === 'backgrounds' && template && (
                                <TemplateDetail template={template} />
                            )}

                            {activeTab === 'edit' && template && (
                                <div className="w-full md:w-1/2">
                                    <TemplateForm
                                        item={template}
                                        onSuccess={(template) => publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, template)}
                                    />
                                </div>
                            )}

                            {activeTab === 'manage-clients' && template && (
                                <ManageClients template={template} />
                            )}

                            {activeTab === 'nexrender-configuration' && template && (
                                <NexrenderConfiguration template={template} isRefetching={isRefetching} onRefreshTemplate={fetchRetry} />
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default TemplateDetailPage