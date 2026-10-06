import { useEffect } from 'react'
import { toast } from 'sonner'

/** Cada cuánto se pregunta si hay versión nueva; además se pregunta al volver a la pestaña. */
const CHECK_EVERY_MS = 5 * 60_000
/** El paquete de entrada tal como lo nombra el build (`/assets/index-<hash>.js`). */
const ENTRY = /\/assets\/index-[\w-]+\.js/
const TOAST_ID = 'panel-new-version'

/** El paquete con el que arrancó ESTA pestaña: el <script> de entrada del index.html que la cargó. */
const runningEntry = (): string | null => {
    const script = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'))
        .find(item => ENTRY.test(item.src))

    return script ? new URL(script.src).pathname : null
}

/**
 * Avisa cuando se publicó una versión nueva del panel y esta pestaña sigue con la de antes.
 *
 * El panel es un solo paquete que se carga al abrir la pestaña: quien la deja abierta varios días sigue
 * viendo las pantallas viejas aunque ya se haya subido el cambio (el servidor conserva los paquetes
 * anteriores, así que nada falla; sólo no cambia). El 6-oct-2026 David veía la ficha de la clienta de
 * antes, cuatro días después de publicada la nueva.
 *
 * Se compara el paquete de esta pestaña con el que nombra el `index.html` del servidor, pedido sin
 * caché. No recarga solo —se perdería lo que se esté escribiendo—: deja el aviso con su botón.
 */
const useNewVersion = () => {
    useEffect(() => {
        if (import.meta.env.DEV) return

        const running = runningEntry()
        if (!running) return

        let warned = false

        const check = async () => {
            if (warned || document.visibilityState !== 'visible') return

            try {
                const response = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' })
                if (!response.ok) return

                const latest = (await response.text()).match(ENTRY)?.[0]
                if (!latest || latest === running) return

                warned = true
                toast('Hay una versión nueva del panel', {
                    id: TOAST_ID,
                    description: 'Actualiza para ver los últimos cambios.',
                    duration: Infinity,
                    action: { label: 'Actualizar', onClick: () => window.location.reload() },
                })
            } catch {
                /* Sin red o el servidor a medio despliegue: se vuelve a preguntar en la siguiente vuelta */
            }
        }

        const timer = window.setInterval(check, CHECK_EVERY_MS)
        document.addEventListener('visibilitychange', check)
        window.addEventListener('focus', check)

        return () => {
            window.clearInterval(timer)
            document.removeEventListener('visibilitychange', check)
            window.removeEventListener('focus', check)
        }
    }, [])
}

export default useNewVersion
