import { API_ROUTES } from "@/constants/api"
import useListQuery from "@/hooks/useListQuery"
import { queryKeys } from "@/utils/queryKeys"
import { PaginationResponse } from "@/interfaces/common"
import UIPagination from "@/components/generics/Pagination"
import FieldValue from "@/components/generics/FieldValue"
import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card"
import Link from "@/components/common/Link"
import { replaceRecordIdInPath } from "@/utils"
import { APP_ROUTES } from "@/constants/app"
import FadeInGrid from "@/components/generics/FadeInGrid"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/uishadcn/ui/accordion"
import SearchInput from "@/components/generics/SearchInput"
import PageLoader from "@/components/generics/PageLoader"

interface PendingUploadItem {
    id: string
    network_person_id: string
    name: string
    account: string
    missing_reports_count: number,
    missing_reports: {
        newsletter_name: string
        newsletter_key: string
        section_key: string
        section_name: string
        current_status: string
    }[]
}

const PendingUploadReports = () => {

    const {
        isLoading,
        perPage,
        page,
        setSearch,
        onChangePage,
        setPerPage,
        response,
    } = useListQuery<PaginationResponse<PendingUploadItem>>({
        endpoint: API_ROUTES.REPORTS.PENDING_UPLOADS,
        defaultPerPage: 25,
        customQueryKey: (params) => queryKeys.list(`reports/pending-upload-list`, params)
    })

    return (
        <div className="space-y-4">
            <SearchInput
                placeholder="Buscar clientes"
                onSubmitSearch={setSearch}
            />
            {
                isLoading ? (
                    <PageLoader />
                ) : (
                    <>
                        <FadeInGrid gridClassName="md:grid-cols-2 lg:grid-cols-3">
                            {(response?.items || []).map(item => (
                                <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
                                    <CardHeader className="pb-4 pt-3">
                                        <div>
                                            <Link to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, item.network_person_id)} text={item.name} />
                                            <p className="text-xs text-gray-500">Cuenta: {item.account}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">

                                            <FieldValue
                                                label='Pendientes de carga'
                                                value={item.missing_reports_count.toString()}
                                            />

                                            <Accordion
                                                type="single"
                                                collapsible
                                                className="max-w-lg rounded-lg border"
                                                defaultValue=""
                                            >
                                                <AccordionItem
                                                    value='missing_reports'
                                                    className="border-b px-4 last:border-b-0"
                                                >
                                                    <AccordionTrigger className="py-2">Ver reportes pendientes</AccordionTrigger>
                                                    <AccordionContent className="space-y-2">
                                                        {item.missing_reports.map(r => (
                                                            <FieldValue
                                                                label={r.newsletter_name}
                                                                value={r.section_name}
                                                            />
                                                        ))}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>
                                    </CardContent>
                                </Card >
                            ))}
                        </FadeInGrid>
                        <div className="mt-4">
                            <UIPagination
                                totalPages={response?.last_page || 0}
                                perPage={perPage || 15}
                                page={page || 1}
                                onChangePage={onChangePage}
                                onChangePerPage={setPerPage}
                            />
                        </div>
                    </>
                )}

        </div>
    )
}

export default PendingUploadReports