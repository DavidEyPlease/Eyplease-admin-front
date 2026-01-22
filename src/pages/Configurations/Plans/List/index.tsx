import PageLoader from "@/components/generics/PageLoader";
import { API_ROUTES } from "@/constants/api";
import { IPlan } from "@/interfaces/plans";
import PlanItem from "./PlanItem";
import TableContainer from "@/components/generics/TableContainer";
import { LIST_TABLE_COLUMNS } from "./page-utils";
import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";

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