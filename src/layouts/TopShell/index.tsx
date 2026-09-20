import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import useAuth from '@/hooks/useAuth'
import CopilotDock from './copilot/CopilotDock'
import { canUseCopilot } from './copilot/keys'
import LogoutDialog from './LogoutDialog'
import TopBar from './TopBar'
import './shell.css'

const DOCK_KEY = 'eyplease-admin:copilot-dock'

/**
 * Plegado de entrada: el panel vive de tablas anchas (Clientas, Finanzas) y el Copiloto es una
 * consulta, no la pantalla. Quien lo abre lo conserva abierto: se recuerda por persona.
 */
const readDock = () => {
    try {
        return localStorage.getItem(DOCK_KEY) === 'open'
    } catch {
        return false
    }
}

/**
 * Marco nuevo del panel: barra de vidrio con desplegables arriba, la página en el centro y el
 * Copiloto acoplado a la derecha. Sustituye SÓLO al marco (menú lateral + cabecera): las páginas
 * entran por el mismo `<Outlet />`, así que todo lo que hoy funciona sigue funcionando dentro de
 * la piel nueva.
 */
const TopShell = () => {
    const location = useLocation()
    const { user } = useAuth()
    const [dockOpen, setDockOpen] = useState(readDock)

    const copilot = canUseCopilot(user?.role?.role_key)

    useEffect(() => {
        try {
            localStorage.setItem(DOCK_KEY, dockOpen ? 'open' : 'closed')
        } catch {
            /* Sin almacenamiento el panel no recuerda su estado; nada más */
        }
    }, [dockOpen])

    return (
        <div className="relative min-h-screen w-full bg-[#F3F2FA] dark:bg-[#0B0A1A]">
            <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

            <div className="relative z-[1]">
                <TopBar copilot={copilot} copilotOpen={dockOpen} onToggleCopilot={() => setDockOpen(open => !open)} />

                <div className="mx-auto mt-[18px] mb-16 flex w-[min(1560px,calc(100%-28px))] items-start gap-[18px]">
                    <main className="min-w-0 flex-1">
                        <div key={location.pathname} className="shell-page flex flex-col gap-4">
                            <Outlet />
                        </div>
                    </main>

                    {copilot && <CopilotDock open={dockOpen} onOpenChange={setDockOpen} />}
                </div>
            </div>

            <LogoutDialog />
        </div>
    )
}

export default TopShell
