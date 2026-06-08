import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { UsersIcon } from "lucide-react"

import DynamicTabs from "@/components/generics/DynamicTabs"
import PageLoader from "@/components/generics/PageLoader"
import FieldValue from "@/components/generics/FieldValue"
import { Badge } from "@/uishadcn/ui/badge"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITemplate } from "@/interfaces/templates"
import { replaceRecordIdInPath } from "@/utils"
import { formatDate } from "@/utils/dates"
import { BrowserEvent, publishEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"

import AIEditor from "../components/AIEditor"
import ManageClients from "../components/ManageClients"
import SwitchAction from "../components/SwitchAction"
import TemplateCover from "../components/TemplateCover"
import TemplateDetail from "../components/TemplateDetail"
import TemplateEditor from "../components/TemplateEditor"
import TemplateForm from "../components/TemplateForm"
import TemplateOverview from "../components/TemplateOverview"

interface TabItem {
    label: string
    value: string
    disabled?: boolean
}

/**
 * Builds the per-group tab set. Reports keep the legacy layout
 * (backgrounds + clients), while posts swap to overview + variants and
 * hide the report-only sections completely.
 */
const buildTabs = (template: ITemplate | undefined): TabItem[] => {
    if (!template) return []

    const isReports = template.template_group === "reports"

    const aiEditorDisabled = isReports
        || !template.template_file_url
        || !template.reference_file_url

    if (isReports) {
        return [
            { label: "Plantilla", value: "template" },
            { label: "Editar", value: "edit" },
            { label: "Editor IA", value: "ai-editor", disabled: aiEditorDisabled },
            { label: "Ver Fondos", value: "backgrounds" },
            { label: "Gestionar Clientes", value: "manage-clients" },
        ]
    }

    // Posts: Editor concentrates variants management + per-variant editor
    // in one place. The "Variantes" and "Editor IA" tabs were unified
    // because variants are the unit of work for posts.
    return [
        { label: "Información", value: "overview" },
        { label: "Editor", value: "editor" },
    ]
}

const TemplateDetailPage = () => {
    const params = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState<string>("overview")

    const { response: template, loading, setData } = useFetchQuery<ITemplate>(
        replaceRecordIdInPath(API_ROUTES.TEMPLATES.DETAIL, params.id || ""),
        {
            // Plural form matches the invalidation key used in
            // useTemplateVariants — otherwise creating/updating/deleting a
            // variant would not refresh this detail.
            customQueryKey: queryKeys.detail("templates", params?.id || ""),
            enabled: !!params.id,
        },
    )

    const tabs = useMemo(() => buildTabs(template), [template])
    const isReports = template?.template_group === "reports"

    // Whenever the template arrives, jump to the natural default tab for
    // its kind. Avoids leaving "overview" selected on a reports template
    // (which doesn't have that tab) and viceversa.
    useEffect(() => {
        if (!template) return
        const defaultTab = isReports ? "template" : "overview"
        setActiveTab(prev => (tabs.some(t => t.value === prev) ? prev : defaultTab))
    }, [template?.id, isReports, tabs])

    const handleTemplateUpdate = useCallback((event: BrowserEvent<ITemplate>) => {
        if (!template) return
        setData({ ...template, ...event.detail })
    }, [template, setData])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, handleTemplateUpdate as EventListener)
        return () => {
            unsubscribeEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, handleTemplateUpdate as EventListener)
        }
    }, [handleTemplateUpdate])

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-x-3 text-sm">
                    {template && isReports && (
                        <TemplateCover
                            templateId={template.id}
                            cover={template.picture}
                            templateName={template.name}
                        />
                    )}
                    <span className="text-muted-foreground">Plantilla:</span>
                    <span className="font-medium">{template?.name}</span>
                </div>
                <DynamicTabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    items={tabs}
                />
            </div>

            {loading || !template ? (
                <PageLoader />
            ) : (
                <>
                    {/* Reports — legacy "Plantilla" tab */}
                    {isReports && activeTab === "template" && (
                        <div className="flex flex-col gap-y-5">
                            <FieldValue label="Clientes usando">
                                <Badge variant="secondary" className="bg-[#4E31C0]/10 text-[#4E31C0]">
                                    <UsersIcon className="w-3 h-3 mr-1" />
                                    {template.clients_count}
                                </Badge>
                            </FieldValue>
                            <FieldValue label="Estado en sistema">
                                <SwitchAction
                                    templateId={template.id}
                                    actionField="active"
                                    checked={template.active}
                                    id={`template-${template.id}-status`}
                                />
                            </FieldValue>
                            <FieldValue label="Usada en todos los clientes">
                                <SwitchAction
                                    templateId={template.id}
                                    actionField="enabled_all_clients"
                                    checked={template.enabled_all_clients}
                                    id={`template-${template.id}-all_clients_enabled`}
                                />
                            </FieldValue>
                            <FieldValue label="Última actualización" value={formatDate(template.updated_at)} />
                        </div>
                    )}

                    {isReports && activeTab === "backgrounds" && (
                        <TemplateDetail template={template} />
                    )}

                    {isReports && activeTab === "manage-clients" && (
                        <ManageClients template={template} />
                    )}

                    {isReports && activeTab === "edit" && (
                        <div className="w-full md:w-3/4">
                            <TemplateForm
                                item={template}
                                onSuccess={updated =>
                                    publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, updated)
                                }
                            />
                        </div>
                    )}

                    {/* Posts — new overview + unified editor experience */}
                    {!isReports && activeTab === "overview" && (
                        <TemplateOverview template={template} />
                    )}

                    {!isReports && activeTab === "editor" && (
                        <TemplateEditor template={template} />
                    )}

                    {/* Reports — legacy template-scoped AI editor */}
                    {isReports && activeTab === "ai-editor" && (
                        <AIEditor template={template} />
                    )}
                </>
            )}
        </div>
    )
}

export default TemplateDetailPage
