import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/uishadcn/ui/button"
import { EmptySection } from "@/components/generics/EmptySection"
import {
    ITemplate,
    ITemplateVariant,
    TemplateVariantKind,
} from "@/interfaces/templates"
import VariantCard from "./VariantCard"
import VariantFormModal from "./VariantFormModal"
import { KIND_LABELS } from "../../page-utils"

interface TemplateVariantsTabProps {
    template: ITemplate
}

const TemplateVariantsTab = ({ template }: TemplateVariantsTabProps) => {
    const [editingVariant, setEditingVariant] = useState<ITemplateVariant | null>(null)
    const [createOpen, setCreateOpen] = useState(false)

    const variants = template.variants ?? []
    const allKindsTaken = (Object.keys(KIND_LABELS) as TemplateVariantKind[])
        .every(kind => variants.some(v => v.kind === kind))

    const openEdit = (variant: ITemplateVariant) => setEditingVariant(variant)
    const closeEdit = () => setEditingVariant(null)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold">Variantes</h3>
                    <p className="text-sm text-muted-foreground">
                        Cada variante representa un formato concreto de salida (imagen, video, pdf, pptx)
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    disabled={allKindsTaken}
                    className="gap-1.5"
                    title={allKindsTaken ? "Ya existe una variante por cada tipo soportado" : undefined}
                >
                    <PlusIcon className="w-4 h-4" />
                    Agregar variante
                </Button>
            </div>

            {variants.length === 0 ? (
                <EmptySection
                    title="Sin variantes todavía"
                    description="Agrega una para empezar a configurar formatos de salida"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variants.map(variant => (
                        <VariantCard
                            key={variant.id}
                            templateId={template.id}
                            variant={variant}
                            onEdit={openEdit}
                        />
                    ))}
                </div>
            )}

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
                    if (!open) closeEdit()
                }}
            />
        </div>
    )
}

export default TemplateVariantsTab
