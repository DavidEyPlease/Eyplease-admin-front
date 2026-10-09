/**
 * La app web «Eyplease+ Admin» del proyecto de Firebase `eypleaseplus2025` (el mismo de la app de
 * clientas), registrada el 8-oct-2026 para las notificaciones del panel en el teléfono.
 *
 * Estos valores son PÚBLICOS por diseño (identifican al proyecto ante el navegador; no dan acceso
 * a nada): por eso viven en el código y no en un `.env`. Lo secreto —la cuenta de servicio con la
 * que la API manda los avisos— está sólo en el servidor.
 */
export const FIREBASE_WEB_CONFIG = {
    apiKey: 'AIzaSyBY3SzVzsFopUiVXek2YGWsT4Tthj0ckNM',
    authDomain: 'eypleaseplus2025.firebaseapp.com',
    projectId: 'eypleaseplus2025',
    storageBucket: 'eypleaseplus2025.firebasestorage.app',
    messagingSenderId: '706826526684',
    appId: '1:706826526684:web:f66c8d68fb8ea4e09f7919',
}

/** La clave pública del certificado de Web Push (Configuración → Cloud Messaging → Certificados push web). */
export const FIREBASE_VAPID_KEY = 'BISQ20-si09dI4fRke62_2Lqp86jsII_BWImdb-yIlbJns7MY4fz6ImFEnk1_rRcj-8aM9Fg53u7l0ysshvRB5Y'
