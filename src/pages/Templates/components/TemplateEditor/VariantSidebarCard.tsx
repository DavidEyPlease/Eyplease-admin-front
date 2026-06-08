import { EditIcon, EyeIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react"
import { KeyboardEvent, MouseEvent, useState } from "react"

import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import Switch from "@/components/common/Inputs/Switch"
import { Button } from "@/uishadcn/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/uishadcn/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ITemplateVariant } from "@/interfaces/templates"

import VariantFilesPreviewModal from "../TemplateVariants/VariantFilesPreviewModal"
import {
    useDeleteTemplateVariant,
    useUpdateTemplateVariant,
} from "../../useTemplateVariants"
import TemplatePreview from "../TemplatePreview"
import { KIND_ICONS, KIND_LABELS } from "../../page-utils"

interface VariantSidebarCardProps {
    templateId: string
    variant: ITemplateVariant
    selected: boolean
    onSelect: (variantId: string) => void
    onEdit: (variant: ITemplateVariant) => void
}

/**
 * Compact sidebar card. The whole card is clickable to select the
 * variant. Inner controls (switch, dropdown) stop event propagation so
 * they can be interacted with without changing the selection.
 */
const VariantSidebarCard = ({
    templateId,
    variant,
    selected,
    onSelect,
    onEdit,
}: VariantSidebarCardProps) => {
    const Icon = KIND_ICONS[variant.kind]
    const previewUrl = variant.reference_file_url ?? variant.template_file_url ?? null
    const hasAnyFile = Boolean(variant.template_file_url || variant.reference_file_url)
    const [filesPreviewOpen, setFilesPreviewOpen] = useState(false)

    const { updateVariant, requestState: updateState } = useUpdateTemplateVariant(
        templateId,
        variant.id,
    )
    const { deleteVariant, requestState: deleteState } = useDeleteTemplateVariant(
        templateId,
        variant.id,
    )

    const handleSelect = () => onSelect(variant.id)
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleSelect()
        }
    }
    const stopPropagation = (event: MouseEvent) => event.stopPropagation()

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
                className={cn(
                    "group cursor-pointer rounded-md border bg-card overflow-hidden transition-all hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    selected
                        ? "border-primary ring-2 ring-primary/30 shadow-sm"
                        : "border-border",
                )}
            >
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
                            onClick={event => {
                                event.stopPropagation()
                                setFilesPreviewOpen(true)
                            }}
                            className="absolute top-1.5 right-1.5 h-7 gap-1 px-2 text-[11px] bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <EyeIcon className="w-3 h-3" />
                            Ver archivos
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between gap-1.5 px-3 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-medium truncate">
                            {KIND_LABELS[variant.kind]}
                        </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={stopPropagation}>
                        <Switch
                            id={`sidebar-variant-${variant.id}-enabled`}
                            checked={variant.enabled}
                            disabled={updateState.loading}
                            onCheckedChange={value => updateVariant({ enabled: value })}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVerticalIcon className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(variant)}>
                                    <EditIcon className="w-3.5 h-3.5 mr-2" />
                                    Editar archivos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertConfirmDelete
                                    trigger={
                                        <DropdownMenuItem
                                            className="text-red-500"
                                            onSelect={event => event.preventDefault()}
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
                </div>
            </div>

            <VariantFilesPreviewModal
                variant={variant}
                open={filesPreviewOpen}
                onOpenChange={setFilesPreviewOpen}
            />
        </>
    )
}

export default VariantSidebarCard
