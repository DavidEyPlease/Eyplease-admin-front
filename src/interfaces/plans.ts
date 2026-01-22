import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    name: string
    price: number
    features: string[]
    accesses: IPermission[]
    active: boolean
    free: boolean
    is_default: boolean
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
    accesses: Array<{
        key: string
        nested_modules: Array<{
            key: string
            label: string
        }>
    }>
}