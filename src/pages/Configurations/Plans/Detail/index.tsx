
import PageLoader from "@/components/generics/PageLoader";

import { API_ROUTES } from "@/constants/api";
import { IPlan } from "@/interfaces/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { replaceRecordIdInPath } from "@/utils";
import { useParams } from "react-router";
import FormPlan from "./Form";
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";

const PlanDetailPage = () => {
    const params = useParams<{ id: string }>()

    const { response: plan, loading } = useFetchQuery<IPlan>(replaceRecordIdInPath(API_ROUTES.PLANS.DETAIL, params.id || ''), {
        customQueryKey: queryKeys.detail(`plan`, params?.id || ''),
        enabled: !!params.id
    })

    return (
        <div>
            {
                loading ? (
                    <PageLoader />
                ) : (
                    <Card>
                        <CardHeader className="pb-0">
                            <CardTitle>{plan?.name}</CardTitle>
                            <CardDescription>{plan?.clients_count} Clientes asociados a este plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {plan && <FormPlan plan={plan} />}
                        </CardContent>
                    </Card>
                )
            }
        </div>
    )
}

export default PlanDetailPage;