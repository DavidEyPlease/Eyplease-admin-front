import { IBaseDBProperties, NullishFile } from "./common"

export type Backgrounds = {
    bg_sections: Record<string, string>
    covers: Record<string, string>
}

export type RenderConfiguration = {
    composition: string
    assets: Array<{ layerName: string, type: 'data' | 'image' | 'audio' | 'video', value: string }>
}

export interface ITemplate extends IBaseDBProperties {
    name: string
    picture: NullishFile
    active: boolean
    template_group: string
    clients_count: number
    enabled_all_clients: boolean
    render_provider_id: string | null
    slug: string
    template_file_uri: string | null
    assets_data?: {
        compositions: string[]
        layers: Array<{ layerName: string }>
        upload_status: string
    }
    render_configuration: RenderConfiguration | null
    unity_background_horizontal: Backgrounds
    unity_background_vertical: Backgrounds
    national_background_horizontal: Backgrounds
    national_background_vertical: Backgrounds
}

export interface ITemplateUpdate {
    name?: string
    picture?: string
    active?: boolean
    enabled_all_clients?: boolean
}