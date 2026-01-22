import SwitchInput from "@/components/common/Inputs/Switch"
import SearchInput from "@/components/generics/SearchInput"
import { API_ROUTES } from "@/constants/api"
import useListQuery from "@/hooks/useListQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { IBasicClient } from "@/interfaces/clients"
import { PaginationResponse } from "@/interfaces/common"
import { ITemplate } from "@/interfaces/templates"
import { Badge } from "@/uishadcn/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/uishadcn/ui/table"
import { queryKeys } from "@/utils/queryKeys"
import { useState } from "react"

interface Props {
    template: ITemplate
}

const ManageClients = ({ template }: Props) => {
    const [clientsCount, setClientsCount] = useState(template.clients_count)

    const { response: clients, setSearch, setData } = useListQuery<PaginationResponse<IBasicClient>>({
        endpoint: API_ROUTES.CLIENTS.BASIC_LIST,
        defaultPerPage: 5,
        customQueryKey: (params) => queryKeys.list('clients/basic/list', params)
    })

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('templates/stats')],
    })

    const onSetTemplate = async (clientId: string, checked: boolean) => {
        const response = await request('PATCH', API_ROUTES.CLIENTS.SET_TEMPLATE.replace('{id}', clientId), { templateId: template.id, active: checked })
        if (response.success && clients) {
            setClientsCount((prev) => checked ? prev + 1 : prev - 1)
            setData({
                ...clients,
                items: (clients.items ?? []).map(item => {
                    return item.id === clientId ? { ...item, template_id: checked ? template.id : null } : item
                })
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-[#4E31C0]/5 rounded-lg border border-[#4E31C0]/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-[#4E31C0]">Resumen de la Plantilla</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.name}</p>
                    </div>
                    <Badge>
                        {clientsCount} clientes activos
                    </Badge>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium">Lista de Clientes</h4>
                        <div className="text-sm text-gray-500">{clients?.total_items} clientes totales</div>
                    </div>
                    <SearchInput
                        placeholder="Buscar clientes"
                        onSubmitSearch={setSearch}
                    />
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Usando Plantilla</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(clients?.items ?? []).map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{client.name}</div>
                                            <div className="text-sm text-gray-500">{client.account}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.active ? "default" : "secondary"}>
                                            {client.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={client.template_id === template?.id ? "default" : "outline"}
                                            className={
                                                client.template_id === template?.id
                                                    ? "bg-green-100 text-green-800"
                                                    : ""
                                            }
                                        >
                                            {client.template_id === template?.id ? "Sí" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SwitchInput
                                            className="justify-end"
                                            id={`client-${client.id}`}
                                            loading={requestState.loading}
                                            checked={client.template_id === template?.id}
                                            onCheckedChange={(e) => onSetTemplate(client.id, e)}
                                            disabled={!client.active || requestState.loading}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 mt-0.5 flex-shrink-0"></div>
                    <div className="text-sm">
                        <p className="font-medium text-yellow-800">Nota importante:</p>
                        <p className="text-yellow-700 mt-1">
                            Los cambios se aplicarán inmediatamente. Los clientes inactivos no pueden usar plantillas hasta
                            que sean reactivados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageClients