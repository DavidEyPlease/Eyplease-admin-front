import Link from "@/components/common/Link";
import Avatar from "@/components/generics/Avatar";
import { APP_ROUTES } from "@/constants/app";
import { IClient } from "@/interfaces/clients";
import { replaceRecordIdInPath } from "@/utils";

interface Props {
    client: IClient
}

const ClientAvatar = ({ client }: Props) => {
    return (
        <div className="flex items-center gap-x-2">
            <Avatar src={client.photo?.url} alt={client.name} />
            <div>
                <Link to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, client.id)} text={client.name} />
                <p className="text-xs text-gray-500">{client.account}</p>
            </div>
        </div>
    )
}

export default ClientAvatar;