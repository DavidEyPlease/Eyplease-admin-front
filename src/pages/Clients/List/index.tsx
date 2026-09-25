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
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import StatusBoard from "./StatusBoard"
import { cn } from "@/lib/utils"
import useCountryStore from "@/store/country"
import { countryInfo } from "@/constants/countries"

const ClientsListPage = () => {
    const navigate = useNavigate()

    const [showNotificationModal, setShowNotificationModal] = useState(false)
    /* Con el marco nuevo el padrón abre en «una fila, todo su estado»; la tabla de siempre (la que
       edita login, contraseña, logotipo y promoción en sitio) queda a un clic, entera. */
    const newShell = isNewShell()
    const [view, setView] = useState<'board' | 'table'>(newShell ? 'board' : 'table')
    const { utilData } = useAuthStore(state => state)
    /* Sólo las clientas del país que se mira arriba: sus cuentas, su moneda y sus programas no se mezclan */
    const country = useCountryStore(state => state.country)

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
        customQueryKey: (params) => queryKeys.list('clients/list', params),
        extraParams: { country },
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
            <PageHead eyebrow={`Clientas · ${countryInfo(country).label}`} title={<>Todas las clientas · <em>una fila, todo su estado</em></>} sub="Plan, pago, reportes del mes, puntos y acceso sin salir de la lista. Entra a una para verla a fondo.">
                <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                    {([['board', 'Estado'], ['table', 'Tabla de trabajo']] as const).map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setView(key)} className={cn('h-8 cursor-pointer rounded-[9px] px-3.5 text-[12.5px] font-bold transition-colors', view === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
                    ))}
                </div>
                {/* Mandar un aviso a las clientas vivía en un botón flotante: en el marco nuevo quedaba
                    encima de la tabla, tapaba el «Abrir» de las filas y se apilaba con el Copiloto */}
                <Button rounded variant="outline" text={<><BellIcon className="w-4 h-4 mr-2" />Enviar aviso</>} onClick={() => setShowNotificationModal(true)} />
                <Button rounded text={<><PlusIcon className="w-4 h-4 mr-2" />Nueva clienta</>} onClick={() => navigate(APP_ROUTES.CLIENTS.CREATE)} />
            </PageHead>
            {view === 'board' && <StatusBoard />}
            {view === 'table' && <>
            {!newShell && <ClientsMetrics />}
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
                {/* Con el marco nuevo el botón ya está en el encabezado */}
                {!newShell && <Button
                    rounded
                    text={
                        <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nuevo cliente
                        </>
                    }
                    onClick={() => navigate(APP_ROUTES.CLIENTS.CREATE)}
                />}
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
            </>}
            {/* Con el marco nuevo el botón está en el encabezado; el flotante se queda sólo en el de antes */}
            {!newShell && <FabButton
                icon={<BellIcon className="h-5 w-5" />}
                onClick={() => setShowNotificationModal(true)}
            />}
            <SendPushNotificationModal
                open={showNotificationModal}
                onOpenChange={setShowNotificationModal}
            />
        </div>
    )
}

export default ClientsListPage;