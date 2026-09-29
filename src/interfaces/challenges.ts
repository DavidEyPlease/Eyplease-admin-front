/** Retos a la unidad de las Directoras (admin/challenges). */

export type ChallengeType = 'unit_points' | 'unit_hearts' | 'unit_reactivation'

/**
 * En qué va la base de las piezas de ganadora:
 *  - sin_base: nadie la ha pedido.
 *  - esperando: el equipo la va a hacer o a subir.
 *  - pedida: hay un pedido de diseño en curso.
 *  - por_medir: llegó una base y falta medirla (si ya había una lista, ésa sigue trabajando).
 *  - lista: medida y registrada; cada ganadora sale sola.
 */
export type TemplateState = 'sin_base' | 'esperando' | 'pedida' | 'por_medir' | 'lista'

export interface ChallengeProgress {
    current: number
    goal: number
    measure: string
    done: boolean
    detail: string | null
    data_missing: boolean
}

export interface ChallengeClient {
    id: string
    name: string
    username: string
    network_person_id: string | null
    country_code: string | null
}

export interface ChallengeListItem {
    id: string
    type: ChallengeType
    title: string
    prize: string | null
    period: string
    ends_on: string
    progress: ChallengeProgress | null
    is_open: boolean | null
    client: ChallengeClient
    template_state: TemplateState
    celebrated_count: number
    published_count: number
}

/** Dónde va cada cosa, en píxeles de la base (lo que lee llenar_ganadora.py). */
export interface TextStyle {
    fuente?: FontKey
    peso?: number
    sx?: number
    grad: Array<[number, number, number]>
    sombra?: [number, number, number, number, [number, number, number]] | null
    relieve?: boolean
    brillo?: boolean
}

export interface NameLayout extends TextStyle {
    cx: number
    /** Línea base del renglón de abajo */
    base2: number
    /** Alto de las mayúsculas */
    cap: number
    interlinea?: number
    ancho_max: number
    /** 'auto': uno si cabe holgado, si no dos · 2: siempre dos · 3: tres si en dos se achica de más · 1: uno */
    renglones?: 'auto' | 1 | 2 | 3
    /** Achicar lo que haga falta para no pasarse de `ancho_max` (sin él, se detiene en `min_escala`) */
    estricto?: boolean
    /** El interlineado se achica con la letra */
    interlinea_escala?: boolean
    /** Con `renglones: 3`: van tres si en dos la letra quedaría más chica que esto (0.8) */
    tres_si?: number
    interlinea3?: number
    /** Hasta dónde se achica la letra (0.7) */
    min_escala?: number
}

export interface ValueLayout extends TextStyle {
    cx: number
    base: number
    alto: number
    ancho_max: number
}

/** Un renglón suelto: el nombre de la Directora en los cumpleaños («Tu Directora» ya viene en la base). */
export interface FirmaLayout extends TextStyle {
    cx: number
    /** Línea base del renglón */
    base: number
    /** Alto de las mayúsculas; si el nombre no cabe en `ancho_max`, se achica */
    cap: number
    ancho_max: number
}

/** El círculo de las fotos que cortan la cabeza (y del avatar, si la base lo pide): colores y, si no, junto a la cara */
export interface CircleLayout {
    filo?: [number, number, number]
    aro?: [number, number, number]
    sombra?: [number, number, number]
    diametro?: number
    cx?: number
    cy?: number
}

export interface Acomodo {
    cara: { cx: number, cy: number, ancho: number }
    /** Las fotos que cortan la cabeza van en un círculo: su aro puede llevar un filo de color */
    circulo?: CircleLayout | null
    velo?: [number, number] | null
    min_cara?: number
    nombre: NameLayout
    valor?: ValueLayout | null
    firma?: FirmaLayout | null
    /** Sin foto que sirva: el avatar en el círculo (sobre un fondo liso) en vez de suelto */
    avatar?: 'circulo'
    avatar_fondo?: [number, number, number]
}

export type FontKey = 'playfair' | 'playfair-italica' | 'poppins' | 'lora' | 'inter'

export interface ChallengeRow {
    id: string
    name: string
    photo?: { has_photo?: boolean, url?: string | null } | null
    current: number
    goal: number
    done: boolean
    awarded?: boolean
    returned_on?: string
    piece?: { url?: string | null, uri?: string | null, status?: string | null, status_name?: string | null } | null
}

export interface CelebratedEntry {
    person_id: string
    post_id?: string
    task_id?: string
    via?: string
    photo?: 'propia' | 'circulo' | 'avatar' | null
    avatar_reason?: string | null
    at?: string
    filled_at?: string
}

export interface ChallengeDetail {
    id: string
    scope: string
    type: ChallengeType
    title: string
    description: string | null
    target: number
    prize: string | null
    period: string
    starts_on: string
    ends_on: string
    is_open: boolean
    progress: ChallengeProgress
    piece: { url?: string | null, status?: string | null, status_name?: string | null } | null
    rows: ChallengeRow[]
    client: ChallengeClient
    kit_task: { id: string, title: string } | null
    template: {
        state: TemplateState
        has_value: boolean
        base: { uri: string, url: string | null } | null
        acomodo: Acomodo | null
        registered_at: string | null
        candidate: { uri: string, url: string | null, task_id?: string, at?: string } | null
        base_task: { id: string, title: string, status: string | null, status_name: string | null } | null
    }
    celebrated: CelebratedEntry[]
}

export interface PreviewResult {
    uri: string
    url: string
    fill: { foto?: 'propia' | 'circulo' | 'avatar', motivo?: string, escala?: number, lineas?: string[], recorte?: string | null }
}

export interface CelebrateResult {
    dry_run: boolean
    winners: Array<{ challenge: string, person: string, task_id: string | null }>
}
