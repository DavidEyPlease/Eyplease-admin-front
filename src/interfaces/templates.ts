import { IBaseDBProperties, NullishFile } from "./common"

export type Backgrounds = {
    bg_sections: Record<string, string>
    covers: Record<string, string>
}

export type RenderConfiguration = {
    // Legacy Nexrender shape
    composition?: string
    assets?: Array<{ layerName: string, type: 'data' | 'image' | 'audio' | 'video', value: string }>
    // Eyrender shape (AI-assisted layer config)
    compositionId?: string
    canvas?: { width: number, height: number, fps: number, durationInFrames: number }
    layersTemplate?: EyrenderLayer[]
    backgroundUrl?: string

    layouts?: Record<string, any>
}

export type EyrenderLayerBase = {
    id?: string
    // Dynamic data binding: the backend replaces text/src by this key before
    // sending the payload to the Remotion API.
    data_key?: string
    x: number
    y: number
    width?: number
    height?: number
    rotation?: number
    opacity?: number
    zIndex?: number
}

export type EyrenderImageLayer = EyrenderLayerBase & {
    type: 'image'
    src: string
    fit?: 'cover' | 'contain' | 'fill'
    clipShape?: 'none' | 'circle' | 'rounded'
    borderRadius?: number
    border?: { width: number; color: string; style?: string }
    shadow?: { offsetX: number; offsetY: number; blur: number; color: string; spread?: number }
}

export type EyrenderTextLayer = EyrenderLayerBase & {
    type: 'text'
    text: string
    fontFamily: string
    fontSize: number
    fontWeight?: number | string
    fontStyle?: 'normal' | 'italic'
    color: string
    align?: 'left' | 'center' | 'right'
    lineHeight?: number
    letterSpacing?: number
    maxWidth?: number
    // Vertical flow: render this text below the layer whose data_key ===
    // flow_below, at flow_gap px under its rendered bottom (y is then ignored).
    flow_below?: string
    flow_gap?: number
    // Auto-fit: shrink fontSize down to min_size until the text fits `width`.
    auto_fit?: boolean
    min_size?: number
}

export type EyrenderLayer = EyrenderImageLayer | EyrenderTextLayer

export type MockValues = {
    sponsored: { name: string; photo_url: string; points_primary: string; points_secondary: string }
    client: { name: string; logo_url: string }
    badge: { url: string }
}

export type AIDraft = {
    compositionId: string
    canvas: { width: number, height: number, fps: number, durationInFrames: number }
    layersTemplate: EyrenderLayer[]
    cached?: boolean
    analyzed_at?: string | null
}

// Kinds supported by template_variants. Free-form string at the DB level;
// these are the values currently allowed by the backend form requests.
export type TemplateVariantKind = 'image' | 'video' | 'pdf' | 'pptx'

/**
 * Layer hints exposed by a TemplatePreset. The AI analyzer treats these
 * as "the layers this template has" and only infers their positions,
 * sizes and styles — never their existence or count.
 */
export interface ITemplatePresetLayer {
    id: string
    type: 'image' | 'text'
    data_key: string
    src?: string | null
    text?: string
    clip_shape_hint?: 'rounded' | 'circle' | 'none'
}

export interface ITemplatePresetScene {
    order: number
    name: string
    layers: ITemplatePresetLayer[]
}

/**
 * Reusable layer composition fetched from the backend catalog
 * (App\Constants\TemplatePresets). Linear presets carry `layers`;
 * `top3_honor_board` and similar multi-scene presets carry `scenes`.
 */
export interface ITemplatePreset {
    slug: string
    name: string
    reference_sample_count: number
    is_multi_scene: boolean
    layers?: ITemplatePresetLayer[]
    scenes?: ITemplatePresetScene[]
}

/**
 * Concrete representation of a Template in a specific output format. One
 * Template owns at most one variant per kind. Mirrors the backend model
 * TemplateVariant; render_configuration is opaque (its shape depends on
 * the kind / render engine).
 */
export interface ITemplateVariant extends IBaseDBProperties {
    template_id: string
    kind: TemplateVariantKind
    render_configuration: RenderConfiguration | null
    template_file_uri: string | null
    // Backend accessor: materialised public URL from the S3 key.
    template_file_url: string | null
    // The backend column stores an S3 key here despite the name; the
    // accessor materialises the public URL. We receive the URL.
    reference_file_url: string | null
    ai_draft_json: AIDraft | null
    ai_analyzed_at: string | null
    ai_image_hash: string | null
    enabled: boolean
}

export interface ITemplateVariantCreate {
    kind: TemplateVariantKind
    render_configuration?: RenderConfiguration | null
    template_file_uri?: string | null
    reference_file_url?: string | null
    enabled?: boolean
}

// `kind` is intentionally NOT updatable on the backend (would invalidate
// the UNIQUE (template_id, kind) constraint). Recreate to change it.
export interface ITemplateVariantUpdate {
    render_configuration?: RenderConfiguration | null
    template_file_uri?: string | null
    reference_file_url?: string | null
    enabled?: boolean
}

export interface ITemplate extends IBaseDBProperties {
    name: string
    picture: NullishFile
    active: boolean
    template_group: string
    template_subgroup: string | null
    template_asset_type: 'image' | 'video' | null
    // Conceptual layer composition slug used by the AI analyzer. Shared
    // across all variants of this template. Null when no AI flow applies.
    preset_slug: string | null
    clients_count: number
    enabled_all_clients: boolean
    render_provider_id: string | null
    slug: string
    template_file_uri: string | null
    template_file_url: string | null
    reference_image_uri: string | null
    reference_file_url: string | null
    month: number
    assets_data?: {
        compositions: string[]
        layers: Array<{ layerName: string }>
        upload_status: string
    }
    font_color: string | null
    render_configuration: RenderConfiguration | null
    ai_draft_json: AIDraft | null
    ai_analyzed_at: string | null
    ai_image_hash: string | null
    reference_image_url: string | null
    mock_values: MockValues
    unity_background_horizontal: Backgrounds
    unity_background_vertical: Backgrounds
    national_background_horizontal: Backgrounds
    national_background_vertical: Backgrounds
    metadata?: {
        pink_circle_months?: string
    }
    // Eager-loaded by the backend on /templates/{id}. Optional on list
    // endpoints (which omit it for payload size).
    variants?: ITemplateVariant[]
}

export interface ITemplateUpdate {
    name?: string
    picture?: string
    active?: boolean
    enabled_all_clients?: boolean
    preset_slug?: string | null
}