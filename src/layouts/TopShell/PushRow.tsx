import { useState } from 'react'
import { BellOffIcon, BellRingIcon, CheckIcon } from 'lucide-react'

import useAuth from '@/hooks/useAuth'
import { enablePush, pushState, PushState } from '@/lib/push'
import HttpService from '@/services/http'

const COPY: Record<Exclude<PushState, 'unsupported'>, { title: string, text: string }> = {
    default: { title: 'Recibe los avisos en este teléfono', text: 'Solicitudes nuevas, correcciones y fallas, aunque el panel esté cerrado.' },
    granted: { title: 'Notificaciones activadas', text: 'Este teléfono recibe los avisos del panel.' },
    denied: { title: 'Las notificaciones están bloqueadas', text: 'Se activan en los ajustes del teléfono: Apps → Eyplease Admin → Notificaciones.' },
    'needs-install': { title: 'Primero instala el panel', text: 'En iPhone los avisos sólo llegan con el panel en la pantalla de inicio: Compartir → Agregar a inicio.' },
}

/**
 * La fila de «Más» para encender los avisos en ESTE teléfono. El permiso sólo se puede pedir con un
 * toque de la persona, por eso es un botón y no algo que pase solo al entrar.
 */
const PushRow = () => {
    const { user } = useAuth()
    const [state, setState] = useState<PushState>(pushState)
    const [busy, setBusy] = useState(false)
    const [failed, setFailed] = useState(false)
    const [test, setTest] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

    if (state === 'unsupported' || !user) return null

    const enable = async () => {
        setBusy(true)
        setFailed(false)
        try {
            setState(await enablePush(user.id))
        } catch {
            /* El permiso quedó dado; el registro se reintenta solo la próxima vez que abra el panel */
            setState(pushState())
            setFailed(true)
        } finally {
            setBusy(false)
        }
    }

    /* El aviso de prueba sale de la API hacia este usuario: si llega, los de verdad también */
    const sendTest = async () => {
        setTest('sending')
        try {
            await HttpService.post('/users/devices/test', {})
            setTest('sent')
        } catch {
            setTest('error')
        }
    }

    const copy = COPY[state]
    const note = failed
        ? 'Quedó el permiso, pero no se pudo registrar el teléfono; se reintenta solo al volver a abrir el panel.'
        : test === 'sent' ? 'Aviso de prueba enviado: debe llegar en unos segundos.'
        : test === 'error' ? 'No se pudo mandar la prueba. Cierra y vuelve a abrir el panel, y prueba otra vez.'
        : copy.text
    const Icon = state === 'granted' ? BellRingIcon : state === 'default' ? BellRingIcon : BellOffIcon

    return (
        <div className="mt-1 flex items-center gap-3 rounded-2xl bg-primary/6 px-2.5 py-2.5">
            <span className="shell-drop-icon grid size-[42px] shrink-0 place-items-center rounded-[14px] text-primary"><Icon className="size-5" /></span>
            <span className="min-w-0 flex-1">
                <b className="block text-[14px] leading-snug font-bold">{copy.title}</b>
                <small className="block text-[12px] leading-snug text-muted-foreground">{note}</small>
            </span>
            {state === 'default' && (
                <button type="button" onClick={enable} disabled={busy} className="h-9 shrink-0 cursor-pointer rounded-xl bg-primary px-3.5 text-[12.5px] font-bold text-primary-foreground transition-opacity disabled:opacity-60">
                    {busy ? 'Activando…' : 'Activar'}
                </button>
            )}
            {state === 'granted' && !failed && (
                <button type="button" onClick={sendTest} disabled={test === 'sending'} className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-[12.5px] font-bold transition-opacity disabled:opacity-60">
                    {test === 'sent' ? <CheckIcon className="size-4 text-emerald-500" /> : null}
                    {test === 'sending' ? 'Enviando…' : 'Probar'}
                </button>
            )}
        </div>
    )
}

export default PushRow
