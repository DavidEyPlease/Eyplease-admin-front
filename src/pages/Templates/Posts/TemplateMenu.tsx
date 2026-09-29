import { useNavigate } from "react-router"
import { CopyIcon, EyeIcon, MoreHorizontalIcon, PencilLineIcon, SlidersHorizontalIcon, Trash2Icon, UsersIcon } from "lucide-react"

import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES } from "@/constants/app"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/uishadcn/ui/dropdown-menu"
import { publishEvent } from "@/utils/events"

const ITEM = "cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold"

/**
 * Lo mismo que el menú de siempre —ficha, arte, datos, clonar, clientas y eliminar—, con la piel nueva.
 * Los diálogos son los de siempre (TemplateDialogs); éste sólo dice cuál abrir.
 */
const TemplateMenu = ({ template }: { template: ITemplate }) => {
    const navigate = useNavigate()
    const setSelectedTemplate = useTemplatesStore(state => state.setSelectedTemplate)

    const { request, requestState } = useRequestQuery({
        onSuccess: () => publishEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, { id: template.id, isDeleted: true }),
    })

    const onDelete = async () => {
        await request('DELETE', API_ROUTES.TEMPLATES.DELETE.replace('{id}', template.id))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger aria-label={`Más acciones para ${template.name}`} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5">
                <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="w-56 rounded-2xl p-1.5">
                <DropdownMenuItem className={ITEM} onSelect={() => navigate(APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(':id', template.id))}>
                    <SlidersHorizontalIcon className="size-4" /> Abrir y ajustar
                </DropdownMenuItem>
                <DropdownMenuItem className={ITEM} onSelect={() => setSelectedTemplate(template, 'view')}>
                    <EyeIcon className="size-4" /> Ver el arte
                </DropdownMenuItem>
                <DropdownMenuItem className={ITEM} onSelect={() => setSelectedTemplate(template, 'edit')}>
                    <PencilLineIcon className="size-4" /> Editar datos
                </DropdownMenuItem>
                <DropdownMenuItem className={ITEM} onSelect={() => setSelectedTemplate(template, 'clone')}>
                    <CopyIcon className="size-4" /> Clonar para otro mes
                </DropdownMenuItem>
                <DropdownMenuItem className={ITEM} onSelect={() => setSelectedTemplate(template, 'manageClient')}>
                    <UsersIcon className="size-4" /> Clientas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertConfirmDelete
                    trigger={
                        <DropdownMenuItem disabled={requestState.loading} className={`${ITEM} text-destructive focus:text-destructive`} onSelect={event => event.preventDefault()}>
                            <Trash2Icon className="size-4" /> Eliminar
                        </DropdownMenuItem>
                    }
                    loading={requestState.loading}
                    onConfirm={onDelete}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TemplateMenu
