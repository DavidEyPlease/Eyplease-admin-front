import { CheckCircle2Icon, CircleDashedIcon, EyeIcon } from "lucide-react"
import { useMemo, useState } from "react"

import FileUploader from "@/components/generics/FileUploader"
import Modal from "@/components/common/Modal"
import Switch from "@/components/common/Inputs/Switch"
import Dropdown from "@/components/common/Inputs/Dropdown"
import FieldValue from "@/components/generics/FieldValue"
import {
    ITemplate,
    ITemplateVariant,
    TemplateVariantKind,
} from "@/interfaces/templates"
import useUploadStore from "@/store/uploadStore"
import { publishEvent } from "@/utils/events"
import {
    useCreateTemplateVariant,
    useUpdateTemplateVariant,
} from "../../useTemplateVariants"

import VariantFilesPreviewModal from "./VariantFilesPreviewModal"
import { KIND_ICONS, KIND_LABELS } from "../../page-utils"

interface UploadStatusProps {
    loaded: boolean
    onPreview: () => void
}

/**
 * Tiny status row rendered under each FileUploader inside the edit modal.
 * Tells the admin whether the slot already has a stored asset, and offers
 * a quick way to open the full-screen preview without leaving the modal.
 */
const UploadStatus = ({ loaded, onPreview }: UploadStatusProps) => {
    if (!loaded) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleDashedIcon className="w-3.5 h-3.5" />
                <span>Sin archivo cargado</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Archivo cargado
            </span>
            <button
                type="button"
                onClick={onPreview}
                className="flex items-center gap-1 text-primary hover:underline"
            >
                <EyeIcon className="w-3 h-3" />
                Ver
            </button>
        </div>
    )
}

const KIND_OPTIONS: { label: string; value: TemplateVariantKind }[] = (
    Object.keys(KIND_LABELS) as TemplateVariantKind[]
).map(kind => ({
    label: KIND_LABELS[kind],
    value: kind,
}))

const FILE_ACCEPTS = ".mp4,.mov,.webm,.jpg,.jpeg,.png,.pdf,.pptx"

type UploadKey = "template_file_uri" | "reference_file_url"

interface VariantFormModalProps {
    template: ITemplate
    variant: ITemplateVariant | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Single modal that drives both creation and editing of a TemplateVariant.
 *
 * On create — minimum viable: pick a kind that isn't already taken on the
 * template (UNIQUE constraint), choose enabled state. Files are uploaded
 * later from the edit flow because the upload pipeline needs an existing
 * variant id to attach the resulting S3 key to.
 *
 * On edit — kind is read-only (changing it would violate the UNIQUE
 * constraint server-side), file uploaders for the clean asset and the
 * reference example, and an enabled toggle.
 */
const VariantFormModal = ({ template, variant, open, onOpenChange }: VariantFormModalProps) => {
    const isEdit = Boolean(variant)
    const startUpload = useUploadStore(state => state.startUpload)
    const [uploadingKey, setUploadingKey] = useState<UploadKey | null>(null)
    const [filesPreviewOpen, setFilesPreviewOpen] = useState(false)

    // Default to the first kind not already taken by an enabled variant.
    const takenKinds = new Set((template.variants ?? []).map(v => v.kind))
    const availableKindOptions = useMemo(
        () => KIND_OPTIONS.filter(option => !takenKinds.has(option.value)),
        [template.variants],
    )

    const [pendingKind, setPendingKind] = useState<TemplateVariantKind | "">(
        () => availableKindOptions[0]?.value ?? "",
    )
    const [pendingEnabled, setPendingEnabled] = useState(true)

    const { createVariant, requestState: createState } = useCreateTemplateVariant(
        template.id,
        { onSuccess: () => onOpenChange(false) },
    )

    const { updateVariant, requestState: updateState } = useUpdateTemplateVariant(
        template.id,
        variant?.id ?? "",
    )

    const handleCreate = async () => {
        if (!pendingKind) return
        await createVariant({ kind: pendingKind, enabled: pendingEnabled })
    }

    const handleUploadFile = async (files: File[], key: UploadKey) => {
        if (!files.length || !variant) return
        setUploadingKey(key)

        try {
            await new Promise<void>(resolve => {
                startUpload(files, {
                    uploadUri: `/public/templates/posts/${template.slug}/variants/${variant.kind}`,
                    onAllSuccess: async uploaded => {
                        await updateVariant({ [key]: uploaded[0]?.fileUri })
                        publishEvent("clear-file-uploader", true)
                        resolve()
                    },
                })
            })
        } finally {
            setUploadingKey(null)
        }
    }

    const renderCreate = () => (
        <div className="flex flex-col gap-5">
            <Dropdown
                label="Tipo de variante"
                placeholder="Selecciona un tipo"
                items={availableKindOptions}
                value={pendingKind}
                onChange={value => setPendingKind(value as TemplateVariantKind)}
            />

            <FieldValue label="Activa">
                <Switch
                    id="new-variant-enabled"
                    checked={pendingEnabled}
                    onCheckedChange={setPendingEnabled}
                />
            </FieldValue>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!pendingKind || createState.loading}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {createState.loading ? "Creando..." : "Crear variante"}
                </button>
            </div>
        </div>
    )

    const renderEdit = () => {
        if (!variant) return null
        const KindIcon = KIND_ICONS[variant.kind]
        const updateLoading = updateState.loading || uploadingKey !== null

        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 p-4">
                    <div className="flex items-center gap-2">
                        <KindIcon className="w-4 h-4" />
                        <span className="font-medium">{KIND_LABELS[variant.kind]}</span>
                        <span className="text-xs text-muted-foreground">
                            (no editable)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Activa</span>
                        <Switch
                            id={`edit-variant-${variant.id}-enabled`}
                            checked={variant.enabled}
                            disabled={updateLoading}
                            onCheckedChange={value => updateVariant({ enabled: value })}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <FileUploader
                            title="Plantilla limpia"
                            description="El video/imagen base sin datos aplicados"
                            buttonText="Subir archivo"
                            fileAccepts={FILE_ACCEPTS}
                            loading={uploadingKey === "template_file_uri"}
                            onUploadFiles={files => handleUploadFile(files, "template_file_uri")}
                        />
                        <UploadStatus
                            loaded={Boolean(variant.template_file_url)}
                            onPreview={() => setFilesPreviewOpen(true)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <FileUploader
                            title="Referencia renderizada"
                            description="Ejemplo con datos reales aplicados"
                            buttonText="Subir archivo"
                            fileAccepts={FILE_ACCEPTS}
                            loading={uploadingKey === "reference_file_url"}
                            onUploadFiles={files => handleUploadFile(files, "reference_file_url")}
                        />
                        <UploadStatus
                            loaded={Boolean(variant.reference_file_url)}
                            onPreview={() => setFilesPreviewOpen(true)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Modal
                title={isEdit ? `Editar variante: ${variant && KIND_LABELS[variant.kind]}` : "Agregar variante"}
                description={
                    isEdit
                        ? "Administra los archivos y el estado de la variante"
                        : "Crea una representación del template para un formato de salida"
                }
                open={open}
                size="xxl"
                onOpenChange={onOpenChange}
            >
                {isEdit ? renderEdit() : renderCreate()}
            </Modal>

            <VariantFilesPreviewModal
                variant={variant}
                open={filesPreviewOpen}
                onOpenChange={setFilesPreviewOpen}
            />
        </>
    )
}

export default VariantFormModal
