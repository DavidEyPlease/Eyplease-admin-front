import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/uishadcn/ui/alert-dialog"
import Button from "../common/Button"
import { InfoIcon } from "lucide-react"

interface Props {
    title?: string
    trigger: React.ReactNode
    description?: string
    loading?: boolean
    onConfirm: () => void
}

const TITLE = 'Seguro de realizar esta acción?'
const DESCRIPTION = 'Esta acción eliminara el registro seleccionado'

const AlertConfirm = ({ trigger, loading, title = TITLE, description = DESCRIPTION, onConfirm }: Props) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-4xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <InfoIcon className="mx-auto size-28 py-5 text-orange-300" />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            text='Continuar'
                            color="primary"
                            rounded
                            block
                            loading={loading}
                            onClick={onConfirm}
                        />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertConfirm