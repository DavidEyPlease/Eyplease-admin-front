/** Novedades del día de toda la cartera: /admin/live-news. */

/** Campos comunes a las tres novedades. */
interface LiveNewsItem {
    sponsored_id: string
    sponsor_id: string | null
    /** Consultora a la que le pasó algo. */
    name: string | null
    consultant_code: string | null
    photo: string | null
    /** Directora dueña de la red — a quién le corresponde la pieza. */
    sponsor_name: string | null
}

export type StarLevel = "sapphire" | "ruby" | "diamond" | "emerald" | "pearl"

/** Cruzó un nivel de estrella entre la foto de ayer y la de hoy. */
export interface StarLevelUp extends LiveNewsItem {
    star: StarLevel
    /** Null cuando no tenía ninguna: subió desde cero, no desde un nivel. */
    previous_star: StarLevel | null
    /** Puntos del trimestre. */
    points: number
    /** Cuánto subió respecto de la foto anterior. */
    gained: number
}

/** Está a tiro del nivel que persigue — el empujón, no la felicitación. */
export interface StarClose extends LiveNewsItem {
    star: StarLevel
    points: number
    points_needed: number
}

/** Entró a la red en los últimos días. */
export interface NewBeginning extends LiveNewsItem {
    start_date: string
}

export interface LiveNews {
    /** Día al que corresponden las novedades (Y-m-d). */
    date: string
    star_level_up: StarLevelUp[]
    star_close: StarClose[]
    new_beginning: NewBeginning[]
    totals: {
        star_level_up: number
        star_close: number
        new_beginning: number
    }
}

/** Los nombres que usa el negocio, no los del código. */
export const STAR_LABEL: Record<StarLevel, string> = {
    sapphire: "Zafiro",
    ruby: "Rubí",
    diamond: "Diamante",
    emerald: "Esmeralda",
    pearl: "Perla",
}
