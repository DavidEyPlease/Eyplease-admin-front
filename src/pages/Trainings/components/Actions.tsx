import AlertConfirm from "@/components/generics/AlertConfirm"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ITraining } from "@/interfaces/training"
import useTrainingsStore from "@/store/trainings"
import { Button } from "@/uishadcn/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/uishadcn/ui/dropdown-menu"
import { publishEvent } from "@/utils/events"
import { EditIcon, FileTypeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"

interface Props {
    training: ITraining | null
}

const TrainingActions = ({ training }: Props) => {
    const { setSelectedTraining } = useTrainingsStore(state => state)

    const { request, requestState } = useRequestQuery({
        onSuccess: () => {
            publishEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, { id: training?.id, action: 'deleted' })
        }
    })

    const onDelete = async () => {
        if (!training) return
        await request('DELETE', API_ROUTES.TRAININGS.DELETE.replace('{id}', training.id))
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
                <DropdownMenuItem onClick={() => setSelectedTraining(training, 'edit')}>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTraining(training, 'files')}>
                    <FileTypeIcon className="w-4 h-4 mr-2" />
                    Archivos
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <AlertConfirm
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

export default TrainingActions