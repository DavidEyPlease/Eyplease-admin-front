import {
    FileQuestionIcon
} from "lucide-react"

import { TemplateVariantKind } from "@/interfaces/templates"
import { cn } from "@/lib/utils"
import { isVideoUrl, KIND_ICONS } from "../page-utils"

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
