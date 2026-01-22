
import { Card, CardContent } from "@/uishadcn/ui/card"

import { useNavigate, useParams } from "react-router";
import { APP_ROUTES } from "@/constants/app";
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";
import { IClient } from "@/interfaces/clients";
import { replaceRecordIdInPath } from "@/utils";
import { API_ROUTES } from "@/constants/api";
import PageLoader from "@/components/generics/PageLoader";

const EditClientPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    const { response, loading } = useFetchQuery<{ client: IClient }>(replaceRecordIdInPath(API_ROUTES.CLIENTS.DETAIL, id || ''), {
        customQueryKey: queryKeys.detail('client', id || ''),
        enabled: !!id,
    })

    const onCreateSuccess = (clientId: string) => {
        navigate(APP_ROUTES.CLIENTS.EDIT.replace(':id', clientId))
    }

    return (
        <Card>
            <CardContent className="grid gap-y-5">
                {loading && !response ? (
                    <PageLoader />
                ) : (
                    <p></p>
                )}
            </CardContent>
        </Card>
    )
}

export default EditClientPage;