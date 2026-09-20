import { Fragment } from 'react'

/** `**negritas**` dentro de una línea. Se arma con nodos de React: nada de lo que escriba la IA entra como HTML. */
const inline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4
            ? <b key={index} className="font-bold">{part.slice(2, -2)}</b>
            : <Fragment key={index}>{part}</Fragment>,
    )

const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/
const HEADING = /^\s*#{1,4}\s+(.*)$/

/**
 * Lo que contesta el Copiloto, legible: se le pide texto plano con viñetas de guion, pero si se le
 * escapa una negrita o una lista numerada no salen los asteriscos sueltos. Sólo se interpreta eso.
 */
const CopilotRichText = ({ text }: { text: string }) => (
    <>
        {text.replace(/\r/g, '').split('\n').map((line, index) => {
            const bullet = line.match(BULLET)
            const numbered = line.match(NUMBERED)
            const heading = line.match(HEADING)

            if (bullet) return <span key={index} className="flex gap-2 pl-0.5"><span aria-hidden className="select-none text-primary">•</span><span className="min-w-0 flex-1">{inline(bullet[1])}</span></span>
            if (numbered) return <span key={index} className="flex gap-2 pl-0.5"><span className="shrink-0 font-bold tabular-nums text-primary">{numbered[1]}.</span><span className="min-w-0 flex-1">{inline(numbered[2])}</span></span>
            if (heading) return <b key={index} className="block font-extrabold">{inline(heading[1])}</b>
            if (!line.trim()) return <span key={index} className="block h-2" />
            return <span key={index} className="block">{inline(line)}</span>
        })}
    </>
)

export default CopilotRichText
