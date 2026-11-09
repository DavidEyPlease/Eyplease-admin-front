/** Entregas del mes (`GET /posts/deliveries`): el cierre, los carriles en vivo y las clientas por poner al corriente. */

export type DeliveryTone = 'ok' | 'plain' | 'warn' | 'bad'

export interface DeliveryStatus {
    code: 'done' | 'running' | 'none' | 'auto' | 'waiting' | 'ready' | 'late' | 'leftover' | 'no_design'
    tone: DeliveryTone
    label: string
    /** Piezas sin plantilla del mes (se avisa aparte aunque la entrega vaya bien) */
    no_design: number
    days?: number
}

export interface ClosingDelivery {
    key: string
    name: string
    mode: 'auto' | 'manual'
    when: string
    sections: string[]
    pieces: number
    clients: number
    /** Piezas por día (hora de México) */
    by_day: Record<string, number>
    /** Lanzamientos a mano para todas (no los de una sola clienta) */
    launches: Array<{ date: string, runs: number, jobs: number }>
    active_runs: number
    pending: number
    pending_no_design: number
    pending_paused: number
    ready_since: string | null
    snapshot_at: string | null
    status: DeliveryStatus
}

export interface ClosingReports {
    total: number
    ready_on: string | null
    sections: Array<{ key: string, name: string, done: number, expected: number }>
    missing: Array<{ client_id: string, account: string, name: string, reports: string[] }>
    status: { tone: DeliveryTone, label: string }
}

/** ran = corrió (con o sin piezas) · missing = no corrió · unknown = sin dato (antes de que los carriles dejaran registro vacío) · later = todavía no es su hora · off = no le toca ese día */
export type LaneState = 'ran' | 'missing' | 'unknown' | 'later' | 'off'

export interface LaneCell {
    state: LaneState
    pieces?: number
    failed?: number
    at?: string | null
}

export interface LiveLane {
    key: string
    time: string
    name: string
    note: string
    alert: boolean
    cells: Record<string, LaneCell>
}

export type ClientCheckKey = 'robot' | 'closing' | 'daily' | 'pieces' | 'library'

export interface ClientCheck {
    state: 'ok' | 'missing' | 'wait' | 'na'
    text: string
    tasks?: number[]
    closing?: number
    live?: number
}

export interface DeliveryClient {
    client_id: string
    account: string
    name: string
    plan: string
    country: string
    reasons: Array<{ code: 'new' | 'back' | 'promo' | 'reports', label: string, at: string | null }>
    since: string | null
    checks: Record<ClientCheckKey, ClientCheck>
    missing: ClientCheckKey[]
    ok: boolean
}

export interface DeliveryAlert {
    id: string
    tone: 'warn' | 'bad'
    block: 'closing' | 'live' | 'clients'
    title: string
    text: string
}

export interface DeliveriesResponse {
    period: string
    closing_of: string
    today: string
    generated_at: string
    days: string[]
    empty_runs_since: string
    reports: ClosingReports
    closing: ClosingDelivery[]
    live: LiveLane[]
    clients: DeliveryClient[]
    alerts: DeliveryAlert[]
}

export interface DeliveryAlertsResponse {
    generated_at: string
    alerts: DeliveryAlert[]
}
