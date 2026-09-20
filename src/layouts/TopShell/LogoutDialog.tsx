import { useEffect, useState } from 'react'
import { LogOutIcon } from 'lucide-react'

import {
    AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/uishadcn/ui/alert-dialog'
import useAuth from '@/hooks/useAuth'
import { subscribeEvent, unsubscribeEvent } from '@/utils/events'
import { LOGOUT_EVENT } from './logoutBridge'

/**
 * El cierre de sesión del marco nuevo. Antes era un clic sin más en un menú: se cerraba sin
 * preguntar y dejaba en el acceso sin decir qué había pasado. Ahora confirma (un clic de más
 * contra un cierre por error), avisa mientras cierra y el acceso la despide por su nombre.
 */
const LogoutDialog = () => {
    const { user, handleLogout } = useAuth()
    const [open, setOpen] = useState(false)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        const listener = () => setOpen(true)
        subscribeEvent(LOGOUT_EVENT, listener)
        return () => unsubscribeEvent(LOGOUT_EVENT, listener)
    }, [])

    const firstName = (user?.name ?? '').trim().split(/\s+/)[0] ?? ''

    const onConfirm = () => {
        setClosing(true)
        /* `handleLogout` navega al acceso al terminar; el marco entero se desmonta con él */
        handleLogout()
    }

    return (
        <AlertDialog open={open} onOpenChange={value => { if (!closing) setOpen(value) }}>
            <AlertDialogContent className="rounded-[24px] sm:max-w-[420px]">
                <AlertDialogHeader className="items-center text-center sm:text-center">
                    <span className="shell-grad mb-1 grid size-14 place-items-center rounded-full shadow-[0_10px_22px_-8px_rgba(78,49,192,.7)]">
                        <LogOutIcon className="size-6 text-white" />
                    </span>
                    <AlertDialogTitle className="text-[19px] font-extrabold tracking-tight">¿Cerrar tu sesión{firstName ? `, ${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}` : ''}?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[13px]">
                        Tus piezas, tu boletín y tu conversación con el Asistente se quedan guardados. Para volver sólo necesitas tu usuario y tu contraseña.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-1 gap-2 sm:justify-center">
                    <AlertDialogCancel disabled={closing} className="h-11 cursor-pointer rounded-[13px] px-5 text-[13px] font-bold">Seguir aquí</AlertDialogCancel>
                    <button type="button" disabled={closing} onClick={onConfirm} className="shell-cta flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[13px] px-5 text-[13px] font-bold text-white disabled:opacity-70">
                        {closing
                            ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Cerrando…</>
                            : <><LogOutIcon className="size-4" /> Cerrar sesión</>}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default LogoutDialog
