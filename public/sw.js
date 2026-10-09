// El service worker del panel: lo hace instalable como app y deja el sitio listo para las
// notificaciones. NO guarda nada en caché a propósito: el panel siempre se pide a la red, así
// una versión nueva nunca se queda pegada en el teléfono de nadie.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

// —— Notificaciones —— Las manda la API por Firebase (FCM). El aviso llega aquí aunque el panel esté
// cerrado; se enseña con su título y su texto, y al tocarlo abre el panel en la página del aviso.
self.addEventListener('push', event => {
    let payload = {}
    try { payload = event.data ? event.data.json() : {} } catch { /* un aviso sin datos se enseña con el texto de siempre */ }
    const notice = payload.notification || {}
    const data = payload.data || {}
    const link = (payload.fcmOptions && payload.fcmOptions.link) || data.link || '/dashboard'

    event.waitUntil(self.registration.showNotification(notice.title || data.title || 'Eyplease+ Admin', {
        body: notice.body || data.body || '',
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        // El mismo asunto no se apila: el aviso nuevo reemplaza al anterior
        tag: data.tag || undefined,
        data: { link },
    }))
})

self.addEventListener('notificationclick', event => {
    event.notification.close()
    const link = new URL((event.notification.data && event.notification.data.link) || '/dashboard', self.location.origin).href

    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
        const open = windows.find(client => 'focus' in client)
        if (open) return open.navigate ? open.navigate(link).then(client => (client || open).focus()) : open.focus()
        return self.clients.openWindow(link)
    }))
})

