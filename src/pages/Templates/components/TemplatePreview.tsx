import {
    FileQuestionIcon,
    FileTextIcon,
    ImageIcon,
    PresentationIcon,
    VideoIcon,
    type LucideIcon,
} from "lucide-react"

import { MONTHS_OPTIONS } from "@/constants/app"
import { ITemplate, TemplateVariantKind } from "@/interfaces/templates"
import { cn } from "@/lib/utils"

/**
 * Display labels and icons per variant kind. Shared by every component
 * that lists or previews template variants (cards, overview, modals).
 */
export const KIND_LABELS: Record<TemplateVariantKind, string> = {
    image: "Imagen",
    video: "Video",
    pdf: "PDF",
    pptx: "PPTX",
}

export const KIND_ICONS: Record<TemplateVariantKind, LucideIcon> = {
    image: ImageIcon,
    video: VideoIcon,
    pdf: FileTextIcon,
    pptx: PresentationIcon,
}

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

    const refFromVariant = variants.find(v => v.enabled && v.reference_file_url)?.reference_file_url
    if (refFromVariant) return refFromVariant

    if (template.reference_file_url) return template.reference_file_url

    const baseFromVariant = variants.find(v => v.enabled && v.template_file_url)?.template_file_url
    if (baseFromVariant) return baseFromVariant

    return template.template_file_url ?? null
}

export const isVideoUrl = (url: string) => VIDEO_EXTENSIONS.test(url.split("?")[0])

export const monthLabelFor = (month: number): string => {
    const padded = month < 10 ? `0${month}` : `${month}`
    return MONTHS_OPTIONS.find(option => option.value === padded)?.label ?? padded
}

type PreviewMode = "thumb" | "full"

interface TemplatePreviewProps {
    url: string | null
    fallbackKind?: TemplateVariantKind | null
    alt: string
    className?: string
    /**
     * `thumb` (default) — cropped `aspect-video` + `object-cover`. Used in
     *   cards and overview where consistency matters more than fidelity.
     * `full` — `object-contain`, no aspect ratio enforced, capped at 70vh.
     *   Videos render with native controls so the user can scrub/play.
     */
    mode?: PreviewMode
}

const THUMB_WRAPPER = "aspect-video w-full bg-muted overflow-hidden"
const FULL_WRAPPER = "w-full bg-muted overflow-hidden flex items-center justify-center max-h-[70vh]"
const FULL_PLACEHOLDER_HEIGHT = "min-h-[260px]"

/**
 * Renders the template asset (image or video) with a graceful placeholder
 * when the URL is missing. Two modes:
 *   - `thumb`: visual-consistent crop for grids.
 *   - `full`: fidelity-first for dedicated previews (modal).
 */
const TemplatePreview = ({
    url,
    fallbackKind = null,
    alt,
    className,
    mode = "thumb",
}: TemplatePreviewProps) => {
    const isFull = mode === "full"
    const wrapperBase = isFull ? FULL_WRAPPER : THUMB_WRAPPER
    const fitClass = isFull ? "object-contain" : "object-cover"

    if (!url) {
        const FallbackIcon = fallbackKind ? KIND_ICONS[fallbackKind] : FileQuestionIcon
        return (
            <div
                className={cn(
                    wrapperBase,
                    "flex items-center justify-center",
                    isFull && FULL_PLACEHOLDER_HEIGHT,
                    className,
                )}
            >
                <FallbackIcon className={cn(isFull ? "w-14 h-14" : "w-10 h-10", "text-muted-foreground/40")} />
            </div>
        )
    }

    if (isVideoUrl(url)) {
        return (
            <video
                className={cn(wrapperBase, fitClass, isFull && "h-auto max-h-[70vh]", className)}
                src={url}
                controls={isFull}
                muted={!isFull}
                playsInline
                preload="metadata"
                aria-label={alt}
            />
        )
    }

    return (
        <img
            src={url}
            alt={alt}
            loading="lazy"
            className={cn(wrapperBase, fitClass, isFull && "h-auto max-h-[70vh]", className)}
        />
    )
}

export default TemplatePreview
