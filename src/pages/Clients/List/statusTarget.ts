import { IClient } from '@/interfaces/clients'

/** Lo que el diálogo de activar/desactivar necesita de la clienta, venga del padrón «Estado» o de la «Tabla de trabajo» */
export interface StatusTarget {
    id: string
    name: string
    active: boolean
    /** Paga con tarjeta automática: desactivarla aquí NO cancela su cobro en Stripe */
    paysByCard: boolean
}

export const statusTarget = (client: IClient & { card_subscription?: boolean }): StatusTarget => ({
    id: client.id,
    name: client.name,
    active: client.user?.active !== false,
    paysByCard: !!client.card_subscription,
})
