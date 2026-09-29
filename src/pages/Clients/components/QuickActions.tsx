import { useState } from "react"

import { IClient } from "@/interfaces/clients"
import { Label } from "@/uishadcn/ui/label"
import { Switch } from "@/uishadcn/ui/switch"
import StatusDialog from "../List/StatusDialog"
import { statusTarget } from "../List/statusTarget"
import useClientActions from "../hooks/useClientActions"

interface QuickActionsClientProps {
    client: IClient;
}

/**
 * El interruptor de la «Tabla de trabajo». No cambia el estado al instante: abre el MISMO diálogo que el
 * padrón «Estado», que dice qué le pasa a la clienta y lo que debe. Sin él, aquí se reactivaba a una baja
 * sin saber que le volvía a aparecer su deuda. El diálogo sólo se monta al pedirlo: son cien filas.
 */
const QuickActionsClient = ({ client }: QuickActionsClientProps) => {
    const { handleUpdateList } = useClientActions()
    const [confirming, setConfirming] = useState(false)

    return (
        <div className="flex items-center space-x-2">
            <Switch
                checked={client.user?.active}
                id={`client-status-${client.id}`}
                onCheckedChange={() => setConfirming(true)}
            />
            <Label htmlFor={`client-status-${client.id}`} className="text-xs">
                {!client.user?.active ? 'Activar' : 'Desactivar'}
            </Label>
            {confirming && (
                <StatusDialog
                    target={statusTarget(client)}
                    onClose={() => setConfirming(false)}
                    onChanged={active => handleUpdateList({ id: client.id, user: { active } } as Partial<IClient>)}
                />
            )}
        </div>
    )
}

export default QuickActionsClient
