import PageLoader from "@/components/generics/PageLoader";
import { API_ROUTES } from "@/constants/api";
import { IPlan } from "@/interfaces/plans";
import PlanItem from "./PlanItem";
import TableContainer from "@/components/generics/TableContainer";
import { LIST_TABLE_COLUMNS } from "./page-utils";
import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";
import PageHead from "@/layouts/TopShell/PageHead"

const PlansPage = () => {
    const {
        response: plans,
        isLoading,
    } = useListQuery<IPlan[]>({
        endpoint: API_ROUTES.PLANS.LIST,
        customQueryKey: (params) => queryKeys.list('config/plans', params)
    })

    return (
        <div className="grid pt-2 gap-y-2">
            <PageHead eyebrow="Configuración" title={<>Planes y <em>precios</em></>} sub="Qué trae cada plan y cuánto cuesta. Cambiar un plan cambia lo que ven sus clientas." />
            {
                isLoading ? (
                    <PageLoader />
                ) : (
                    <TableContainer
                        columns={LIST_TABLE_COLUMNS}
                    >
                        {(plans || []).map(item => (
                            <PlanItem plan={item} />
                        ))}
                    </TableContainer>
                )
            }
        </div>
    )
}

export default PlansPage;