import Link from "@/components/common/Link";
import Avatar from "@/components/generics/Avatar";
import Chip from "@/components/generics/Chip";
import { APP_ROUTES } from "@/constants/app";
import { INetworkPerson } from "@/interfaces/vendors";
import { TableCell, TableRow } from "@/uishadcn/ui/table";
import { replaceRecordIdInPath } from "@/utils";

interface Props {
    person: INetworkPerson
}

const VendorItem = ({ person }: Props) => {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-x-2">
                    <Avatar src={person.photo?.url} alt={person.name} />
                    <div className="flex flex-col">
                        {person.isClient ? (
                            <Link
                                to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, person.id)}
                                className="font-semibold"
                                text={`${person.name} - ${person.account}`}
                            />
                        ) : (
                            <p>{person.name} - {person.account}</p>
                        )}
                        <small className="text-muted-foreground">{person.rank}</small>
                    </div>
                    {!!person.isClientActive && (
                        <Chip label='Cliente Activo' colorClass='bg-emerald-500' />
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

export default VendorItem;