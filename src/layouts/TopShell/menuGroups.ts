import { PermissionKeys } from '@/interfaces/permissions'

/**
 * Cómo se reparte el menú de siempre en la barra. NO inventa entradas: agrupa las que ya trae
 * `sidebarMenu`, que llega filtrado por los permisos del rol. Un grupo al que el rol le deja una
 * sola entrada se pinta como enlace directo; uno vacío no se pinta. Las entradas que en el menú
 * lateral tenían submenú (WhatsApp, Plantillas, Configuraciones) abren aquí sus hijas.
 */
export const DIRECT_FIRST: PermissionKeys[] = [PermissionKeys.DASHBOARD]
export const GROUPS: Array<{ label: string, keys: PermissionKeys[] }> = [
    { label: 'Clientas', keys: [PermissionKeys.CLIENTS, PermissionKeys.WHATSAPP, PermissionKeys.SALES] },
    /* Las que todavía no son clientas: de dónde llegan y a quién escribirle antes de que pasen a Ventas */
    { label: 'Crecimiento', keys: [PermissionKeys.GROWTH_PROSPECTS, PermissionKeys.GROWTH_FUNNEL, PermissionKeys.GROWTH_SOCIAL] },
    /* Pedidos de diseño es operación (el trabajo que hay que sacar), no un dato de la clienta */
    { label: 'Operación', keys: [PermissionKeys.TASKS, PermissionKeys.CHALLENGES, PermissionKeys.PUBLISH_POSTS, PermissionKeys.REPORTS_MONITOR] },
    { label: 'Contenido', keys: [PermissionKeys.TEMPLATES, PermissionKeys.TRAININGS] },
]
export const DIRECT_LAST: PermissionKeys[] = [PermissionKeys.FINANCES]
export const GROUPED = new Set<PermissionKeys>([...DIRECT_FIRST, ...GROUPS.flatMap(group => group.keys), ...DIRECT_LAST])
