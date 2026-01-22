import { Label } from "@/uishadcn/ui/label";
import { Switch } from "@/uishadcn/ui/switch";

const QuickActionsClient = () => {
    return (
        <div className="flex items-center space-x-2">
            <Switch checked={false} id='client-status' onCheckedChange={(e) => console.log({ onNotifications: e })} />
            <Label htmlFor="client-status" className="text-xs">Mostrar en boletín</Label>
        </div>
    )
}

export default QuickActionsClient