import { IconNotification } from "@/components/Svg/IconNotification";
import useAuth from "@/hooks/useAuth";
import { IAuthUser } from "@/interfaces/auth";
import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card";
import { Switch } from "@/uishadcn/ui/switch";

interface Props {
    user: IAuthUser
}

const Preferences = ({ user }: Props) => {
    const { updateUser } = useAuth()

    return (
        <Card>
            <CardHeader>
                <p className="font-semibold">Preferencias de usuario</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3">
                <div className="flex items-center p-4 space-x-4 border rounded-md">
                    <IconNotification />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Notificaciones
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Recibe notificaciones
                        </p>
                    </div>
                    <Switch checked={user.on_notifications} onCheckedChange={(e) => updateUser({ onNotifications: e })} />
                </div>
            </CardContent>
        </Card>
    )
}

export default Preferences;