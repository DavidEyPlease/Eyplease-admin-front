import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES } from "@/constants/app"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { Button } from "@/uishadcn/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/uishadcn/ui/dropdown-menu"
import { publishEvent } from "@/utils/events"
import { EditIcon, EyeIcon, MoreHorizontalIcon, Trash2Icon, UsersIcon, WandSparklesIcon } from "lucide-react"
import { useNavigate } from "react-router"

interface Props {
    template: ITemplate | null
}

const TemplateActions = ({ template }: Props) => {
    const navigate = useNavigate()
    const { setSelectedTemplate } = useTemplatesStore(state => state)

    const { request, requestState } = useRequestQuery({
        onSuccess: () => {
            publishEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, { id: template?.id, isDeleted: true })
        }
    })

    const onDelete = async () => {
        if (!template) return
        await request('DELETE', API_ROUTES.TEMPLATES.DELETE.replace('{id}', template.id))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                    <MoreHorizontalIcon className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedTemplate(template, 'view')}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver Plantilla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTemplate(template, 'edit')}>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedTemplate(template, 'manageClient')}>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Gestionar Clientes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {template?.template_group === 'reports' && (
                    <DropdownMenuItem onClick={() => navigate(APP_ROUTES.TEMPLATES.EDITOR_REPORTS.replace(':id', template?.id || ''))}>
                        <WandSparklesIcon className="w-4 h-4 mr-2" />
                        Editor
                    </DropdownMenuItem>
                )}

                <AlertConfirmDelete
                    trigger={
                        <DropdownMenuItem disabled={requestState.loading} className="text-red-500" onSelect={(e) => e.preventDefault()}>
                            <Trash2Icon className="w-4 h-4 mr-2 text-red-500" />
                            Eliminar
                        </DropdownMenuItem>
                    }
                    loading={requestState.loading}
                    onConfirm={() => onDelete()}
                />

            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TemplateActions