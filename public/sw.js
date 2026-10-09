// El service worker del panel: lo hace instalable como app y deja el sitio listo para las
// notificaciones. NO guarda nada en caché a propósito: el panel siempre se pide a la red, así
// una versión nueva nunca se queda pegada en el teléfono de nadie.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
