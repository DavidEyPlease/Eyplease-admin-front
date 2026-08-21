import { API_ROUTES } from "@/constants/api";
import { ClientFilterKeys, IClientListItem } from "@/interfaces/clients";
import { PaginationResponse } from "@/interfaces/common";
import ClientsMetrics from "./Metrics";
import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";
import UIPagination from "@/components/generics/Pagination";
import FiltersAndSearch from "@/components/generics/FiltersAndSearch";
import { CLIENTS_FILTER_ITEMS } from "./page-utils";
import useAuthStore from "@/store/auth";
import { FilterTypes } from "@/components/generics/FiltersAndSearch/types";
import Button from "@/components/common/Button";
import { BellIcon, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/constants/app";
import { useState } from "react";
import ClientsTableList from "./components/Table";
import FabButton from "@/components/generics/FabButton";
import SendPushNotificationModal from "./components/SendPushNotificationModal";

const ClientsListPage = () => {
    const navigate = useNavigate()

    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const { utilData } = useAuthStore(state => state)

    const {
        selectedFilters,
        response,
        isLoading,
        perPage,
        page,
        onChangePage,
        sortBy,
        sortOrder,
        onSortChange,
        setPerPage,
        setSearch,
        onApplyFilters,
        onSelectedFilter,
        cleanSelectedFilters,
    } = useListQuery<PaginationResponse<IClientListItem>>({
        endpoint: API_ROUTES.CLIENTS.LIST,
        defaultSortBy: 'previous_month_points',
        defaultSortOrder: 'desc',
        customQueryKey: (params) => queryKeys.list('clients/list', params)
    })

    const filterList = CLIENTS_FILTER_ITEMS.map(i => {
        if (i.id === 'plan' && i.type === FilterTypes.SELECT) {
            i.options = utilData.plans.map(plan => ({
                label: plan.name,
                value: plan.id
            }))
        }
        return i
    })

    return (
        <div className="grid grid-cols-[minmax(0,1fr)] pt-2 gap-y-4">
            <ClientsMetrics />
            <div className="flex items-center gap-x-2">
                <div className="flex-1">
                    <FiltersAndSearch
                        title="Filtros de clientes"
                        columns="1"
                        renderComponent="popover"
                        filters={filterList}
                        setSearch={setSearch}
                        activeFilters={selectedFilters}
                        onSelectFilter={(k, v) => onSelectedFilter(k as ClientFilterKeys, v)}
                        onApplyFilters={onApplyFilters}
                        resetFilters={cleanSelectedFilters}
                    />
                </div>
                <Button
                    rounded
                    text={
                        <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nuevo cliente
                        </>
                    }
                    onClick={() => navigate(APP_ROUTES.CLIENTS.CREATE)}
                />
            </div>
            <div className="space-y-4">
                <ClientsTableList
                    items={response?.items || []}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                />
                <UIPagination
                    totalPages={response?.last_page || 0}
                    perPage={perPage || 15}
                    pending={isLoading}
                    page={page || 1}
                    onChangePage={onChangePage}
                    onChangePerPage={setPerPage}
                />
            </div>
            <FabButton
                icon={<BellIcon className="h-5 w-5" />}
                onClick={() => setShowNotificationModal(true)}
            />
            <SendPushNotificationModal
                open={showNotificationModal}
                onOpenChange={setShowNotificationModal}
            />
        </div>
    )
}

export default ClientsListPage;