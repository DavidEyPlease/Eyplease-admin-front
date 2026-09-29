import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Un texto que se edita en su lugar (el título, la descripción): se guarda solo al dejar de escribir, al
 * salir del cuadro y al cerrar la ficha. Vacío no se guarda (la API no lo acepta): al salir vuelve lo último
 * guardado. Mientras se escribe, lo que conteste el servidor no pisa lo escrito.
 */
const useTextDraft = (saved: string, onSave: (value: string) => void, delay = 1000) => {
    const [draft, setDraft] = useState(saved)
    const draftRef = useRef(saved)
    const lastSaved = useRef(saved)
    const focused = useRef(false)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave

    const set = (value: string) => {
        draftRef.current = value
        setDraft(value)
    }

    useEffect(() => {
        lastSaved.current = saved
        if (!focused.current) set(saved)
    }, [saved])

    const flush = useCallback(() => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = null
        const value = draftRef.current
        if (!value.trim() || value === lastSaved.current) return
        lastSaved.current = value
        onSaveRef.current(value)
    }, [])

    /* Al cerrar la ficha con algo escrito todavía sin guardar, se guarda */
    useEffect(() => () => flush(), [flush])

    return {
        draft,
        onChange: (value: string) => {
            set(value)
            if (timer.current) clearTimeout(timer.current)
            timer.current = setTimeout(flush, delay)
        },
        onFocus: () => { focused.current = true },
        onBlur: () => {
            focused.current = false
            flush()
            if (!draftRef.current.trim()) set(lastSaved.current)
        },
    }
}

export default useTextDraft
