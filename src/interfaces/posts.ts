/**
 * Contrato de cobertura de publicaciones.
 * Mezcla dos orígenes (ver plan de backend):
 *  - snapshot  → expected / pending (caro: dry-run de fetchData por sección×subsección×artefacto)
 *  - en vivo   → posts / with_image / with_video / notified (GROUP BY sobre posts + files)
 */

export type PostArtifact = 'image' | 'video'

export type NewsletterCode = 'unit_newsletter' | 'national_newsletter'

export type SectionCadence = 'daily' | 'monthly'

export interface ICoverageSubsection {
    /** newsletter_section_items.item_key */
    item_key: string
    /** newsletter_section_items.name — es lo que se muestra, nunca el key */
    name: string
    expected: number | null
    pending: number | null
    posts: number
    with_image: number
    with_video: number
}

export interface ISectionCoverage {
    /** newsletter_sections.section_key */
    section_key: string
    name: string
    newsletter: NewsletterCode
    cadence: SectionCadence
    /** Hora del cron para las diarias (HH:mm) */
    scheduled_at: string | null
    /** Artefactos que la sección genera: hay secciones solo-imagen (early) */
    artifacts: PostArtifact[]
    /** MAX(posts.updated_at) de la sección en el periodo — "última publicación registrada" */
    last_activity_at: string | null
    /** Del snapshot; null mientras el endpoint no exista */
    expected: number | null
    pending: number | null
    /** En vivo */
    posts: number
    with_image: number
    with_video: number
    notified: number
    subsections: ICoverageSubsection[]
}

export interface IPostsCoverageResponse {
    /** Periodo consultado (YYYY-MM) — mes de `newsletter_date`, es decir el mes del dato */
    period: string
    /** Marca de tiempo del snapshot que alimenta expected/pending */
    snapshot_at: string | null
    /**
     * Mes al que apuntan los jobs mensuales ahora mismo (siempre el anterior).
     * Publicar desde otro periodo no cambia nada: reportDate() lo calcula solo.
     */
    current_target_period: string
    sections: ISectionCoverage[]
}

/* ─── Matriz de cobertura por cliente ─── */

/** `not_included` = el plan del cliente no da derecho a esa sección; no cuenta como hueco. */
export type CoverageCellState = 'full' | 'partial' | 'empty' | 'not_included'

export interface ICoverageColumn {
    section_key: string
    name: string
    newsletter: NewsletterCode | null
    /** Las secciones de solo imagen (tempraneras) no exigen video para estar completas */
    requires_video: boolean
}

export interface IClientCoverageRow {
    client_id: string
    client_name: string
    client_account: string | null
    plan_name: string | null
    /** Estado por section_key */
    cells: Record<string, CoverageCellState>
    /** Celdas que no están completas, excluyendo las que no incluye su plan */
    gaps: number
}

export interface IClientCoverageResponse {
    period: string
    /** Secciones que forman las columnas, en orden */
    columns: ICoverageColumn[]
    items: IClientCoverageRow[]
    total_items: number
    per_page: number
    current_page: number
    last_page: number
}

/* ─── Ejecuciones de render (requiere tabla post_render_runs) ─── */

export type RunStatus = 'queued' | 'running' | 'completed' | 'partial' | 'failed'

export interface IPostRenderRun {
    id: string
    section_key: string
    section_name: string
    sub_section: string | null
    artifact: PostArtifact
    total_jobs: number
    processed_jobs: number
    succeeded_jobs: number
    failed_jobs: number
    status: RunStatus
    trigger_source: 'manual' | 'cron'
    triggered_by: string | null
    started_at: string
    finished_at: string | null
    error_summary: string | null
}

/* ─── Payload del endpoint de publicación (ya existe en la API) ─── */

export interface IPublishPostsPayload {
    month: number
    artifacts: PostArtifact[]
    section_keys: string[]
}
