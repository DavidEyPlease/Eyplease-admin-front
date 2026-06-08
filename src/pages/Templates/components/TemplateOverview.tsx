import { useState } from "react"
import { EditIcon } from "lucide-react"

import { Badge } from "@/uishadcn/ui/badge"
import { Button } from "@/uishadcn/ui/button"
import { Card, CardContent } from "@/uishadcn/ui/card"
import Modal from "@/components/common/Modal"
import FieldValue from "@/components/generics/FieldValue"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import { ITemplate } from "@/interfaces/templates"
import { formatDate } from "@/utils/dates"
import { publishEvent } from "@/utils/events"

import SwitchAction from "./SwitchAction"
import TemplateForm from "./TemplateForm"
import TemplatePreview from "./TemplatePreview"
import { KIND_ICONS, KIND_LABELS, monthLabelFor, resolveBadgeKinds, resolvePreviewUrl } from "../page-utils"

interface TemplateOverviewProps {
    template: ITemplate
}

/**
 * Conceptual view of a non-reports template: preview + identity + key
 * metadata. Deliberately omits clients_count and `enabled_all_clients` to
 * match the new posts-only experience (variants are the unit of work).
 *
 * Editing is offloaded to the standard TemplateForm in a modal so we keep
 * the existing validation/feedback flow without duplicating UI.
 */
const TemplateOverview = ({ template }: TemplateOverviewProps) => {
    const [editOpen, setEditOpen] = useState(false)

    const previewUrl = resolvePreviewUrl(template)
    const kinds = resolveBadgeKinds(template)

    return (
        <>
            <Card className="overflow-hidden pt-0">
                <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-0">
                    <TemplatePreview
                        url={previewUrl}
                        fallbackKind={kinds[0] ?? null}
                        alt={template.name}
                        className="md:rounded-r-none border-b md:border-b-0 md:border-r"
                    />

                    <CardContent className="flex flex-col gap-5 p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                                <h3 className="text-xl font-semibold truncate">{template.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {template.template_group}
                                    {template.template_subgroup && ` · ${template.template_subgroup}`}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditOpen(true)}
                                className="gap-1.5"
                            >
                                <EditIcon className="w-3.5 h-3.5" />
                                Editar información
                            </Button>
                        </div>

                        {kinds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {kinds.map(kind => {
                                    const Icon = KIND_ICONS[kind]
                                    return (
                                        <Badge key={kind} variant="secondary" className="gap-1 text-xs font-medium">
                                            <Icon className="w-3 h-3" />
                                            {KIND_LABELS[kind]}
                                        </Badge>
                                    )
                                })}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
                            <FieldValue label="Mes" value={monthLabelFor(template.month)} />
                            <FieldValue label="Preset IA" value={template.preset_slug ?? "—"} />
                            <FieldValue label="Actualizada" value={formatDate(template.updated_at)} />
                            <FieldValue label="Activa">
                                <SwitchAction
                                    templateId={template.id}
                                    actionField="active"
                                    checked={template.active}
                                    id={`overview-${template.id}-active`}
                                />
                            </FieldValue>
                        </div>
                    </CardContent>
                </div>
            </Card>

            <Modal
                title={`Editar plantilla: ${template.name}`}
                description="Actualiza los datos básicos de la plantilla"
                open={editOpen}
                size="xxl"
                onOpenChange={() => setEditOpen(false)}
            >
                <TemplateForm
                    item={template}
                    onSuccess={updated => {
                        publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, updated)
                        setEditOpen(false)
                    }}
                />
            </Modal>
        </>
    )
}

export default TemplateOverview
