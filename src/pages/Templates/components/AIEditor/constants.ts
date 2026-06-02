/**
 * Static configuration and dropdown option lists shared across the AI editor
 * sub-components. Kept apart from the React tree so the option arrays are
 * created once and the panels stay purely presentational.
 */

export const PRELOADED_FONTS = [
    "Playfair Display",
    "Montserrat",
    "Inter",
    "Roboto",
    "Lato",
    "Poppins",
    "Open Sans",
]

export const DEFAULT_CANVAS = { width: 1080, height: 1620, fps: 30, durationInFrames: 1 }

// ---- Dropdown option lists (label/value pairs for the Dropdown component) ----

export const FONT_OPTIONS = PRELOADED_FONTS.map((font) => ({ label: font, value: font }))

export const FONT_WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800, 900].map((weight) => ({
    label: String(weight),
    value: String(weight),
}))

export const FONT_STYLE_OPTIONS = [
    { label: "Normal", value: "normal" },
    { label: "Itálica", value: "italic" },
]

export const TEXT_ALIGN_OPTIONS = [
    { label: "Izquierda", value: "left" },
    { label: "Centro", value: "center" },
    { label: "Derecha", value: "right" },
]

export const CLIP_SHAPE_OPTIONS = [
    { label: "Rectangular", value: "none" },
    { label: "Círculo", value: "circle" },
    { label: "Esquinas redondeadas", value: "rounded" },
]

export const IMAGE_FIT_OPTIONS = [
    { label: "Cover (recortar)", value: "cover" },
    { label: "Contain (ajustar)", value: "contain" },
    { label: "Fill (estirar)", value: "fill" },
]
