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

interface AlertConfirmDeleteProps {
    title?: string
    trigger: React.ReactNode
    description?: string
    loading?: boolean
    onConfirm: () => void
}

const TITLE = 'Seguro de realizar esta acción?'
const DESCRIPTION = 'Esta acción eliminara el registro seleccionado'

export const AlertConfirmDelete = ({ trigger, loading, title = TITLE, description = DESCRIPTION, onConfirm }: AlertConfirmDeleteProps) => {
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

interface AlertConfirmProps {
    title: string
    description?: string
    loading?: boolean
    open: boolean
    onOpenChange: () => void
    onConfirm: () => void
    onCancel?: () => void
}

export const AlertConfirm = ({ title, description, loading, open, onOpenChange, onConfirm, onCancel }: AlertConfirmProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-4xl" size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            text='Confirmar'
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