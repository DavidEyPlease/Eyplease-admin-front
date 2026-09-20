import { useEffect, useRef } from 'react'

import { publishEvent, subscribeEvent, unsubscribeEvent, BrowserEvent } from '@/utils/events'

const ASK_EVENT = 'eyplease-admin:copilot-ask'

/** Las páginas y ⌘K le encargan una pregunta al Copiloto sin conocerlo: se abre y la contesta. */
export const askCopilot = (text: string) => publishEvent(ASK_EVENT, { text })

/** El listener va por ref: quien escucha cambia en cada render y no hay que re-suscribirse */
export const useCopilotRequests = (onAsk: (text: string) => void) => {
    const handler = useRef(onAsk)
    handler.current = onAsk

    useEffect(() => {
        const listener = (event: Event) => {
            const text = (event as BrowserEvent<{ text: string }>).detail?.text
            if (text) handler.current(text)
        }
        subscribeEvent(ASK_EVENT, listener)
        return () => unsubscribeEvent(ASK_EVENT, listener)
    }, [])
}
