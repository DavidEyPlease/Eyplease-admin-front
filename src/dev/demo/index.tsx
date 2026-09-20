/* eslint-disable react-refresh/only-export-components -- es un punto de entrada, no un módulo que se recargue en caliente */
// SÓLO DEV (no entra en el build): el panel entero sin sesión ni contraseñas, con datos de EJEMPLO.
//   http://localhost:5195/demo.html            …&ir=/clients  (página en la que abre)   …&nuevo=0|1  (marco)
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router'

import '../../index.css'
import { SESSION_KEY } from '@/constants/app'
import { calls, installMockApi } from './mock-api'

const params = new URLSearchParams(window.location.search)

installMockApi()
Object.assign(window, { __demo: { calls } })

// La sesión es de mentira y vive sólo en esta pestaña
if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, 'demo')
window.addEventListener('pagehide', () => { if (localStorage.getItem(SESSION_KEY) === 'demo') localStorage.removeItem(SESSION_KEY) })

// `?nuevo=0|1` se guarda a mano: la dirección se reescribe abajo, antes de que el marco llegue a leerla
const shell = params.get('nuevo')
if (shell === '0' || shell === '1') localStorage.setItem('eyplease-admin:shell', shell === '1' ? 'new' : 'old')

const startAt = params.get('ir') ?? ''
window.history.replaceState(null, '', startAt.startsWith('/') && !startAt.startsWith('//') ? startAt : '/dashboard')

/** Siempre a la vista: nadie debe confundir estas cifras con las del negocio. */
const DemoBadge = () => {
    const { pathname } = useLocation()
    const onAuth = pathname.startsWith('/auth')
    return (
        <div style={{ position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 2147483647, display: 'flex', gap: 10, alignItems: 'center', padding: '7px 14px', borderRadius: 999, background: '#FDE68A', color: '#1A1830', font: '800 12px Inter, Arial', boxShadow: '0 10px 26px -10px rgba(10,5,60,.55)' }}>
            DEMO DEL PANEL · gente y cifras de EJEMPLO
            {onAuth && <a href="/demo.html" style={{ color: '#4E31C0' }}>Volver a la demo</a>}
            {onAuth && <a href="/auth/sign-in" style={{ color: '#4E31C0' }}>Ir al panel real</a>}
        </div>
    )
}

// El panel se importa DESPUÉS de instalar la API de mentira: al montar ya pide /me
import('../../App').then(({ default: App }) => {
    createRoot(document.getElementById('root')!).render(
        <BrowserRouter>
            <App />
            <DemoBadge />
        </BrowserRouter>,
    )
})
