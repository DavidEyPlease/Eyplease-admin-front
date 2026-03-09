import { IClient } from "@/interfaces/clients"
import { Label } from "@/uishadcn/ui/label"
import { Switch } from "@/uishadcn/ui/switch"
import useClientActions from "../hooks/useClientActions"

interface QuickActionsClientProps {
    client: IClient;
}

const QuickActionsClient = ({ client }: QuickActionsClientProps) => {
    const { loading, onChangeStatus } = useClientActions()

    return (
        <div className="flex items-center space-x-2">
            <Switch
                checked={client.user?.active}
                disabled={loading}
                id={`client-status-${client.id}`}
                onCheckedChange={(checked) => onChangeStatus(client.id, checked)}
            />
            <Label htmlFor={`client-status-${client.id}`} className="text-xs">
                {!client.user?.active ? 'Activar' : 'Desactivar'}
            </Label>
        </div>
    )
}

export default QuickActionsClient