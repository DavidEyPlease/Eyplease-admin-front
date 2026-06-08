import Modal from "@/components/common/Modal"
import { ITemplateVariant } from "@/interfaces/templates"
import TemplatePreview, { KIND_LABELS } from "../TemplatePreview"

interface VariantFilesPreviewModalProps {
    variant: ITemplateVariant | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface FileSlotProps {
    title: string
    description: string
    url: string | null
    fallbackKind: ITemplateVariant["kind"]
    alt: string
}

const FileSlot = ({ title, description, url, fallbackKind, alt }: FileSlotProps) => (
    <div className="space-y-2">
        <div>
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <TemplatePreview
            url={url}
            fallbackKind={fallbackKind}
            alt={alt}
            mode="full"
            className="rounded-md border"
        />
        {!url && (
            <p className="text-xs text-muted-foreground italic">Sin archivo cargado</p>
        )}
    </div>
)

/**
 * Read-only preview of the two assets that belong to a variant. Triggered
 * from the variant card's overlay button; editing the files still lives
 * in VariantFormModal.
 */
const VariantFilesPreviewModal = ({ variant, open, onOpenChange }: VariantFilesPreviewModalProps) => {
    if (!variant) return null

    return (
        <Modal
            title={`Archivos de la variante: ${KIND_LABELS[variant.kind]}`}
            description="Vista previa de la plantilla limpia y la referencia renderizada"
            open={open}
            size="xxl"
            onOpenChange={onOpenChange}
        >
            <div className="grid md:grid-cols-2 gap-6">
                <FileSlot
                    title="Plantilla limpia"
                    description="Asset base sin datos aplicados"
                    url={variant.template_file_url ?? null}
                    fallbackKind={variant.kind}
                    alt="Plantilla limpia"
                />
                <FileSlot
                    title="Referencia renderizada"
                    description="Ejemplo con datos reales aplicados"
                    url={variant.reference_file_url ?? null}
                    fallbackKind={variant.kind}
                    alt="Referencia renderizada"
                />
            </div>
        </Modal>
    )
}

export default VariantFilesPreviewModal
