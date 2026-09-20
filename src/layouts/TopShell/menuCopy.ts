import { MenuItem } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'

/** El nombre y la bajada con que se presenta cada entrada en el marco nuevo. */
export const ADMIN_COPY: Partial<Record<PermissionKeys, { label?: string, hint: string }>> = {
    [PermissionKeys.DASHBOARD]: { label: 'Hoy', hint: 'El pulso de la operación' },
    [PermissionKeys.CLIENTS]: { hint: 'Padrón, planes, accesos y cada cuenta a fondo' },
    [PermissionKeys.WHATSAPP]: { hint: 'Lo que escriben las clientas y los tickets abiertos' },
    [PermissionKeys.TASKS]: { label: 'Pedidos de diseño', hint: 'Lo que encargan, quién lo lleva y qué se entrega' },
    [PermissionKeys.REPORTS_MONITOR]: { hint: 'Si bajaron los reportes de cada clienta y cuáles faltan' },
    [PermissionKeys.PUBLISH_POSTS]: { hint: 'Qué sección salió hoy, cuál falta y relanzarla' },
    [PermissionKeys.TEMPLATES]: { hint: 'Las plantillas de boletines y de publicaciones' },
    [PermissionKeys.TRAININGS]: { label: 'Entrenamiento', hint: 'El tema de cada lunes para las juntas de unidad' },
    [PermissionKeys.FINANCES]: { hint: 'Lo cobrado, lo pendiente y los comprobantes por validar' },
    [PermissionKeys.CONFIGURATION]: { label: 'Configuración', hint: 'Planes, precios y permisos de cada rol' },
}
export const adminLabelOf = (item: MenuItem) => ADMIN_COPY[item.key]?.label ?? item.label
