// Layout schema — MUST match the Python renderer (render_slide.py).
// Layouts are stored in Template.render_configuration.layouts[`${group}/${format}/${asset}`]

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

export type TemplateGroup = "unit" | "national";
export type TemplateFormat = "vertical" | "horizontal";

export interface Border { color: RGB; width: number; double?: boolean; gap?: number; inner_width?: number; }
export interface Shadow { blur: number; color: RGBA; offset: [number, number]; }

export interface PhotoZone {
    id: string; type: "photo"; data_key: string;
    x: number; y: number; w: number; h: number;
    shape: "circle" | "rounded_rect" | "rect"; radius?: number; fit?: "cover" | "contain";
    border?: Border; shadow?: Shadow;
}
export interface TextZone {
    id: string; type: "text"; data_key: string;
    x: number; y: number; w: number;
    align: "left" | "center" | "right"; valign: "top" | "middle" | "bottom";
    font: string; weight: number; size: number; color: RGB;
    line_height?: number; tracking?: number; uppercase?: boolean; static?: string;
    // Vertical flow (renderer-side): when set, render this text below the zone
    // whose data_key === flow_below, measuring that zone's real height and
    // adding flow_gap px. Lets points sit a constant gap under a name that may
    // wrap to 1 or 2 lines. `y` is ignored by the renderer when flow_below is set.
    flow_below?: string;
    flow_gap?: number;
    // Auto-fit (renderer-side): shrink the font from `size` down to `min_size`
    // until the text fits the box width (avoids long names wrapping).
    auto_fit?: boolean;
    min_size?: number;
}
export interface LogoZone {
    id: string; type: "logo"; src: string;
    x: number; y: number; w: number; h: number; fit?: "contain" | "cover";
}
export type Zone = PhotoZone | TextZone | LogoZone;

export interface Layout { name: string; canvas: { w: number; h: number }; zones: Zone[]; }

export interface BgInfo { group: TemplateGroup; format: TemplateFormat; kind: "cover" | "section"; asset: string; url: string; }

export const FONT_MAP: Record<string, { family: string; italic: boolean }> = {
    "PlayfairDisplay": { family: "Playfair Display", italic: false },
    "PlayfairDisplay-Italic": { family: "Playfair Display", italic: true },
    "Inter": { family: "Inter", italic: false },
    "DancingScript": { family: "Dancing Script", italic: false },
};

// Storage key — MUST match the Python renderer: group/format/kind/asset.
// `kind` ("cover" | "section") is part of the key so a cover and a section that
// share the same asset slug (e.g. "honor_roll") get distinct layouts.
export const layoutKey = (b: { group: string; format: string; kind: string; asset: string }) =>
    `${b.group}/${b.format}/${b.kind}/${b.asset}`;

// Box(top-left, editor) <-> anchor(renderer) conversion for text
export function textToRenderer(z: TextZone): TextZone {
    let rx = z.x;
    if (z.align === "center") rx = z.x + z.w / 2;
    else if (z.align === "right") rx = z.x + z.w;
    return { ...z, x: Math.round(rx), y: Math.round(z.y), w: Math.round(z.w), valign: "top" };
}
export function textFromRenderer(z: TextZone): TextZone {
    let bx = z.x;
    if (z.align === "center") bx = z.x - z.w / 2;
    else if (z.align === "right") bx = z.x - z.w;
    return { ...z, x: Math.round(bx), y: Math.round(z.y) };
}
