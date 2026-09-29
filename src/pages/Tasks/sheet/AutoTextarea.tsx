import { TextareaHTMLAttributes, useEffect, useLayoutEffect, useRef } from 'react'

const fit = (node: HTMLTextAreaElement | null) => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight}px`
}

/** Un cuadro de texto que crece con lo que trae: el título y la descripción se leen enteros, sin barra */
const AutoTextarea = ({ value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) => {
    const ref = useRef<HTMLTextAreaElement>(null)

    useLayoutEffect(() => fit(ref.current), [value])

    /* Si cambia el ancho (la ventana, el celular girado) cambia cuántas líneas ocupa */
    useEffect(() => {
        const node = ref.current
        if (!node || typeof ResizeObserver === 'undefined') return
        let width = node.clientWidth
        const observer = new ResizeObserver(() => {
            if (node.clientWidth === width) return
            width = node.clientWidth
            fit(node)
        })
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return <textarea ref={ref} rows={1} value={value} {...props} />
}

export default AutoTextarea
