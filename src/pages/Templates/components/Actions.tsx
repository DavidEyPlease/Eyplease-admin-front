import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { Button } from "@/uishadcn/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/uishadcn/ui/dropdown-menu"
import { publishEvent } from "@/utils/events"
import { EditIcon, EyeIcon, MoreHorizontalIcon, Trash2Icon, UsersIcon } from "lucide-react"

interface Props {
    template: ITemplate | null
}

const TemplateActions = ({ template }: Props) => {
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