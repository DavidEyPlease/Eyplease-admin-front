import { ColumnDef } from "@tanstack/react-table"
import { ITemplate, TemplateVariantKind } from "@/interfaces/templates"
import TemplateActions from "./Actions"
import { Badge } from "@/uishadcn/ui/badge"
import { UsersIcon } from "lucide-react"
import TemplateCover from "./TemplateCover"
import SwitchAction from "./SwitchAction"
import { Link } from "react-router"
import { APP_ROUTES } from "@/constants/app"
import { TEMPLATE_GROUP_REPORTS } from "../page-utils"

// Human-friendly labels for the variant badges shown next to a template's
// name. Kept in this file because the only consumer is the list column.
const VARIANT_KIND_LABELS: Record<TemplateVariantKind, string> = {
    image: "Imagen",
    video: "Video",
    pdf: "PDF",
    pptx: "PPTX",
}

/**
 * Returns the list of kinds to show as badges for a template. Prefers
 * the new model (enabled variants) and falls back to the legacy
 * `template_asset_type` for unmigrated rows so the UI keeps working
 * during the manual data migration.
 */
const resolveBadgeKinds = (template: ITemplate): TemplateVariantKind[] => {
    if (template.variants && template.variants.length > 0) {
        return template.variants
            .filter(variant => variant.enabled)
            .map(variant => variant.kind)
    }

    return template.template_asset_type ? [template.template_asset_type] : []
}

export const templatesColumns: ColumnDef<ITemplate>[] = [
    {
        id: "name",
        header: "Plantilla",
        cell: ({ row }) => {
            const kinds = resolveBadgeKinds(row.original)

            return (
                <div className="flex flex-wrap items-center gap-x-5">
                    {TEMPLATE_GROUP_REPORTS.includes(row.original.template_group) && (
                        <TemplateCover
                            templateId={row.original.id}
                            cover={row.original.picture}
                            templateName={row.original.name}
                        />
                    )}
                    <div className="flex flex-col gap-y-1">
                        <Link className="font-medium underline" to={APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(':id', row.original.id)}>
                            {row.original.name}
                        </Link>
                        {kinds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {kinds.map(kind => (
                                    <Badge key={kind} variant="outline" className="text-xs">
                                        {VARIANT_KIND_LABELS[kind] ?? kind}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground">Mes: {row.original.month}</span>
                    </div>
                </div>
            )
        },
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
