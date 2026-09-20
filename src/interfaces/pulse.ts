/** Lo que el Inicio nuevo le pide a /admin/pulse: el calendario de carriles y las piezas de hoy. */

export type LaneKind = 'robot' | 'reports' | 'publishing' | 'live'

export interface PulseLane {
    /** "HH:mm", hora de México */
    time: string
    /** Clave del carril tal como la registran las corridas (`early`, `live_stars`, `birthdays`…) */
    key: string
    label: string
    hint: string
    kind: LaneKind
    /** Secciones de publicación cuyas piezas nacen en este carril */
    sections: string[]
}

export interface PulsePieces {
    section_key: string
    section_name: string
    /** Nacieron de un carril en vivo (no del lote del cierre) */
    live: boolean
    posts: number
    clients: number
    last_at: string | null
    thumbs: string[]
}

export interface AdminPulse {
    date: string
    schedule: PulseLane[]
    pieces: PulsePieces[]
}
