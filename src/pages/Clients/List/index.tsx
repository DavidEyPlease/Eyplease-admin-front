import { API_ROUTES } from "@/constants/api";
import { ClientFilterKeys, IClient } from "@/interfaces/clients";
import { PaginationResponse } from "@/interfaces/common";
import PageLoader from "@/components/generics/PageLoader";
import ClientsMetrics from "./Metrics";
import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";
import { ClientCard } from "./components/ClientCard";
import UIPagination from "@/components/generics/Pagination";
import FadeInGrid from "@/components/generics/FadeInGrid";
import FiltersAndSearch from "@/components/generics/FiltersAndSearch";
import { CLIENTS_FILTER_ITEMS } from "./page-utils";
import useAuthStore from "@/store/auth";
import { FilterTypes } from "@/components/generics/FiltersAndSearch/types";
import Button from "@/components/common/Button";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/constants/app";

const ClientsListPage = () => {
    const navigate = useNavigate()
    const { utilData } = useAuthStore(state => state)

    const {
        selectedFilters,
        response,
        isLoading,
        perPage,
        page,
        onChangePage,
        setPerPage,
        setSearch,
        onApplyFilters,
        onSelectedFilter,
        cleanSelectedFilters
    } = useListQuery<PaginationResponse<IClient>>({
        endpoint: API_ROUTES.CLIENTS.LIST,
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
        <div className="grid pt-2 gap-y-4">
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
            {
                isLoading ? (
                    <PageLoader />
                ) : (
                    <div className="space-y-4">
                        <FadeInGrid gridClassName="md:grid-cols-2 lg:grid-cols-3">
                            {
                                (response?.items || []).map(item => (
                                    <ClientCard key={item.id} client={item} />
                                ))
                            }
                        </FadeInGrid>
                        <UIPagination
                            totalPages={response?.last_page || 0}
                            perPage={perPage || 15}
                            page={page || 1}
                            onChangePage={onChangePage}
                            onChangePerPage={setPerPage}
                        />
                    </div>
                )
            }
        </div>
    )
}

export default ClientsListPage;