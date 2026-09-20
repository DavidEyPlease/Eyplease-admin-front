import { useRef, useState } from 'react'
import { ArrowUpIcon } from 'lucide-react'

import { Textarea } from '@/uishadcn/ui/textarea'

interface Props {
    sending: boolean
    onSend: (text: string) => Promise<boolean>
}

const CopilotComposer = ({ sending, onSend }: Props) => {
    const [text, setText] = useState('')
    const input = useRef<HTMLTextAreaElement>(null)

    const canSend = !!text.trim() && !sending

    const submit = async () => {
        if (!canSend) return
        const value = text.trim()

        setText('')
        /* Mandar con el botón se lleva el foco al botón: vuelve a la caja para seguir escribiendo */
        input.current?.focus()

        /* Si falla, lo escrito vuelve a la caja para reintentar */
        if (!await onSend(value)) setText(value)
    }

    return (
        <div className="shrink-0 border-t border-border p-3">
            <div className="flex items-end gap-2">
                <Textarea
                    ref={input}
                    rows={1}
                    value={text}
                    placeholder="Pregunta por la operación…"
                    className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl text-[13px]"
                    /* NO se apaga mientras contesta: una caja apagada suelta el foco y después hay que
                       volver a darle clic. Lo que se frena es el ENVÍO (Enter y el botón), no el teclado. */
                    onChange={event => setText(event.target.value)}
                    onKeyDown={event => {
                        if (event.key !== 'Enter' || event.shiftKey) return
                        event.preventDefault()
                        submit()
                    }}
                />
                <button
                    type="button"
                    aria-label="Preguntar"
                    disabled={!canSend}
                    onClick={submit}
                    className="shell-grad grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-white shadow-[0_8px_18px_-8px_rgba(108,71,255,.9)] transition hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
                >
                    <ArrowUpIcon className="size-[18px]" />
                </button>
            </div>
            <p className="mt-1.5 px-1 text-[10.5px] font-medium text-muted-foreground">Sólo consulta: no cobra, no publica ni le escribe a nadie.</p>
        </div>
    )
}

export default CopilotComposer
