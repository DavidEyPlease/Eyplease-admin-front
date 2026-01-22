import useListQuery from "@/hooks/useListQuery";
import { queryKeys } from "@/utils/queryKeys";
import { INetworkPerson, NetworkRankGroupType } from "@/interfaces/vendors";
import { API_ROUTES } from "@/constants/api";
import { replaceRecordIdInPath } from "@/utils";

import Spinner from "@/components/common/Spinner";
import UIPagination from "@/components/generics/Pagination";
import SearchInput from "@/components/generics/SearchInput";
import TableContainer from "@/components/generics/TableContainer";
import { PaginationResponse, TableColumn } from "@/interfaces/common";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import VendorItem from "./VendorItem";
import DynamicTabs from "@/components/generics/DynamicTabs";
import UpdateNetwork from "./UpdateNetwork";
import { ScrollArea } from "@/uishadcn/ui/scroll-area";

interface Props {
    clientId: string
}

const LIST_TABLE_COLUMNS: TableColumn[] = [
    { key: 'account_number', label: 'Cuenta' },
    { key: 'actions', label: '' }
]

const Vendors = ({ clientId }: Props) => {
    const {
        response: vendors,
        isLoading,
        page,
        filters,
        onApplyFilters,
        onChangePage,
        setPerPage,
        setSearch
    } = useListQuery<PaginationResponse<INetworkPerson>, { vendorRole: NetworkRankGroupType }>({
        endpoint: replaceRecordIdInPath(API_ROUTES.CLIENTS.GET_NETWORK, clientId),
        defaultPerPage: 15,
        defaultFilters: { vendorRole: 'unity' },
        customQueryKey: (params) => queryKeys.list(`client/${clientId}/network`, params)
    })

    return (
        <Card>
            <CardHeader className="pb-0">
                <CardTitle className="justify-between flex items-center">
                    Vendedoras (es)
                    <UpdateNetwork clientId={clientId} rolSelected={filters.vendorRole || 'unity'} />
                </CardTitle>
                <CardDescription>{vendors?.total_items ?? 0} vendedoras (es)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between flex-wrap items-center mb-1 space-x-2">
                    <DynamicTabs
                        value={filters.vendorRole}
                        onValueChange={e => onApplyFilters({ vendorRole: e as NetworkRankGroupType })}
                        items={[
                            { label: 'Unidad', value: 'unity' },
                            { label: 'Directoras', value: 'directors' },
                        ]}
                    />
                    <div className="flex-1">
                        <SearchInput
                            placeholder="Buscar vendedoras"
                            onSubmitSearch={setSearch}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <Spinner size="md" color="primary" />
                ) : (
                    <ScrollArea className="h-[500px] w-full">
                        <TableContainer
                            containerClasses="border-none px-0"
                            columns={LIST_TABLE_COLUMNS}
                            caption={
                                <UIPagination
                                    totalPages={vendors?.last_page || 0}
                                    perPage={15}
                                    page={page || 1}
                                    onChangePage={onChangePage}
                                    onChangePerPage={setPerPage}
                                />
                            }
                        >
                            {(vendors?.items || []).map(item => (
                                <VendorItem key={item.id} person={item} />
                            ))}
                        </TableContainer>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}

export default Vendors;