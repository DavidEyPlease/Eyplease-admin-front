import type Konva from "konva";

import { PhotoZone, TextZone, LogoZone, RGB, BgInfo, TemplateGroup } from "./layout-types";

/** Patch object accepted by the zone `update` callbacks. */
export type ZonePatch = Partial<PhotoZone> | Partial<TextZone> | Partial<LogoZone>;

/** Drag/select callbacks shared by every canvas zone node. */
export interface ZoneNodeHandlers {
    onSelect: (id: string, additive: boolean) => void;
    onDragStart: (id: string, node: Konva.Node) => void;
    onDragMove: (id: string, node: Konva.Node) => void;
    onDragEnd: (id: string, node: Konva.Node, extra?: ZonePatch) => void;
    setRef: (id: string, n: Konva.Node) => void;
}

// Canvas-only selection chrome color (Konva strokes can't read CSS vars).
export const SELECTION = "#7c5cff";

// Default images shown when a new zone is added.
// - DEFAULT_LOGO_URL is persisted as the logo zone's `src`.
// - DEFAULT_PHOTO_URL is an editor-only preview (photo zones are data-driven,
//   so this is never saved into the layout — it just makes the canvas realistic).
export const DEFAULT_PHOTO_URL = `${import.meta.env.VITE_CDN_URL}/public/templates/posts/placeholder-images/sponsored-photo.avif`;
export const DEFAULT_LOGO_URL = `${import.meta.env.VITE_CDN_URL}/public/templates/posts/placeholder-images/logo-example.png`;

// Spanish display labels for the English group/format values.
export const GROUP_LABELS: Record<string, string> = { unit: "Unidad", national: "Nacional" };
export const FORMAT_LABELS: Record<string, string> = { vertical: "Vertical", horizontal: "Horizontal" };

// Static Spanish display names per background asset slug, grouped by template group.
// Keys are the exact backend asset slugs (covers + bg_sections merged per group);
// slugs shared by a cover and a section mean the same thing, so they share one entry.
// The "Portada:" prefix is added automatically for covers by bgLabel() — don't add it here.
export const ASSET_LABELS: Record<TemplateGroup, Record<string, string>> = {
    unit: {
        // Covers
        cover_main: "Principal",
        start_page: "Hoja inicial",
        end_page: "Hoja final",
        honor_roll: "Cuadro de honor",
        initiators: "Iniciadoras",
        new_beginnings: "Nuevos inicios",
        birthdays: "Cumpleaños",
        stars: "Estrellas",
        luminaires: "Luminarias",
        pink_circle: "Círculo Rosa",
        road_to_success: "Camino al éxito",
        club_pts: "Club de puntos",
        // Sections
        target_pink_circle: "Target Círculo Rosa",
        pink_circle_vip: "Círculo Rosa VIP",
        pink_circle_vip_gold: "Círculo Rosa VIP Gold",
        road_success_diq: "Camino al éxito · DIQ",
        road_success_target_a_diq: "Camino al éxito · Target a DIQ",
        road_success_target_a_fd: "Camino al éxito · Target a FD",
        road_success_future_director: "Camino al éxito · Futura directora",
        diamond_star: "Estrella diamante",
        emerald_star: "Estrella esmeralda",
        pearl_star: "Estrella perla",
        ruby_star: "Estrella rubí",
        sapphire_star: "Estrella zafiro",
        diamond_luminaire: "Luminaria diamante",
        emerald_luminaire: "Luminaria esmeralda",
        pearl_luminaire: "Luminaria perla",
        ruby_luminaire: "Luminaria rubí",
        sapphire_luminaire: "Luminaria zafiro",
        ranking: "Ranking",
        ranking_top10: "Ranking Top 10",
        club300: "Club 300 puntos",
        club600: "Club 600 puntos",
        club900: "Club 900 puntos",
        club1200: "Club 1200 puntos",
        club1500: "Club 1500 puntos",
        club2000: "Club 2000 puntos",
        club2500: "Club 2500 puntos",
        club3000: "Club 3000 puntos",
    },
    national: {
        // Covers
        cover_main: "Principal",
        start_page: "Hoja inicial",
        end_page: "Hoja final",
        bonuses: "Bonos",
        road_to_success: "Camino al éxito",
        cuts: "Cortes",
        birthdays: "Cumpleaños",
        stars: "Estrellas",
        to_the_summit: "Hacia la cumbre",
        ranking: "Ranking",
        top_personal_ini: "Top iniciación personal",
        top_unit_initiation: "Top iniciación unidad",
        top_group_production: "Top producción de grupo",
        top_production_unit: "Top producción unidad",
        top_unit_size: "Top tamaño de unidad",
        top_personal_sales: "Top ventas personales",
        tsr: "TSR",
        // Sections
        top1_double: "1er lugar doble",
        top1_single: "1er lugar sencillo",
        top2_double: "2do lugar doble",
        top2_single: "2do lugar sencillo",
        top3_double: "3er lugar doble",
        top3_single: "3er lugar sencillo",
        bonus_24: "Bono 24",
        bonus_12: "Bono 12",
        bonus_7: "Bono 7",
        bonus_5: "Bono 5",
        bonus_4: "Bono 4",
        bonus_3: "Bono 3",
        bonus_2: "Bono 2",
        cut_1100: "Corte de 1100",
        cut_750: "Corte de 750",
        cut_600: "Corte de 600",
        cut_450: "Corte de 450",
        initiation_cut: "Corte de inicios",
        sales_cut: "Corte de ventas",
        dir_executive: "Directora ejecutiva",
        dir_executive_elite: "Directora ejecutiva élite",
        dir_senior: "Directora senior",
        dir_senior_elite: "Directora senior élite",
        diq: "Directora en calificación",
        diamond_stars: "Estrella diamante",
        emerald_stars: "Estrella esmeralda",
        pearl_stars: "Estrella perla",
        ruby_stars: "Estrella rubí",
        sapphire_stars: "Estrella zafiro",
        new_director: "Nueva directora",
        top10: "Top 10",
        top_3: "Top 3",
        tsr_1: "TSR 1er lugar",
        tsr_2: "TSR 2do lugar",
        tsr_target1: "TSR target 1er lugar",
        tsr_target2: "TSR target 2do lugar",
    },
};

/** Bare Spanish name for a background, falling back to the raw asset slug. */
export function bgName(bg: BgInfo): string {
    return ASSET_LABELS[bg.group]?.[bg.asset] || bg.asset;
}

/**
 * Human-readable label for a background option in a flat (ungrouped) picker.
 * Covers are prefixed with "Portada:", section backgrounds show only the name.
 * When options are shown under "Portadas"/"Secciones" headings, prefer bgName().
 */
export function bgLabel(bg: BgInfo): string {
    return bg.kind === "cover" ? `Portada: ${bgName(bg)}` : bgName(bg);
}

// ---- Dropdown option lists (label/value pairs for the Dropdown component) ----
export const SHAPE_OPTIONS = [
    { value: "circle", label: "Círculo" },
    { value: "rounded_rect", label: "Rect. redondeado" },
    { value: "rect", label: "Rectángulo" },
];
export const FONT_OPTIONS = [
    { value: "PlayfairDisplay-Italic", label: "Playfair Italic" },
    { value: "PlayfairDisplay", label: "Playfair" },
    { value: "Inter", label: "Inter" },
    { value: "DancingScript", label: "Dancing Script" },
];
export const WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800].map((w) => ({
    value: String(w),
    label: String(w),
}));

let _idc = 1;
export const newId = (p: string) => `${p}_${Date.now().toString(36)}_${_idc++}`;

export function familyPrefix(asset: string): string {
    const parts = asset.split("_");
    return parts.length <= 2 ? asset : parts.slice(0, -1).join("_");
}

export function sampleText(dataKey: string): string {
    const k = (dataKey || "").toLowerCase();
    if (k.includes("nombre")) return "María Fernanda González Hernández";
    if (k.includes("metrica") || k.includes("puntos")) return "1,240 puntos";
    if (k.includes("subtitulo") || k.includes("rol")) return "1ER LUGAR";
    return dataKey || "Texto";
}

export const photoDefaults = () => ({
    shape: "circle" as const,
    fit: "cover" as const,
    border: { color: [201, 167, 78] as RGB, width: 6, double: true, gap: 7, inner_width: 2 },
    shadow: { blur: 22, color: [40, 50, 35, 90] as [number, number, number, number], offset: [0, 10] as [number, number] },
});
export const nameDefaults = () => ({ font: "PlayfairDisplay-Italic", weight: 600, size: 46, color: [42, 74, 54] as RGB, line_height: 1.05 });
export const metricDefaults = () => ({ font: "Inter", weight: 600, size: 30, color: [161, 133, 74] as RGB, tracking: 1 });
