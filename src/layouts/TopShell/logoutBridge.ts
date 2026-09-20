import { publishEvent } from '@/utils/events'

export const LOGOUT_EVENT = 'shell:logout'

/** Pide cerrar la sesión desde cualquier sitio (el menú de la cuenta, el perfil): el marco pregunta y cierra. */
export const requestLogout = () => publishEvent(LOGOUT_EVENT)
