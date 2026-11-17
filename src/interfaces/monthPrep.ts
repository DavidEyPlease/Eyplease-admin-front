import { PostArtifact } from './posts'

/** Preparar el mes: lo que tiene que estar listo antes de que empiece el mes que viene (GET /month-prep). */
export type PrepState = 'ready' | 'partial' | 'missing' | 'skipped'

/** Un formato de un diseño: ya está, falta, o esa pieza no lo lleva */
export type PrepFormatState = 'ready' | 'missing' | 'off'

export interface PrepPart {
    key: string
    label: string
    ready: boolean
    /** Diseños de piezas: si es del cierre del mes en curso (sale los primeros días del que viene) */
    closing?: boolean
    /** «Cierre de noviembre» / «De diciembre» */
    moment?: string
    /** El mes de la plantilla (el `month` que se elige al subirla) */
    month?: number
    scope?: 'mx' | 'col' | 'area' | string
    scope_label?: string | null
    formats?: Record<PostArtifact, PrepFormatState>
    section?: string
    sub_section?: string | null
}

export interface PrepMark {
    state: 'done' | 'skip'
    note: string | null
    by: string | null
    at: string
}

export interface PrepItem {
    key: string
    /** Sólo en los pendientes propios */
    id?: string
    title: string
    detail: string
    when?: string
    state: PrepState
    /** Lo que dice el sistema sin la marca a mano */
    auto_state: PrepState | null
    source: 'auto' | 'manual' | 'custom'
    /** Si se puede palomear a mano (los diseños de piezas no: se palomean solos) */
    can_mark_done: boolean
    mark: PrepMark | null
    section_keys?: string[]
    parts: PrepPart[]
}

export interface PrepGroup {
    key: 'posts' | 'newsletter' | 'content' | 'custom' | string
    title: string
    subtitle: string | null
    items: PrepItem[]
}

/** Lo que le falta al mes EN CURSO (los dos meses anteriores sí lo tuvieron) */
export interface PrepGap {
    title: string
    label: string
    moment: string
    scope_label: string | null
    formats: Record<PostArtifact, PrepFormatState>
}

export interface MonthPrepResponse {
    period: string
    label: string
    current_label: string
    days_left: number
    computed_at: string
    groups: PrepGroup[]
    current_gaps: PrepGap[]
    summary: { total: number, ready: number, partial: number, missing: number, skipped: number }
}
