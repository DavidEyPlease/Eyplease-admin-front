import { MONTHS_OPTIONS } from "@/constants/app"
import { ITemplate, TemplateVariantKind } from "@/interfaces/templates"
import {
    FileQuestionIcon,
    FileTextIcon,
    ImageIcon,
    PresentationIcon,
    SquareIcon,
    VideoIcon,
    type LucideIcon,
} from "lucide-react"

export type TemplateFilters = {
    template_group: string
    not_template_group: string
    active: string
    month: string
    template_subgroup: string
    template_asset_type: 'image' | 'video' | ''
}

export type TemplateFilterKeys = keyof TemplateFilters

export const TEMPLATE_ASSET_TYPE_OPTIONS = [
    { label: 'Imagen', value: 'image' },
    { label: 'Video', value: 'video' },
]

/**
 * Display labels and icons per variant kind. Shared by every component
 * that lists or previews template variants (cards, overview, modals).
 */
export const KIND_LABELS: Record<TemplateVariantKind, string> = {
    image: "Imagen",
    image_square: "Cuadrada",
    video: "Video",
    pdf: "PDF",
    pptx: "PPTX",
}

export const KIND_ICONS: Record<TemplateVariantKind, LucideIcon> = {
    image: ImageIcon,
    image_square: SquareIcon,
    video: VideoIcon,
    pdf: FileTextIcon,
    pptx: PresentationIcon,
}

/**
 * Etiqueta e ícono de un formato, a prueba de formatos nuevos. `kind` es texto libre en la API: el
 * día que llegó `image_square` el panel buscó su ícono, recibió `undefined` y se cayeron la lista de
 * plantillas y la ficha enteras. Con estos, un formato desconocido sale con su nombre tal cual.
 */
export const kindLabel = (kind: string): string => KIND_LABELS[kind as TemplateVariantKind] ?? kind

export const kindIcon = (kind: string): LucideIcon => KIND_ICONS[kind as TemplateVariantKind] ?? FileQuestionIcon

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)$/i

/**
 * Variants take precedence over the legacy `template_asset_type` column.
 * Returns empty array when neither model has data.
 */
export const resolveBadgeKinds = (template: ITemplate): TemplateVariantKind[] => {
    if (template.variants && template.variants.length > 0) {
        return template.variants
            .filter(variant => variant.enabled)
            .map(variant => variant.kind)
    }

    return template.template_asset_type ? [template.template_asset_type] : []
}

/**
 * Picks the most representative asset URL for a preview, in order:
 *   1. A variant's rendered reference (most accurate of the final output)
 *   2. The legacy reference on the template
 *   3. A variant's clean template asset
 *   4. The legacy template asset
 */
export const resolvePreviewUrl = (template: ITemplate): string | null => {
    const variants = template.variants ?? []

    const refFromVariant = variants.find(v => v.enabled && v.template_file_uri)?.template_file_url
    if (refFromVariant) return refFromVariant

    return template.template_file_url ?? null
}

export const isVideoUrl = (url: string) => VIDEO_EXTENSIONS.test(url.split("?")[0])

export const monthLabelFor = (month: number): string => {
    const padded = month < 10 ? `0${month}` : `${month}`
    return MONTHS_OPTIONS.find(option => option.value === padded)?.label ?? padded
}

export const TEMPLATE_GROUP_REPORTS = ['reports', 'annual_report']
