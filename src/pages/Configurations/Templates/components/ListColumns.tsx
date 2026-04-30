import { ColumnDef } from "@tanstack/react-table"
import { ITemplate } from "@/interfaces/templates"
import TemplateActions from "./Actions"
import { Badge } from "@/uishadcn/ui/badge"
import { UsersIcon } from "lucide-react"
import TemplateCover from "./TemplateCover"
import SwitchAction from "./SwitchAction"
import { Link } from "react-router"
import { APP_ROUTES } from "@/constants/app"

export const templatesColumns: ColumnDef<ITemplate>[] = [
    {
        id: "name",
        header: "Plantilla",
        cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-x-5">
                <TemplateCover
                    templateId={row.original.id}
                    cover={row.original.picture}
                    templateName={row.original.name}
                />
                <div className="flex flex-col">
                    <Link className="font-medium underline" to={APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(':id', row.original.id)}>
                        {row.original.name}
                    </Link>
                    {row.original.template_asset_type && <span className="text-xs text-muted-foreground">Recurso: {row.original.template_asset_type}</span>}
                    <span className="text-xs text-muted-foreground">Mes: {row.original.month}</span>
                </div>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "template_group",
        header: "Grupo",
        cell: ({ row }) => (
            <div className="flex flex-col">
                {row.original.template_group}
                {row.original.template_subgroup && <span className="text-xs text-muted-foreground"><b>Subgrupo</b>: {row.original.template_subgroup}</span>}
            </div>
        )
    },
    {
        accessorKey: "clients_count",
        header: "Clientes usando",
        cell: ({ row }) => {
            return (
                <Badge variant="secondary" className="bg-[#4E31C0]/10 text-[#4E31C0]">
                    <UsersIcon className="w-3 h-3 mr-1" />
                    {row.original.clients_count}
                </Badge>
            )
        }
    },
    {
        accessorKey: "active",
        header: "Estado en sistema",
        cell: ({ row }) => <SwitchAction templateId={row.original.id} actionField="active" checked={row.original.active} id={`template-${row.original.id}-status`} />
    },
    {
        accessorKey: "enabled_all_clients",
        header: "Usada en todos los clientes",
        cell: ({ row }) => <SwitchAction templateId={row.original.id} checked={row.original.enabled_all_clients} actionField="enabled_all_clients" id={`template-${row.original.id}-all_clients_enabled`} />
    },
    {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => <TemplateActions template={row.original} />,
    },
]
