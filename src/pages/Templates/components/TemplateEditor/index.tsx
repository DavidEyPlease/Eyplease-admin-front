import { useEffect, useState } from "react"
import { PlusIcon, SparklesIcon, WandSparklesIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/uishadcn/ui/alert"
import { Button } from "@/uishadcn/ui/button"
import { EmptySection } from "@/components/generics/EmptySection"
import {
    ITemplate,
    ITemplateVariant,
    TemplateVariantKind,
} from "@/interfaces/templates"

import AIEditor from "../AIEditor"
import VariantFormModal from "../TemplateVariants/VariantFormModal"
import { KIND_LABELS } from "../TemplatePreview"
import VariantSidebarCard from "./VariantSidebarCard"
import VideoEditor from "./VideoEditor"
import { Separator } from "@/uishadcn/ui/separator"

interface TemplateEditorProps {
    template: ITemplate
}

const ALL_KINDS: TemplateVariantKind[] = Object.keys(KIND_LABELS) as TemplateVariantKind[]

/**
 * Empty state shown when no variant is selected (typically because the
 * template has no variants yet).
 */
const NoVariantPlaceholder = () => (
    <div className="flex items-center justify-center min-h-[320px] border border-dashed rounded-md bg-muted/30">
        <div className="text-center max-w-sm px-6">
            <WandSparklesIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="text-sm font-semibold mb-1">Selecciona una variante</h4>
            <p className="text-xs text-muted-foreground">
                Elige una variante de la barra lateral para empezar a editarla. Si todavía no tienes ninguna, agrega una desde el botón inferior.
            </p>
        </div>
    </div>
)

/**
 * Placeholder for variants whose editor is not implemented yet (video and
 * future kinds like pdf or pptx). Kept generic so adding a new editor is
 * a single conditional in `TemplateEditor`.
 */
const PendingEditorPlaceholder = ({
    kind,
    title,
    description,
}: { kind: TemplateVariantKind; title: string; description: string }) => (
    <Alert>
        <SparklesIcon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
            {description} (variante {KIND_LABELS[kind].toLowerCase()})
        </AlertDescription>
    </Alert>
)

const TemplateEditor = ({ template }: TemplateEditorProps) => {
    const variants = template.variants ?? []
    const [selectedId, setSelectedId] = useState<string | null>(() => variants[0]?.id ?? null)
    const [createOpen, setCreateOpen] = useState(false)
    const [editingVariant, setEditingVariant] = useState<ITemplateVariant | null>(null)

    // Reconcile selection with the latest variants list. Triggers when:
    //   - the user just created a variant from an empty state (auto-pick it)
    //   - the selected variant was deleted (fall back to the next available)
    useEffect(() => {
        if (variants.length === 0) {
            if (selectedId !== null) setSelectedId(null)
            return
        }
        const stillExists = selectedId && variants.some(v => v.id === selectedId)
        if (!stillExists) {
            setSelectedId(variants[0].id)
        }
    }, [variants, selectedId])

    const selected = variants.find(v => v.id === selectedId) ?? null
    const allKindsTaken = ALL_KINDS.every(kind => variants.some(v => v.kind === kind))

    const renderEditor = () => {
        if (!selected) return <NoVariantPlaceholder />

        if (selected.kind === "image") {
            // `key` forces a full remount when switching variants so the
            // editor's internal initial-state derivation re-runs from the
            // newly selected variant's render_configuration.
            return <AIEditor key={selected.id} template={template} variant={selected} />
        }

        if (selected.kind === "video") {
            // Same key-based remount trick used for image variants so the
            // editor's internal state is rebuilt from scratch when the
            // selection changes.
            return <VideoEditor key={selected.id} template={template} variant={selected} />
        }

        return (
            <PendingEditorPlaceholder
                kind={selected.kind}
                title="Editor no disponible"
                description="Este tipo de variante aún no tiene un editor visual asignado."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
            <aside className="flex flex-col gap-2">
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Variantes
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Selecciona una para editarla
                    </p>
                </div>

                {variants.length === 0 ? (
                    <EmptySection
                        title="Sin variantes"
                        description="Agrega una para empezar"
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {variants.map(variant => (
                            <VariantSidebarCard
                                key={variant.id}
                                templateId={template.id}
                                variant={variant}
                                selected={variant.id === selectedId}
                                onSelect={setSelectedId}
                                onEdit={setEditingVariant}
                            />
                        ))}
                    </div>
                )}

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateOpen(true)}
                    disabled={allKindsTaken}
                    className="gap-1.5"
                    title={allKindsTaken ? "Ya existe una variante por cada tipo soportado" : undefined}
                >
                    <PlusIcon className="w-4 h-4" />
                    Agregar variante
                </Button>
            </aside>

            <main className="min-w-0">{renderEditor()}</main>

            <VariantFormModal
                template={template}
                variant={null}
                open={createOpen}
                onOpenChange={setCreateOpen}
            />

            <VariantFormModal
                template={template}
                variant={editingVariant}
                open={Boolean(editingVariant)}
                onOpenChange={open => {
                    if (!open) setEditingVariant(null)
                }}
            />
        </div>
    )
}

export default TemplateEditor
