const KEY = 'eyplease-admin:shell'

/**
 * El marco nuevo se enciende por persona, no para todas a la vez.
 *
 * `?nuevo=1` lo enciende y `?nuevo=0` lo apaga; la elección se recuerda en este
 * navegador. Sin elección, en producción sale el marco de siempre: así el código
 * puede desplegarse sin que ninguna clienta vea un cambio que todavía no se ha
 * probado con sesiones reales. En local sale el nuevo, que es lo que se revisa.
 */
export const isNewShell = (): boolean => {
    try {
        const param = new URLSearchParams(window.location.search).get('nuevo')
        if (param === '1' || param === '0') localStorage.setItem(KEY, param === '1' ? 'new' : 'old')

        const saved = localStorage.getItem(KEY)
        if (saved) return saved === 'new'
    } catch {
        /* Navegación privada o almacenamiento bloqueado: vale el valor por defecto */
    }

    /* Instalado como app en el teléfono siempre sale el marco nuevo: es el único que trae menú de
       teléfono, y en iPhone la app instalada no comparte lo guardado en Safari, así que ahí nunca
       habría «elección» que recordar. (El manifest también abre con `?nuevo=1`.) */
    return import.meta.env.DEV || installedAsApp()
}

const installedAsApp = () => {
    try {
        return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    } catch {
        return false
    }
}

export const setNewShell = (on: boolean) => {
    try {
        localStorage.setItem(KEY, on ? 'new' : 'old')
    } catch {
        /* Sin almacenamiento no se recuerda; el cambio vale para esta carga */
    }
    window.location.reload()
}
