import dayjs from "dayjs"
import { API_ROUTES } from "@/constants/api"
import useListQuery from "@/hooks/useListQuery"
import { ReportUpload } from "@/interfaces/reportUpload"
import { queryKeys } from "@/utils/queryKeys"
import DateTimePicker from "@/components/common/Inputs/DateTimePicker"
import { DataTable } from "@/components/generics/DataTable"
import { columns } from "./table-columns"
import Dropdown from "@/components/common/Inputs/Dropdown"
import useAuthStore from "@/store/auth"
import { PaginationResponse } from "@/interfaces/common"
import UIPagination from "@/components/generics/Pagination"
import ApiAutocomplete from "@/components/generics/ApiAutocomplete"
import { UtilsService } from "@/services/utils.service"

const CURRENT_MONTH = dayjs().format('MM')

type ReportFilters = { created_at_month: string, status: string, newsletter_id: string, user_id: string }

const NewsletterReportListPage = () => {
    const { utilData } = useAuthStore(state => state)

    const {
        isLoading,
        filters,
        perPage,
        page,
        onChangePage,
        setPerPage,
        onApplyFilters,
        response,
    } = useListQuery<PaginationResponse<ReportUpload>, ReportFilters>({
        endpoint: API_ROUTES.REPORTS.GET_UPLOADS,
        defaultPerPage: 10,
        defaultFilters: { created_at_month: CURRENT_MONTH, status: '', newsletter_id: '', user_id: '' },
        customQueryKey: (params) => queryKeys.list(`reports/get-uploads-list`, params)
    })

    const newsletters = utilData.newsletters.map(n => ({
        label: n.name,
        value: n.id
    }))

    return (
        <div>
            <DataTable
                contentHeader={
                    <div className="mb-2">
                        <p className="font-bold text-xl mb-2">Reportes cargados</p>
                        <div className="flex gap-2 flex-wrap">
                            <DateTimePicker
                                withTime={false}
                                label="Fecha de carga"
                                buttonClassName="w-max"
                                onDateChange={e => console.log(e)}
                            />
                            <Dropdown
                                className="max-w-xs"
                                placeholder="Boletín"
                                value={filters.newsletter_id || ''}
                                onChange={e => onApplyFilters({ newsletter_id: e })}
                                items={newsletters}
                            />
                            <Dropdown
                                className="max-w-xs"
                                placeholder="Estado del reporte"
                                value={filters.status || ''}
                                onChange={e => onApplyFilters({ status: e })}
                                items={[
                                    { label: 'Cargado', value: 'completed' },
                                    { label: 'En proceso', value: 'processing' },
                                    { label: 'Error', value: 'failed' },
                                ]}
                            />
                            <ApiAutocomplete
                                placeholder="Buscar cliente..."
                                suggestionKeyValue="user_id"
                                suggestionKeyLabel="name"
                                value={filters.user_id || ''}
                                queryFn={(params) => UtilsService.getSuggestionItems(API_ROUTES.CLIENTS.BASIC_LIST, params)}
                                onChange={e => onApplyFilters({ user_id: e })}
                            />
                        </div>
                    </div>
                }
                columns={columns}
                isLoading={isLoading}
                data={response?.items || []}
            />
            <div className="mt-4">
                <UIPagination
                    totalPages={response?.last_page || 0}
                    perPage={perPage || 15}
                    page={page || 1}
                    onChangePage={onChangePage}
                    onChangePerPage={setPerPage}
                />
            </div>
        </div>
    )
}

export default NewsletterReportListPage