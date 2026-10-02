/**
 * Contrato de cobertura de publicaciones.
 * Mezcla dos orígenes (ver plan de backend):
 *  - snapshot  → expected / pending (caro: dry-run de fetchData por sección×subsección×artefacto)
 *  - en vivo   → posts / with_image / with_video / notified (GROUP BY sobre posts + files)
 */

export type PostArtifact = 'image' | 'image_square' | 'video'

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
    /** Subsección de un carril en vivo (`live-*`, `welcome`): no tiene job de cierre ni pendientes */
    is_live?: boolean
    /** Motivo si está apagada a propósito (o lo está su sección); null si no */
    paused?: string | null
    formats?: Partial<Record<PostArtifact, IItemFormatCoverage>>
}

/** Un formato de una subsección. `pending`/`has_template` son null sin snapshot. */
export interface IItemFormatCoverage {
    /** Publicaciones del cierre con ese archivo */
    done: number
    /** Publicaciones de un carril en vivo con ese archivo */
    live: number
    pending: number | null
    has_template: boolean | null
}

/** Un formato de toda la sección. */
export interface ISectionFormatCoverage {
    done: number
    live: number
    /** Lo que falta, sin lo apagado a propósito; null sin snapshot */
    pending: number | null
    /** Lo que falta de subsecciones apagadas a propósito: no cuenta como faltante */
    paused_pending: number
    /** Lo que falta y NO tiene plantilla del mes: generar no lo produciría */
    missing_template_pending: number
    templates_ready: number
    templates_total: number
}

export interface IPostPause {
    section_key: string
    /** null = toda la sección */
    sub_section: string | null
    reason: string
    by: string | null
    at: string
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
    /** Publicaciones de un carril en vivo en el periodo (Círculo Rosa, Estrellas, Nuevos Inicios, Cuadro de Honor) */
    live_posts?: number
    /** Motivo si toda la sección está apagada a propósito */
    paused?: string | null
    formats?: Partial<Record<PostArtifact, ISectionFormatCoverage>>
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
    /** Último avance: una corrida «en curso» que no se mueve en horas está atorada */
    updated_at?: string | null
}

/* ─── Payload del endpoint de publicación (ya existe en la API) ─── */

export interface IPublishPostsPayload {
    month: number
    artifacts: PostArtifact[]
    section_keys: string[]
}
