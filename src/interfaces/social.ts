/** Redes: lo que manda la API en `admin/social/*` (ver SocialPostService en la API). */

export type SocialStatus = 'idea' | 'production' | 'review' | 'scheduled' | 'publishing' | 'published' | 'failed'
export type SocialFormat = 'post' | 'carousel' | 'story' | 'reel'
export type SocialChannel = 'ig' | 'fb'

export interface SocialMedia {
    url: string
    path?: string | null
    type: 'image' | 'video'
}

export interface SocialChannelMetrics {
    reach?: number | null
    likes?: number | null
    comments?: number | null
    saved?: number | null
    shares?: number | null
    replies?: number | null
}

export interface SocialPost {
    id: string
    title: string
    pillar: string | null
    format: SocialFormat
    channels: SocialChannel[]
    caption: string | null
    media: SocialMedia[]
    scheduled_at: string | null
    status: SocialStatus
    change_note: string | null
    approved_at: string | null
    approved_by: string | null
    created_by: string | null
    published_at: string | null
    results: Partial<Record<SocialChannel, { id: string, permalink: string | null }>> | null
    last_error: string | null
    attempts: number
    metrics: Partial<Record<SocialChannel, SocialChannelMetrics>> | null
    metrics_at: string | null
}

export interface SocialCalendarResponse {
    items: SocialPost[]
    from: string
    to: string
    month: {
        label: string
        planned: number
        published: number
        reach: number
        pillars: Array<{ key: string, label: string, target: number, count: number }>
        arrivals: Partial<Record<'instagram' | 'facebook', number>>
        best: Array<{ id: string, title: string, format: SocialFormat, thumb: string | null, published_at: string | null, reach: number, metrics: SocialPost['metrics'] }>
    }
    pillars: Array<{ key: string, label: string }>
    meta: { ready: boolean, reason?: string, page?: string | null, instagram?: string | null }
}

export interface SocialPostInput {
    title?: string
    pillar?: string | null
    format?: SocialFormat
    channels?: SocialChannel[]
    caption?: string | null
    scheduled_at?: string | null
    status?: 'idea' | 'production' | 'review'
    media?: SocialMedia[]
}
