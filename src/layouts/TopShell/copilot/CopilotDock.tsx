import { useState } from 'react'
import { ArrowLeftIcon, HistoryIcon, PlusIcon, XIcon } from 'lucide-react'

import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import CopilotComposer from './CopilotComposer'
import CopilotHistory from './CopilotHistory'
import CopilotThread, { CopilotIntro, Orb } from './CopilotThread'
import { useCopilotRequests } from './copilotBridge'
import useCopilotChat from './useCopilotChat'

const ACTION = 'flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground'

/** Las preguntas de arranque son las del día a día de la operación: se mandan tal cual a la IA */
const buildIntro = (name?: string): CopilotIntro => {
    const first = (name ?? '').trim().split(/\s+/)[0] ?? ''

    return {
        title: first ? `Hola, ${first}.` : 'Hola.',
        text: 'Pregúntame cómo va la operación: cobranza, lo que falta por publicar, si bajaron los reportes o los datos de una clienta.',
        suggestions: ['¿Qué tengo que atender hoy?', '¿Bajaron los reportes de hoy?', '¿Cómo va la cobranza del mes?', '¿Qué falta por publicar?'],
    }
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * El Copiloto del panel, acoplado a la derecha. Habla con `/admin/copilot`: una IA con
 * herramientas de SÓLO LECTURA sobre lo mismo que pinta el Inicio (cobranza, publicaciones,
 * solicitudes), los reportes que baja el robot y la búsqueda de clientas. No ejecuta nada: si se
 * le pide una acción dice en qué pantalla se hace.
 *
 * El hilo vive aquí, por encima de las páginas: cambiar de sección no pierde la conversación.
 * Plegado se queda como la burbuja que brilla, igual que en la web de clientas.
 */
const CopilotDock = ({ open, onOpenChange }: Props) => {
    const { user } = useAuth()
    const [view, setView] = useState<'chat' | 'history'>('chat')
    const {
        conversationId, messages, sending, loadingHistory, deleting,
        send, openConversation, startNewChat, removeConversation,
    } = useCopilotChat()

    const isHistory = view === 'history'

    const newChat = () => {
        startNewChat()
        setView('chat')
    }

    /* Las preguntas que llegan de ⌘K o de una página: se abre, vuelve al chat y se la manda */
    useCopilotRequests(text => {
        onOpenChange(true)
        setView('chat')
        send(text)
    })

    if (!open) {
        return (
            <button
                type="button"
                aria-label="Abrir el Copiloto"
                onClick={() => onOpenChange(true)}
                className="fixed right-6 bottom-6 z-40 cursor-pointer rounded-full border-[3px] border-background transition-transform duration-300 hover:scale-105"
            >
                <Orb className="size-[58px]" />
            </button>
        )
    }

    return (
        <aside className="hidden w-[360px] shrink-0 self-stretch lg:block">
            {/* `self-stretch` + sticky: la columna mide todo el alto de la página y el panel viaja por
                ella, así acompaña al hacer scroll en vez de irse con el contenido. */}
            <div className="shell-glass sticky top-[90px] flex h-[calc(100vh-110px)] flex-col overflow-hidden rounded-3xl">
                <div className="flex shrink-0 items-center gap-3 border-b border-border px-3.5 py-3">
                    <Orb className="size-[42px]" />
                    <div className="min-w-0 flex-1">
                        <b className="block text-[14.5px] font-extrabold">Copiloto</b>
                        <small className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <i className="size-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)]" />
                            <span className="truncate">Conectado a producción · sólo lectura</span>
                        </small>
                    </div>
                    <button type="button" title="Plegar" onClick={() => onOpenChange(false)} className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                        <XIcon className="size-[18px]" />
                    </button>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 px-2.5 pt-1.5">
                    <button type="button" className={ACTION} onClick={() => setView(isHistory ? 'chat' : 'history')}>
                        {isHistory ? <ArrowLeftIcon className="size-3.5" /> : <HistoryIcon className="size-3.5" />}
                        {isHistory ? 'Volver al chat' : 'Historial'}
                    </button>
                    {!isHistory && (
                        <button type="button" className={cn(ACTION, 'text-primary hover:text-primary')} onClick={newChat}>
                            <PlusIcon className="size-3.5" /> Nueva
                        </button>
                    )}
                </div>

                {/* `min-h-0`: sin él, al crecer la conversación empuja la cabecera fuera del panel */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {isHistory ? (
                        <CopilotHistory
                            activeId={conversationId}
                            deleting={deleting}
                            onSelect={id => { openConversation(id); setView('chat') }}
                            onDelete={removeConversation}
                        />
                    ) : (
                        <>
                            <CopilotThread messages={messages} sending={sending} loadingHistory={loadingHistory} intro={buildIntro(user?.name)} onSuggestion={send} />
                            <CopilotComposer sending={sending} onSend={send} />
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default CopilotDock
