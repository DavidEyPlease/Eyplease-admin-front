import { Canvas, FabricImage, Textbox, type FabricObject } from "fabric"

import { EyrenderLayer, MockValues } from "@/interfaces/templates"

export type LayerObject = FabricObject & {
    data?: { layer: EyrenderLayer; layerIndex: number }
}

/**
 * Substitute `{{path.to.key}}` placeholders inside a string against the mock
 * values map (dot-notation). Returns the original string if no placeholder
 * matches.
 */
export const resolvePlaceholders = (text: string, mockValues: MockValues | null): string => {
    if (!mockValues) return text
    return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
        const value = key.split(".").reduce<unknown>(
            (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
            mockValues as unknown,
        )
        return value != null ? String(value) : `{{${key}}}`
    })
}

/**
 * Build a Fabric object for a layer, resolving placeholders against
 * the mock values so the canvas shows realistic content.
 *
 * Image loading strategy: try WITHOUT crossOrigin first (most S3 buckets
 * lack CORS headers and the editor doesn't need an untainted canvas).
 * If anything fails we fall back to a labeled dashed rectangle so the
 * editor always shows where the layer is.
 */
export const buildFabricObject = async (
    layer: EyrenderLayer,
    index: number,
    mockValues: MockValues | null,
): Promise<LayerObject | null> => {
    if (layer.type === "text") {
        const resolved = resolvePlaceholders(layer.text, mockValues)
        // Wait for the font to be ready so Fabric measures the text
        // with the correct metrics. Without this, the first render
        // happens with a fallback font and the layout is wrong.
        try {
            const weight = layer.fontWeight ?? 400
            const style = layer.fontStyle ?? "normal"
            await document.fonts.load(
                `${style} ${weight} ${layer.fontSize}px "${layer.fontFamily}"`,
            )
        } catch { /* font load failed, continue with fallback */ }

        const tb = new Textbox(resolved, {
            left: layer.x,
            top: layer.y,
            width: layer.maxWidth ?? layer.width ?? 400,
            fontSize: layer.fontSize,
            fontFamily: layer.fontFamily,
            fill: layer.color,
            fontStyle: layer.fontStyle ?? "normal",
            fontWeight: layer.fontWeight ?? 400,
            textAlign: layer.align ?? "left",
            opacity: layer.opacity ?? 1,
            angle: layer.rotation ?? 0,
            splitByGrapheme: false,
        }) as LayerObject
        tb.data = { layer, layerIndex: index }
        return tb
    }

    // image layer
    const w = layer.width ?? 200
    const h = layer.height ?? 200
    const resolvedSrc = resolvePlaceholders(layer.src, mockValues)
    const isPlaceholder = resolvedSrc.startsWith("{{")

    const makePlaceholderRect = async (): Promise<LayerObject> => {
        const { Rect, Group, Text } = await import("fabric")
        const rect = new Rect({
            width: w,
            height: h,
            fill: "rgba(78, 49, 192, 0.10)",
            stroke: "#4E31C0",
            strokeDashArray: [8, 6],
            strokeWidth: 3,
            rx: layer.clipShape === "circle" ? w / 2 : layer.borderRadius ?? 0,
            ry: layer.clipShape === "circle" ? h / 2 : layer.borderRadius ?? 0,
        })
        const label = new Text(layer.src, {
            fontSize: Math.min(w, h) * 0.08,
            fill: "#4E31C0",
            fontFamily: "monospace",
            originX: "center",
            originY: "center",
            left: w / 2,
            top: h / 2,
        })
        const group = new Group([rect, label], {
            left: layer.x,
            top: layer.y,
            opacity: layer.opacity ?? 1,
            angle: layer.rotation ?? 0,
        }) as LayerObject
        group.data = { layer, layerIndex: index }
        return group
    }

    if (isPlaceholder) return makePlaceholderRect()

    // Try loading the real image. NO crossOrigin — S3 public objects
    // usually lack CORS headers and crossOrigin makes them fail silently.
    try {
        const img = await FabricImage.fromURL(resolvedSrc)
        const scaleX = w / (img.width || w)
        const scaleY = h / (img.height || h)
        const scale = layer.fit === "contain" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY)
        img.set({
            left: layer.x,
            top: layer.y,
            scaleX: scale,
            scaleY: scale,
            opacity: layer.opacity ?? 1,
            angle: layer.rotation ?? 0,
        })
        const obj = img as unknown as LayerObject
        obj.data = { layer, layerIndex: index }
        return obj
    } catch (err) {
        console.warn(`[AIEditor] Failed to load image for layer ${index} (${resolvedSrc}):`, err)
        return makePlaceholderRect()
    }
}

/**
 * Read back current Fabric state into a layersTemplate, preserving the
 * fields we don't render visually. Returns the `fallback` untouched when
 * there is no live canvas.
 */
export const serializeCanvasToLayers = (
    canvas: Canvas | null,
    fallback: EyrenderLayer[],
): EyrenderLayer[] => {
    if (!canvas) return fallback
    const objects = canvas.getObjects() as LayerObject[]

    // Keep objects in their original layer index order
    const sorted = [...objects].sort(
        (a, b) => (a.data?.layerIndex ?? 0) - (b.data?.layerIndex ?? 0)
    )

    return sorted
        .map((obj) => {
            const original = obj.data?.layer
            if (!original) return null

            const x = Math.round(obj.left ?? original.x)
            const y = Math.round(obj.top ?? original.y)
            const rotation = Math.round(obj.angle ?? 0)
            const opacity = obj.opacity ?? 1
            const scaleX = obj.scaleX ?? 1
            const scaleY = obj.scaleY ?? 1
            const width = Math.round((obj.width ?? 0) * scaleX)
            const height = Math.round((obj.height ?? 0) * scaleY)

            if (original.type === "text") {
                const tb = obj as unknown as Textbox
                // Width comes from the Fabric box and accounts for the
                // user's resize handles. We persist BOTH `width` and
                // `maxWidth` to the same value — Remotion only triggers
                // text wrapping when `maxWidth` is set; without it the
                // text would render with `white-space: pre` and bleed
                // outside the canvas.
                const boxWidth = Math.round((tb.width ?? original.width ?? 400) * scaleX)
                return {
                    ...original,
                    x, y, rotation, opacity,
                    width: boxWidth,
                    maxWidth: boxWidth,
                    // IMPORTANT: keep the ORIGINAL placeholder, not the
                    // resolved mock text. The editor's text input updates
                    // `obj.data.layer.text` directly.
                    text: original.text,
                    fontSize: tb.fontSize ?? original.fontSize,
                    fontFamily: (tb.fontFamily as string) ?? original.fontFamily,
                    color: (tb.fill as string) ?? original.color,
                    fontStyle: (tb.fontStyle as "normal" | "italic") ?? original.fontStyle,
                    fontWeight: (tb.fontWeight as number | string) ?? original.fontWeight,
                    align: (tb.textAlign as "left" | "center" | "right") ?? original.align,
                }
            }
            return { ...original, x, y, width, height, rotation, opacity }
        })
        .filter(Boolean) as EyrenderLayer[]
}
