import { Outlet, useLocation } from 'react-router'

import LogoutDialog from './LogoutDialog'
import TopBar from './TopBar'
import './shell.css'

/**
 * Marco nuevo del panel: barra de vidrio con desplegables arriba y la página debajo, a todo el
 * ancho. Sustituye SÓLO al marco (menú lateral + cabecera): las páginas entran por el mismo
 * `<Outlet />`, así que todo lo que hoy funciona sigue funcionando dentro de la piel nueva.
 *
 * Todavía sin Copiloto: el Asistente de la web de clientas habla con una API que ya existe; el
 * del panel necesita la suya (chat de operación con herramientas de administrador).
 */
const TopShell = () => {
    const location = useLocation()

    return (
        <div className="relative min-h-screen w-full bg-[#F3F2FA] dark:bg-[#0B0A1A]">
            <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

            <div className="relative z-[1]">
                <TopBar />
                <main className="mx-auto mt-[18px] mb-16 w-[min(1560px,calc(100%-28px))] min-w-0">
                    <div key={location.pathname} className="shell-page flex flex-col gap-4">
                        <Outlet />
                    </div>
                </main>
            </div>

            <LogoutDialog />
        </div>
    )
}

export default TopShell
