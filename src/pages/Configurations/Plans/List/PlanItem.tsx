import Link from "@/components/common/Link";
import Chip from "@/components/generics/Chip";
import { APP_ROUTES } from "@/constants/app";
import { IPlan } from "@/interfaces/plans";
import { TableCell, TableRow } from "@/uishadcn/ui/table";
import { booleanToText, formatCurrency, replaceRecordIdInPath } from "@/utils";
import { formatDate } from "@/utils/dates";

interface Props {
    plan: IPlan
}

const PlanItem = ({ plan }: Props) => {
    return (
        <TableRow>
            <TableCell>
                {formatDate(plan.created_at)}
            </TableCell>
            <TableCell>
                <Link to={replaceRecordIdInPath(APP_ROUTES.CONFIGURATIONS.PLAN_DETAIL, plan.id)} className="font-semibold" text={plan.name} />
            </TableCell>
            <TableCell>
                {formatCurrency(plan.price)}
            </TableCell>
            <TableCell>
                <Chip label={plan.active ? 'Activo' : 'Inactivo'} colorClass={plan.active ? 'bg-emerald-500' : 'bg-red-500'} />
            </TableCell>
            <TableCell>
                {booleanToText(plan.free)}
            </TableCell>
            <TableCell>
                {booleanToText(plan.is_default)}
            </TableCell>
        </TableRow>
    )
}

export default PlanItem;