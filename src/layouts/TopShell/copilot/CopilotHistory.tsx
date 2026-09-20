import { Trash2Icon } from 'lucide-react'

import { AlertConfirmDelete } from '@/components/generics/AlertConfirm'
import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ICopilotConversationsPage } from '@/interfaces/copilot'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import { conversationsKey } from './keys'

interface Props {
    activeId: string | null
    deleting: boolean
    onSelect: (id: string) => void
    onDelete: (id: string) => void
}

const when = (value: string | null) => {
    if (!value) return ''
    return new Date(value).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Las últimas conversaciones con el Copiloto (las 20 más recientes: son consultas del día, no un archivo). */
const CopilotHistory = ({ activeId, deleting, onSelect, onDelete }: Props) => {
    const { response, loading } = useFetchQuery<ICopilotConversationsPage>(API_ROUTES.COPILOT.CONVERSATIONS, {
        customQueryKey: conversationsKey,
    })

    const items = response?.items ?? []

    return (
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
                <div className="flex flex-col gap-2 p-1">
                    {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="px-3 py-10 text-center text-[12px] font-medium text-muted-foreground">
                    Todavía no le has preguntado nada. Lo que consultes queda aquí para retomarlo.
                </p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {items.map(conversation => {
                        const isActive = conversation.id === activeId

                        return (
                            <li key={conversation.id} className="group relative">
                                <button
                                    type="button"
                                    onClick={() => onSelect(conversation.id)}
                                    className={cn('flex w-full cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 pr-9 text-left transition-colors', isActive ? 'bg-primary/[.08]' : 'hover:bg-foreground/[.04]')}
                                >
                                    <span className={cn('truncate text-[13px] font-semibold', isActive && 'text-primary')}>{conversation.title}</span>
                                    <span className="text-[11px] font-medium text-muted-foreground">{when(conversation.last_message_at ?? conversation.created_at)}</span>
                                </button>

                                <AlertConfirmDelete
                                    title="¿Eliminar esta conversación?"
                                    description="Se borra el historial de esta conversación con el Copiloto."
                                    loading={deleting}
                                    trigger={
                                        <button type="button" aria-label={`Eliminar ${conversation.title}`} className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100">
                                            <Trash2Icon className="size-3.5" />
                                        </button>
                                    }
                                    onConfirm={() => onDelete(conversation.id)}
                                />
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default CopilotHistory
