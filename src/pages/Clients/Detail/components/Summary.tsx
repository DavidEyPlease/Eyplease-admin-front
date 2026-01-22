import Avatar from "@/components/generics/Avatar";
import Chip from "@/components/generics/Chip";
import FieldValue from "@/components/generics/FieldValue";
import { IClient } from "@/interfaces/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { formatDate } from "@/utils/dates";
import Plan from "./Plan";

interface Props {
    client: IClient
}

const Summary = ({ client }: Props) => {
    return (
        <Card className="h-max">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                        <Avatar sizeClasses="w-14 h-14" src={client.photo?.url} alt={client.name} />
                        <CardTitle>{client.name}</CardTitle>
                    </div>
                    <Chip label={client.user?.active ? 'Activo' : 'Inactivo'} colorClass={client.user?.active ? 'bg-emerald-500' : 'bg-red-500'} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <FieldValue label="Registrado desde" value={formatDate(client.created_at)} />
                <FieldValue label="Ultima conexión" value={client.last_sign_in_at ? formatDate(client.last_sign_in_at) : 'No disponible'} />

                <FieldValue label="Cuenta" value={client.account} />
                <FieldValue label="País" value={client.country} />
                <FieldValue label="Email" value={client.user?.email} />
                <FieldValue label="Teléfono" value={client.user?.phone} />
                <FieldValue label="Registrado desde" value={client.from_signup} />

                {client.user?.plan && <Plan plan={client.user?.plan} />}
            </CardContent>
        </Card>
    )
}

export default Summary;