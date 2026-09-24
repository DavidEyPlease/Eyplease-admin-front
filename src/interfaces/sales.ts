/** Ventas (fase 3/4 de la app): lo que las clientas piden desde la app y el equipo cierra por fuera. */

export interface SalesUser {
    id: string
    name: string
    email: string | null
    phone: string | null
    username: string | null
    network_person?: { id: string, name: string, consultant_code: string | null } | null
    plan?: { id: string, name: string } | null
}

export interface SalesPlan {
    id: string
    name: string
    price?: number | null
    color?: string | null
}

/** Una clienta que quiere subir de plan (`plan_interests`, una fila por clienta, plan y día). */
export interface PlanInterest {
    id: string
    user: SalesUser | null
    plan: SalesPlan | null
    current_plan: SalesPlan | null
    /** Cuántas veces hizo cada cosa: {"lock": 3, "sheet": 1, "request": 1} */
    signals: Record<string, number> | null
    last_feature: string | null
    requested_at: string | null
    contacted_at: string | null
    updated_at: string
}

export type PlanGiftKind = 'gift' | 'unit_package'

/** Una Directora que quiere regalar Eyplease+ a una consultora (`gift`) o un paquete para su unidad (`unit_package`). */
export interface PlanGift {
    id: string
    kind: PlanGiftKind
    quantity: number
    user: SalesUser | null
    person: { id: string, name: string, consultant_code: string | null } | null
    plan: SalesPlan | null
    requested_at: string
    contacted_at: string | null
    fulfilled_at: string | null
    contacted_by?: { id: string, name: string } | null
}

/** Una Directora invitada por su consultora desde la app (premio: 3 meses si entra con ese correo). */
export interface DirectorProspect {
    id: string
    director_name: string
    director_email: string | null
    director_account: string | null
    director_phone: string | null
    reward_months: number
    times_shared: number
    email_sent_at: string | null
    joined_at: string | null
    rewarded_at: string | null
    created_at: string
    invited_by: { id: string, name: string, username: string | null, phone: string | null } | null
    joined_user: { id: string, name: string, username: string | null } | null
}
