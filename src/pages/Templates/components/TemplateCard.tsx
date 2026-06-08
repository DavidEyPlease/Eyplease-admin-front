import { Card, CardContent } from "@/uishadcn/ui/card"
import { Badge } from "@/uishadcn/ui/badge"
import { Link } from "react-router"

import { ITemplate } from "@/interfaces/templates"
import { APP_ROUTES } from "@/constants/app"
import SwitchAction from "./SwitchAction"
import TemplateActions from "./Actions"
import { KIND_ICONS, KIND_LABELS, monthLabelFor, resolveBadgeKinds, resolvePreviewUrl } from "../page-utils"
import TemplatePreview from "./TemplatePreview"

interface TemplateCardProps {
    template: ITemplate
}

const TemplateCard = ({ template }: TemplateCardProps) => {
    const kinds = resolveBadgeKinds(template)
    const previewUrl = resolvePreviewUrl(template)
    const detailPath = APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(":id", template.id)

    return (
        <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 pt-0 gap-0">
            <Link to={detailPath} className="block">
                <TemplatePreview
                    url={previewUrl}
                    fallbackKind={kinds[0] ?? null}
                    alt={template.name}
                />
            </Link>

            <CardContent className="flex flex-col gap-3 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-0.5">
                        <Link
                            to={detailPath}
                            className="block font-semibold text-sm truncate hover:underline"
                        >
                            {template.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                            {template.template_group}
                            {template.template_subgroup && ` · ${template.template_subgroup}`}
                        </p>
                    </div>
                    <TemplateActions template={template} />
                </div>

                {kinds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {kinds.map(kind => {
                            const Icon = KIND_ICONS[kind]
                            return (
                                <Badge
                                    key={kind}
                                    variant="secondary"
                                    className="gap-1 text-xs font-medium"
                                >
                                    <Icon className="w-3 h-3" />
                                    {KIND_LABELS[kind]}
                                </Badge>
                            )
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Mes
                        </span>
                        <span className="text-xs font-medium">{monthLabelFor(template.month)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Activa</span>
                        <SwitchAction
                            templateId={template.id}
                            actionField="active"
                            checked={template.active}
                            id={`template-card-${template.id}-status`}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TemplateCard
