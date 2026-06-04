// Adapter between the Konva editor's internal Zone model and the Remotion
// "layers" format (EyrenderLayer) used by the posts/templates render API.
//
// Notes:
// - Coordinate space is the background's natural pixel size (same as reports),
//   which equals the `canvas` sent to the Remotion API.
// - Text in the editor is stored as a top-left box (x,y,w + align). The hook's
//   load step applies `textFromRenderer` (anchor -> box), so layersToZones must
//   emit text x in ANCHOR form; zonesToLayers reads the already-box-form zones.
// - The background is NOT a layer here: it comes from template_file_url and is
//   composed by the backend, consistent with the existing layersTemplate.
// - data_key carries the dynamic binding; the backend resolves text/src from it.

import { EyrenderLayer, EyrenderImageLayer, EyrenderTextLayer } from "@/interfaces/templates";
import { Zone, PhotoZone, TextZone, LogoZone, RGB, RGBA, FONT_MAP } from "./layout-types";
import { newId } from "./layout-helpers";

// Logo zones always bind to the client logo; the backend resolves the src.
const LOGO_DATA_KEY = "client_logo";

// ---- color helpers ----
const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
const rgbToHex = (rgb: RGB | RGBA): string =>
    "#" + rgb.slice(0, 3).map((v) => clampByte(v).toString(16).padStart(2, "0")).join("");
const rgbaToCss = (c: RGBA): string =>
    `rgba(${clampByte(c[0])}, ${clampByte(c[1])}, ${clampByte(c[2])}, ${Math.max(0, Math.min(1, (c[3] ?? 100) / 100))})`;
const hexToRgb = (h: string): RGB => {
    const m = (h || "").replace("#", "");
    const s = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
    return [parseInt(s.slice(0, 2), 16) || 0, parseInt(s.slice(2, 4), 16) || 0, parseInt(s.slice(4, 6), 16) || 0];
};
const cssColorToRgb = (c: string): RGB => {
    if (!c) return [0, 0, 0];
    if (c.startsWith("#")) return hexToRgb(c);
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m) { const [r, g, b] = m[1].split(",").map((n) => parseInt(n.trim(), 10) || 0); return [r, g, b]; }
    return [0, 0, 0];
};

// ---- font helpers (editor enum <-> family + style) ----
const fontToFamily = (font: string) => FONT_MAP[font]?.family ?? font;
const fontIsItalic = (font: string) => FONT_MAP[font]?.italic ?? false;
const familyToFont = (family: string, italic: boolean): string => {
    const exact = Object.entries(FONT_MAP).find(([, v]) => v.family === family && v.italic === italic);
    if (exact) return exact[0];
    const sameFamily = Object.entries(FONT_MAP).find(([, v]) => v.family === family);
    return sameFamily ? sameFamily[0] : "Inter";
};

const num = (v: unknown, fallback = 0): number => (typeof v === "number" ? v : fallback);

/** Editor zones (box form) -> Remotion layers (foreground only, no background). */
export function zonesToLayers(zones: Zone[]): EyrenderLayer[] {
    return zones.map((z): EyrenderLayer => {
        if (z.type === "text") {
            return {
                id: z.id, type: "text", data_key: z.data_key,
                x: Math.round(z.x), y: Math.round(z.y), width: Math.round(z.w),
                text: z.static ?? z.data_key,
                fontFamily: fontToFamily(z.font),
                fontSize: z.size,
                fontWeight: z.weight,
                fontStyle: fontIsItalic(z.font) ? "italic" : "normal",
                color: rgbToHex(z.color),
                align: z.align,
                ...(z.line_height != null ? { lineHeight: z.line_height } : {}),
                ...(z.tracking != null ? { letterSpacing: z.tracking } : {}),
                ...(z.flow_below ? { flow_below: z.flow_below } : {}),
                ...(z.flow_gap != null ? { flow_gap: z.flow_gap } : {}),
                ...(z.auto_fit ? { auto_fit: true } : {}),
                ...(z.min_size != null ? { min_size: z.min_size } : {}),
            } as EyrenderTextLayer;
        }
        if (z.type === "logo") {
            return {
                id: z.id, type: "image", data_key: LOGO_DATA_KEY,
                x: Math.round(z.x), y: Math.round(z.y), width: Math.round(z.w), height: Math.round(z.h),
                src: z.src, fit: z.fit ?? "contain",
                ...(z.opacity != null ? { opacity: z.opacity } : {}),
            } as EyrenderImageLayer;
        }
        // photo (data-bound image; src resolved by the backend via data_key)
        return {
            id: z.id, type: "image", data_key: z.data_key,
            x: Math.round(z.x), y: Math.round(z.y), width: Math.round(z.w), height: Math.round(z.h),
            src: "",
            fit: z.fit ?? "cover",
            clipShape: z.shape === "circle" ? "circle" : z.shape === "rounded_rect" ? "rounded" : "none",
            ...(z.radius != null ? { borderRadius: z.radius } : {}),
            ...(z.opacity != null ? { opacity: z.opacity } : {}),
            ...(z.border ? { border: { width: z.border.width, color: rgbToHex(z.border.color), style: "solid" } } : {}),
            ...(z.shadow ? { shadow: { offsetX: z.shadow.offset[0], offsetY: z.shadow.offset[1], blur: z.shadow.blur, color: rgbaToCss(z.shadow.color) } } : {}),
        } as EyrenderImageLayer;
    });
}

/** Remotion layers -> editor zones (text in anchor form for the hook's loader). */
export function layersToZones(layers: EyrenderLayer[]): Zone[] {
    const zones: Zone[] = [];
    for (const l of layers) {
        // Ignore any background layer — the editor renders template_file_url.
        if ((l as { type?: string }).type === "background") continue;

        if (l.type === "text") {
            const align = (l.align ?? "left") as TextZone["align"];
            const w = num(l.width);
            let ax = l.x; // anchor x (textFromRenderer maps it back to a box)
            if (align === "center") ax = l.x + w / 2;
            else if (align === "right") ax = l.x + w;
            zones.push({
                id: newId("txt"), type: "text", data_key: l.data_key ?? "",
                x: Math.round(ax), y: Math.round(l.y), w: Math.round(w),
                align, valign: "top",
                font: familyToFont(l.fontFamily, l.fontStyle === "italic"),
                weight: typeof l.fontWeight === "number" ? l.fontWeight : parseInt(String(l.fontWeight ?? 400), 10) || 400,
                size: l.fontSize,
                color: hexToRgb(l.color),
                ...(l.lineHeight != null ? { line_height: l.lineHeight } : {}),
                ...(l.letterSpacing != null ? { tracking: l.letterSpacing } : {}),
                ...(l.flow_below ? { flow_below: l.flow_below } : {}),
                ...(l.flow_gap != null ? { flow_gap: l.flow_gap } : {}),
                ...(l.auto_fit ? { auto_fit: true } : {}),
                ...(l.min_size != null ? { min_size: l.min_size } : {}),
                ...(l.data_key ? {} : { static: l.text }),
            } as TextZone);
            continue;
        }

        if (l.type === "image") {
            const common = { x: Math.round(l.x), y: Math.round(l.y), w: Math.round(num(l.width)), h: Math.round(num(l.height)) };
            const fit = l.fit === "fill" ? "cover" : l.fit;
            // A logo is an image bound to client_logo; any other data_key is a
            // (data-driven) photo; no data_key is a static logo image.
            if (l.data_key && l.data_key !== LOGO_DATA_KEY) {
                zones.push({
                    id: newId("foto"), type: "photo", data_key: l.data_key, ...common,
                    shape: l.clipShape === "circle" ? "circle" : l.clipShape === "rounded" ? "rounded_rect" : "rect",
                    ...(l.borderRadius != null ? { radius: l.borderRadius } : {}),
                    ...(l.opacity != null ? { opacity: l.opacity } : {}),
                    fit: (fit as "cover" | "contain") ?? "cover",
                    ...(l.border ? { border: { color: cssColorToRgb(l.border.color), width: l.border.width } } : {}),
                    ...(l.shadow ? { shadow: { blur: l.shadow.blur, color: [...cssColorToRgb(l.shadow.color), 100] as RGBA, offset: [l.shadow.offsetX, l.shadow.offsetY] as [number, number] } } : {}),
                } as PhotoZone);
            } else {
                zones.push({ id: newId("logo"), type: "logo", src: l.src, ...common, fit: (fit as "cover" | "contain") ?? "contain", ...(l.opacity != null ? { opacity: l.opacity } : {}) } as LogoZone);
            }
        }
    }
    return zones;
}
