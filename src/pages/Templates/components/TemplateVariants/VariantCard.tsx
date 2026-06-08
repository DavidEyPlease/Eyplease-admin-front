import { useState } from "react"
import { EditIcon, EyeIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react"

import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import Switch from "@/components/common/Inputs/Switch"
import { Badge } from "@/uishadcn/ui/badge"
import { Button } from "@/uishadcn/ui/button"
import { Card, CardContent } from "@/uishadcn/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/uishadcn/ui/dropdown-menu"
import { ITemplateVariant } from "@/interfaces/templates"
import TemplatePreview from "../TemplatePreview"
import {
    useDeleteTemplateVariant,
    useUpdateTemplateVariant,
} from "../../useTemplateVariants"
import VariantFilesPreviewModal from "./VariantFilesPreviewModal"
import { KIND_ICONS, KIND_LABELS } from "../../page-utils"

interface VariantCardProps {
    templateId: string
    variant: ITemplateVariant
    onEdit: (variant: ITemplateVariant) => void
}

const VariantCard = ({ templateId, variant, onEdit }: VariantCardProps) => {
    const Icon = KIND_ICONS[variant.kind]
    const [filesPreviewOpen, setFilesPreviewOpen] = useState(false)

    const { updateVariant, requestState: updateState } = useUpdateTemplateVariant(
        templateId,
        variant.id,
    )
    const { deleteVariant, requestState: deleteState } = useDeleteTemplateVariant(
        templateId,
        variant.id,
    )

    const previewUrl = variant.reference_file_url ?? variant.template_file_url ?? null
    const hasAnyFile = Boolean(variant.template_file_url || variant.reference_file_url)

    return (
        <>
            <Card className="group overflow-hidden pt-0 gap-0 transition-all hover:shadow-md">
                <div className="relative">
                    <TemplatePreview
                        url={previewUrl}
                        fallbackKind={variant.kind}
                        alt={`Variante ${KIND_LABELS[variant.kind]}`}
                    />
                    {hasAnyFile && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setFilesPreviewOpen(true)}
                            className="absolute top-2 right-2 h-8 gap-1.5 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <EyeIcon className="w-3.5 h-3.5" />
                            Ver archivos
                        </Button>
                    )}
                </div>

                <CardContent className="flex flex-col gap-3 px-4 py-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="secondary" className="gap-1 text-xs font-medium">
                                <Icon className="w-3 h-3" />
                                {KIND_LABELS[variant.kind]}
                            </Badge>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(variant)}>
                                    <EditIcon className="w-3.5 h-3.5 mr-2" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertConfirmDelete
                                    trigger={
                                        <DropdownMenuItem
                                            className="text-red-500"
                                            onSelect={e => e.preventDefault()}
                                        >
                                            <Trash2Icon className="w-3.5 h-3.5 mr-2 text-red-500" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    }
                                    loading={deleteState.loading}
                                    onConfirm={() => deleteVariant()}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">Activa</span>
                        <Switch
                            id={`variant-${variant.id}-enabled`}
                            checked={variant.enabled}
                            disabled={updateState.loading}
                            onCheckedChange={value => updateVariant({ enabled: value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <VariantFilesPreviewModal
                variant={variant}
                open={filesPreviewOpen}
                onOpenChange={setFilesPreviewOpen}
            />
        </>
    )
}

export default VariantCard
