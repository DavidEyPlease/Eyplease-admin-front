/**
 * Builds a "ready-to-paste" render configuration for eyrender-studio out of
 * the current AI analysis draft. Differences with the production payload:
 *
 *   1. A `background` layer is prepended pointing at the variant's clean
 *      template file (the studio doesn't add it automatically the way the
 *      backend does when materialising a real job).
 *   2. Layer `src` / `text` values are resolved against either the
 *      template's `mock_values` or the SPA defaults — so the studio render
 *      shows actual photos/names/points instead of placeholders like
 *      "{{sponsored.photo_url}}" or the literal "name".
 *
 * Pure helper. No clipboard, no toasts, no React — keep it testable.
 */

import {
    AIDraft,
    EyrenderImageLayer,
    EyrenderTextLayer,
    ITemplate,
    ITemplateVariant,
    MockValues,
} from "@/interfaces/templates"
import { DEFAULT_LOGO_URL, DEFAULT_PHOTO_URL } from "../../../EditorReports/layout-helpers"

/**
 * Mirrors the `backgroundLayer` schema declared in the eyrender service
 * (see plan: discriminatedUnion in src/schemas/layers.ts). Kept here as a
 * local type so we don't have to extend the SPA's `EyrenderLayer` union
 * just for this export.
 */
interface StudioBackgroundLayer {
    type: "background"
    src: string
    /**
     * Tells eyrender to render the background through `<Video>` instead of
     * `<Img>`. Required for video variants — without it, the studio tries
     * to load the mp4 as an image and the layer breaks.
     */
    isVideo: boolean
    x: number
    y: number
    width: number
    height: number
    fit: "cover" | "contain" | "fill"
    zIndex: number
}

type StudioLayer = StudioBackgroundLayer | EyrenderImageLayer | EyrenderTextLayer

export interface StudioRenderConfig {
    compositionId: string
    canvas: { width: number; height: number; fps: number; durationInFrames: number }
    layers: StudioLayer[]
}

/**
 * Fallback strings used when a template has no `mock_values` set yet. These
 * are intentionally generic — the goal is "the studio renders without
 * empty boxes", not branding accuracy.
 */
const FALLBACK_TEXT: Record<string, string> = {
    name: "Reyna Sánchez",
    client_name: "Cliente Demo",
    points: "850",
    points_missing: "150",
    points_next_missing: "300",
}

const resolveText = (dataKey: string | undefined, mock: MockValues | undefined, originalText: string): string => {
    if (!dataKey) return originalText

    // Top-3 honor board uses suffixed keys (name_1, points_3, ...). Strip
    // the trailing _<digit> so the same resolver covers both linear and
    // multi-scene presets without duplicating the table.
    const baseKey = dataKey.replace(/_\d+$/, "")

    switch (baseKey) {
        case "name":
            return mock?.sponsored?.name || FALLBACK_TEXT.name
        case "client_name":
            return mock?.client?.name || FALLBACK_TEXT.client_name
        case "points":
            return mock?.sponsored?.points_primary || FALLBACK_TEXT.points
        case "points_missing":
        case "points_next_missing":
            return mock?.sponsored?.points_secondary || FALLBACK_TEXT[baseKey]
        default:
            // Unknown key — keep the original text so the studio still
            // shows something coherent (often the data_key itself).
            return originalText || baseKey
    }
}

const resolveImageSrc = (dataKey: string | undefined, mock: MockValues | undefined, originalSrc: string): string => {
    if (!dataKey) return originalSrc

    const baseKey = dataKey.replace(/_\d+$/, "")

    switch (baseKey) {
        case "photo":
            return mock?.sponsored?.photo_url || DEFAULT_PHOTO_URL
        case "client_logo":
            return mock?.client?.logo_url || DEFAULT_LOGO_URL
        default:
            return originalSrc
    }
}

/**
 * Build the studio-ready render configuration.
 *
 * @param draft     Current draft (analysed or hand-edited)
 * @param variant   The active video variant — its `template_file_url` is
 *                  the clean source the background layer wraps.
 * @param template  The owning template — read for `mock_values`.
 */
export const buildStudioJson = (
    draft: AIDraft,
    variant: ITemplateVariant,
    template: ITemplate,
): StudioRenderConfig => {
    const mock = template.mock_values
    const canvas = draft.canvas

    const background: StudioBackgroundLayer = {
        type: "background",
        src: variant.template_file_url ?? "",
        // This helper lives under VideoEditor/ — every caller is a video
        // variant, so the background must always be rendered as video.
        // Derived from `variant.kind` defensively in case the file ever
        // gets reused for other kinds.
        isVideo: variant.kind === "video",
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        fit: "cover",
        // Lowest zIndex so AI-detected layers always render on top.
        zIndex: 0,
    }

    const resolvedLayers: StudioLayer[] = draft.layersTemplate.map((layer) => {
        if (layer.type === "image") {
            return {
                ...layer,
                src: resolveImageSrc(layer.data_key, mock, layer.src),
            }
        }
        return {
            ...layer,
            text: resolveText(layer.data_key, mock, layer.text),
        }
    })

    return {
        compositionId: draft.compositionId || "video-composer",
        canvas,
        layers: [background, ...resolvedLayers],
    }
}
