import { ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

export interface MiniBar {
    key: string
    /** Debajo de la barra (p. ej. «Sep») */
    label: string
    value: number | null
    /** Lo que dice el globo al pasar el cursor o enfocar la barra */
    tip: ReactNode
    /** Barra «sin dato todavía»: se dibuja punteada, sin altura */
    pending?: boolean
}

/**
 * Columnas delgadas de una sola serie (un solo color, el violeta de la marca), con globo al pasar
 * el cursor o con el teclado, y una tabla oculta para lectores de pantalla. Un solo eje: si hace
 * falta otra medida, va en otro MiniBars, nunca encimada.
 */
const MiniBars = ({ bars, height = 120, caption, format = (value: number) => value.toLocaleString('es-MX') }: { bars: MiniBar[], height?: number, caption: string, format?: (value: number) => string }) => {
    const [hover, setHover] = useState<number | null>(null)
    const max = Math.max(1, ...bars.map(bar => bar.value ?? 0))

    return (
        <figure className="relative min-w-0">
            <div className="flex items-end gap-2 border-b border-border" style={{ height }} onMouseLeave={() => setHover(null)}>
                {bars.map((bar, index) => {
                    const ratio = (bar.value ?? 0) / max
                    return (
                        <div
                            key={bar.key}
                            tabIndex={0}
                            role="img"
                            aria-label={`${bar.label}: ${bar.pending || bar.value === null ? 'sin dato' : format(bar.value)}`}
                            onMouseEnter={() => setHover(index)}
                            onFocus={() => setHover(index)}
                            onBlur={() => setHover(null)}
                            className="group relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center outline-none"
                        >
                            {bar.pending || bar.value === null ? (
                                <span className="mb-0 block h-3 w-full max-w-[34px] rounded-t-[4px] border border-dashed border-muted-foreground/40" />
                            ) : (
                                <span
                                    className={cn('block w-full max-w-[34px] rounded-t-[4px] bg-[#6C47FF] transition-opacity dark:bg-[#8F74FF]', hover !== null && hover !== index && 'opacity-45')}
                                    style={{ height: `${Math.max(bar.value > 0 ? 3 : 0, ratio * (height - 22))}px` }}
                                />
                            )}
                            {hover === index && (
                                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-left text-[12px] leading-snug text-popover-foreground shadow-lg">
                                    {bar.tip}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-1.5 flex gap-2">
                {bars.map(bar => <span key={bar.key} className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold text-muted-foreground">{bar.label}</span>)}
            </div>
            <table className="sr-only">
                <caption>{caption}</caption>
                <tbody>
                    {bars.map(bar => <tr key={bar.key}><th scope="row">{bar.label}</th><td>{bar.pending || bar.value === null ? 'sin dato' : format(bar.value)}</td></tr>)}
                </tbody>
            </table>
        </figure>
    )
}

export default MiniBars;
