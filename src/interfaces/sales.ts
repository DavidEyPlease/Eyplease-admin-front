/** Ventas (fase 3/4 de la app): lo que las clientas piden desde la app y el equipo cierra por fuera. */

export interface SalesUser {
    id: string
    name: string
    email: string | null
    phone: string | null
    username: string | null
    /** El plan que tiene hoy: si ya es el que pedía, ya subió */
    plan_id?: string | null
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

export type SalesDealKind = 'win_back' | 'plan_trial' | 'promotion'

/** Un mes del trato: lo que se le cobra (o se le cobraría) y si ya lo pagó. */
export interface SalesDealMonth {
    /** YYYY-MM */
    period: string
    amount: number
    /** paid · pending · overdue · waived… (null = todavía no se le genera ese mes) */
    status: string | null
    paid_at: string | null
}

/**
 * Un trato que el equipo cerró por fuera de la app (`GET /sales/deals`): el regreso con meses gratis o la prueba de un
 * plan más alto. Sale de su perfil de cobro y se queda «en curso» hasta que paga su primer mes completo.
 */
export interface SalesDeal {
    id: string
    kind: SalesDealKind
    /** deal = en curso · done = ya pagó su primer mes completo · lost = se volvió a dar de baja */
    stage: 'deal' | 'done' | 'lost'
    started_at: string | null
    user: {
        id: string
        name: string
        username: string | null
        phone: string | null
        email: string | null
        active: boolean
        network_person: { name: string, consultant_code: string | null } | null
    }
    plan: { name: string, price: number } | null
    /** En la prueba de plan: el plan del que viene */
    previous_plan: string | null
    promotion: string
    /** YYYY-MM-DD: hasta cuándo le dura la promoción */
    promo_until: string | null
    payment_day: number | null
    /** El mes en curso y los dos siguientes */
    months: SalesDealMonth[]
    /** El primer mes que ya paga completo */
    first_full: SalesDealMonth
    next_due: (SalesDealMonth & { due_on: string }) | null
    /** Lo que entra de más al mes cuando termina la promoción */
    monthly: number
}

/**
 * «Invite a una Directora» (`GET /referrals`): una Directora recomendada por una clienta. Sólo cuenta si quedó
 * registrada antes de que la nueva entrara (su liga o anotada por el equipo). El premio: un mes del plan siguiente
 * pagando lo de su plan, en cuanto la recomendada paga su primer mes; luego regresa sola a su plan salvo que se quede.
 */
export interface Referral {
    id: string
    /** `area` = la invitó su Nacional desde «Mis Directoras» (29-oct-2026) */
    source: 'link' | 'team' | 'area'
    referred_name: string | null
    referred_email: string | null
    referred_phone: string | null
    registered_at: string
    joined_at: string | null
    first_paid_at: string | null
    first_paid_period: string | null
    reward_applied_at: string | null
    reward_until: string | null
    /** El premio de quien no tiene plan siguiente (la Nacional): lo que pagó la nueva, descontado en su siguiente cobro */
    reward_discount?: string | number | null
    reward_kept_at: string | null
    reward_reverted_at: string | null
    reward_note: string | null
    referrer: SalesUser & { plan?: { id: string, name: string, price?: number | null } | null } | null
    referred: { id: string, name: string, username: string | null, phone: string | null, email: string | null, active: boolean, plan?: { id: string, name: string } | null } | null
    previous_plan: { id: string, name: string } | null
    reward_plan: { id: string, name: string } | null
    created_by: { id: string, name: string } | null
}

/** `GET /referrals/link/{cuenta}`: la liga de una clienta para recomendar. */
export interface ReferralLink {
    account: string
    name: string
    code: string
    link: string
}
