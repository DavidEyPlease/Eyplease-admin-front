import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card"
import { Badge } from "@/uishadcn/ui/badge"
import { UsersIcon } from "lucide-react"
import { Link } from "react-router"

import { ITemplate } from "@/interfaces/templates"
import { APP_ROUTES } from "@/constants/app"
import TemplateCover from "../../components/TemplateCover"
import SwitchAction from "../../components/SwitchAction"
import TemplateActions from "../../components/Actions"

interface TemplateCardProps {
    template: ITemplate
}

const TemplateCard = ({ template }: TemplateCardProps) => {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
            <CardHeader className="pb-4 pt-3">
                <div className="flex justify-between items-start gap-x-3">
                    <div className="flex items-center gap-x-4 min-w-0">
                        {template.template_group === 'reports' && (
                            <TemplateCover
                                templateId={template.id}
                                cover={template.picture}
                                templateName={template.name}
                            />
                        )}
                        <div className="flex flex-col min-w-0">
                            <Link
                                className="font-medium underline truncate text-sm"
                                to={APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(':id', template.id)}
                            >
                                {template.name}
                            </Link>
                            {template.template_asset_type && (
                                <span className="text-xs text-muted-foreground">Recurso: {template.template_asset_type}</span>
                            )}
                            <span className="text-xs text-muted-foreground">Mes: {template.month}</span>
                        </div>
                    </div>
                    <TemplateActions template={template} />
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Grupo: {template.template_group} <br />
                        Subgrupo: {template.template_subgroup || 'N/A'}
                    </span>
                    <Badge variant="secondary" className="bg-[#4E31C0]/10 text-[#4E31C0]">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {template.clients_count} clientes
                    </Badge>
                </div>
                <div className="flex items-center justify-between gap-x-2 pt-2 border-t border-border">
                    <div className="flex flex-col gap-y-1">
                        <span className="text-xs text-muted-foreground">Estado en sistema</span>
                        <SwitchAction
                            templateId={template.id}
                            actionField="active"
                            checked={template.active}
                            id={`template-card-${template.id}-status`}
                        />
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <span className="text-xs text-muted-foreground">Todos los clientes</span>
                        <SwitchAction
                            templateId={template.id}
                            actionField="enabled_all_clients"
                            checked={template.enabled_all_clients}
                            id={`template-card-${template.id}-all-clients`}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TemplateCard
