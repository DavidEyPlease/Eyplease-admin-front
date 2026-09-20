import { RoleKeys } from '@/interfaces/common'
import { queryKeys } from '@/utils/queryKeys'

export const COPILOT_CONVERSATIONS = 'copilot-conversations'
export const COPILOT_MESSAGES = 'copilot-messages'

export const conversationsKey = queryKeys.list(COPILOT_CONVERSATIONS)
export const messagesKey = (conversationId: string) => queryKeys.detail(COPILOT_MESSAGES, conversationId)

/**
 * A quién se le enseña. El servidor lo vuelve a exigir (controlador y cada herramienta): esto sólo
 * evita ofrecerle a un diseñador un panel que le contestaría «no tienes permiso».
 */
const COPILOT_ROLES: string[] = [RoleKeys.SUPER_ADMIN, 'admin']
export const canUseCopilot = (roleKey?: string | null) => !!roleKey && COPILOT_ROLES.includes(roleKey)
