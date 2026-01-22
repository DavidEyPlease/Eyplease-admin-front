const subscribeEvent = (eventName: string, listener: EventListenerOrEventListenerObject) => {
    document.addEventListener(eventName, listener)
}

const unsubscribeEvent = (eventName: string, listener?: EventListenerOrEventListenerObject) => {
    document.removeEventListener(eventName, listener as EventListenerOrEventListenerObject)
}

const publishEvent = <T>(eventName: string, data?: T) => {
    const event = new CustomEvent(eventName, { detail: data })
    document.dispatchEvent(event)
}

export interface BrowserEvent<T> extends CustomEvent {
    detail: T & { action?: 'created' | 'updated' | 'deleted' }
}

export { publishEvent, subscribeEvent, unsubscribeEvent }