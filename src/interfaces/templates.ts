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

export interface ITemplate extends IBaseDBProperties {
    name: string
    picture: NullishFile
    active: boolean
    template_group: string
    template_subgroup: string | null
    template_asset_type: 'image' | 'video' | null
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
}

export interface ITemplateUpdate {
    name?: string
    picture?: string
    active?: boolean
    enabled_all_clients?: boolean
}