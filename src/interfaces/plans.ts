import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    /** Llave fija del plan (free, free_consultant, standard, basic, executive, elite, national): con ella se
        filtran los avisos a clientas. Opcional porque un API sin actualizar no la manda. */
    plan_key?: string | null
    name: string
    price: number
    /** Moneda de `price`: la del país de la clienta cuando viene dentro de ella (Colombia, COP). Opcional
        porque una API sin actualizar no la manda; sin ella es MXN. */
    currency?: string
    features: string[]
    accesses: IPermission[]
    active: boolean
    free: boolean
    is_default: boolean
    color: string
    clients_count: number
    created_at: Date
}

export type PlanUpdate = {
    name: string
    price: number
    features: Array<{ label: string }>
    // accesses: IPermission[]
    active: boolean
    free: boolean
    is_default: boolean
    color?: string | null
    accesses: Array<{
        key: string
        nested_modules: Array<{
            key: string
            label: string
        }>
    }>
}