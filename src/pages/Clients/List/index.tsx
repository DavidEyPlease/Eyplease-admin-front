import { API_ROUTES } from "@/constants/api";
import { ClientFilterKeys, IClientListItem } from "@/interfaces/clients";
import { PaginationResponse } from "@/interfaces/common";
import PageLoader from "@/components/generics/PageLoader";
import ClientsMetrics from "./Metrics";
import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";
import UIPagination from "@/components/generics/Pagination";
import FiltersAndSearch from "@/components/generics/FiltersAndSearch";
import { CLIENTS_FILTER_ITEMS } from "./page-utils";
import useAuthStore from "@/store/auth";
import { FilterTypes } from "@/components/generics/FiltersAndSearch/types";
import Button from "@/components/common/Button";
import { GridIcon, PlusIcon, TableIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/constants/app";
import ClientsGridList from "./components/GridList";
import { useHeaderActions } from "@/providers/HeaderActionsProvider";
import { useEffect, useState } from "react";
import DynamicTabs from "@/components/generics/DynamicTabs";
import ClientsTableList from "./components/Table";

const ClientsListPage = () => {
    const navigate = useNavigate()

    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
    const { utilData } = useAuthStore(state => state)
    const { setHeaderActions } = useHeaderActions();

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
        cleanSelectedFilters,
    } = useListQuery<PaginationResponse<IClientListItem>>({
        endpoint: API_ROUTES.CLIENTS.LIST,
        customQueryKey: (params) => queryKeys.list('clients/list', params)
    })

    useEffect(() => {
        setHeaderActions(
            <DynamicTabs
                value={viewMode}
                onValueChange={e => setViewMode(e as 'grid' | 'table')}
                items={[
                    { label: 'Tarjetas', value: 'grid', icon: <GridIcon /> },
                    { label: 'Tabla', value: 'table', icon: <TableIcon /> },
                ]}
            />
        )
    }, [])

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
            {
                isLoading ? (
                    <PageLoader />
                ) : (
                    <div className="space-y-4">
                        {viewMode === 'table' ? (
                            <ClientsTableList items={response?.items || []} />
                        ) : (
                            <ClientsGridList items={response?.items || []} />
                        )}
                        <UIPagination
                            totalPages={response?.last_page || 0}
                            perPage={perPage || 15}
                            pending={isLoading}
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