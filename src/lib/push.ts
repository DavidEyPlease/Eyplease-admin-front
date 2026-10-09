import { FIREBASE_VAPID_KEY, FIREBASE_WEB_CONFIG } from '@/constants/firebase'
import HttpService from '@/services/http'

/**
 * Las notificaciones del panel en el teléfono (o en la computadora): este navegador pide permiso,
 * Firebase le da un token y la API lo guarda como un dispositivo más del usuario (`user_devices`,
 * igual que la app de clientas). Con eso la API ya sabe a dónde mandarle los avisos.
 *
 * Firebase se carga sólo cuando hace falta (al activar o al renovar el token), no con el panel.
 */

/**
 * - `unsupported`: este navegador no puede recibir avisos.
 * - `needs-install`: iPhone sin instalar: ahí los avisos sólo existen con el panel en la pantalla de inicio.
 * - `default`: se puede pedir permiso.  `granted` / `denied`: lo que contestó la persona.
 */
export type PushState = 'unsupported' | 'needs-install' | 'default' | 'granted' | 'denied'

const DEVICE_KEY = 'eyplease-admin:device-id'
const TOKEN_KEY = 'eyplease-admin:push-token'

export const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export const pushState = (): PushState => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (!supported) return isIos() && !isStandalone() ? 'needs-install' : 'unsupported'
    return Notification.permission
}

const deviceId = () => {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(DEVICE_KEY, id)
    }
    return id
}

const osName = () => {
    const agent = navigator.userAgent
    return isIos() ? 'ios' : /android/i.test(agent) ? 'android' : /mac/i.test(agent) ? 'macos' : /win/i.test(agent) ? 'windows' : 'otro'
}

/**
 * Pide (o renueva) el token de este navegador y lo deja registrado en la API. Sólo hace algo con el
 * permiso ya concedido; se llama al activar y, en silencio, cada vez que abre el panel: Firebase
 * cambia el token de vez en cuando y un token viejo es un aviso que no llega.
 *
 * @param userId  el token se recuerda por persona: si otra entra en este teléfono, se registra a su nombre
 */
export const syncPushToken = async (userId: string): Promise<boolean> => {
    if (pushState() !== 'granted') return false

    /* Sin service worker (en desarrollo no se registra) `ready` no termina nunca */
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false

    const [{ getApps, initializeApp }, { getMessaging, getToken, isSupported }] = await Promise.all([import('firebase/app'), import('firebase/messaging')])
    if (!(await isSupported())) return false

    const app = getApps()[0] ?? initializeApp(FIREBASE_WEB_CONFIG)
    const token = await getToken(getMessaging(app), { vapidKey: FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration })
    if (!token) return false

    const remembered = `${userId}:${token}`
    if (localStorage.getItem(TOKEN_KEY) === remembered) return true

    await HttpService.post('/users/devices', {
        device_id: deviceId(),
        platform: 'web',
        os: osName(),
        os_version: navigator.userAgent.slice(0, 180),
        name: isStandalone() ? 'Panel instalado' : 'Panel en el navegador',
        fcm_token: token,
    })
    localStorage.setItem(TOKEN_KEY, remembered)
    return true
}

/** Pide el permiso (tiene que venir de un toque de la persona) y, si lo da, registra este navegador. */
export const enablePush = async (userId: string): Promise<PushState> => {
    if (pushState() === 'default') await Notification.requestPermission()
    if (pushState() === 'granted') await syncPushToken(userId)
    return pushState()
}
