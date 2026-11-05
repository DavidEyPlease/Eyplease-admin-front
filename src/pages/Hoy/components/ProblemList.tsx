import { useNavigate } from 'react-router'
import { CheckCircle2Icon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { PulseProblem, PulseResolved } from '../problems'

/**
 * Lo que hay que atender, una tarjeta por CAUSA: qué pasó en palabras, qué hacer y su botón. Lo que hoy falló y ya se
 * arregló solo va plegado debajo, para que se sepa sin que estorbe.
 */
const ProblemList = ({ problems, resolved }: { problems: PulseProblem[], resolved: PulseResolved[] }) => {
    const navigate = useNavigate()

    if (!problems.length && !resolved.length) return null

    return (
        <div className="mt-4 grid gap-2.5">
            {problems.map(problem => (
                <article key={problem.id} className={cn('shell-glass rounded-[18px] border-l-4 px-4 py-3.5', problem.tone === 'bad' ? 'border-l-rose-500' : 'border-l-amber-400')}>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className={cn('pulse-tag', problem.tone)}>{problem.tag}</span>
                        <h3 className="min-w-0 text-[14.5px] leading-snug font-extrabold tracking-tight">{problem.title}</h3>
                    </div>
                    {problem.what && <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{problem.what}</p>}
                    {problem.todo && (
                        <p className="mt-1.5 text-[13px] leading-relaxed">
                            <b className="font-extrabold">Qué hacer: </b>{problem.todo}
                        </p>
                    )}
                    {!!problem.actions?.length && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                            {problem.actions.map((action, position) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => navigate(action.to)}
                                    className={cn('h-8 cursor-pointer rounded-xl px-3.5 text-[12.5px] font-bold transition-colors', position === 0 ? 'bg-primary/12 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground')}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </article>
            ))}

            {resolved.length > 0 && (
                <details className="group rounded-[18px] px-1 py-1">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-[12.5px] font-bold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <CheckCircle2Icon className="size-4 text-emerald-500" aria-hidden />
                        {resolved.length === 1 ? '1 cosa falló hoy y ya se arregló sola' : `${resolved.length} cosas fallaron hoy y ya se arreglaron solas`}
                        <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <ul className="mt-2 grid gap-1.5 pl-6">
                        {resolved.map(item => (
                            <li key={item.id} className="list-disc text-[12.5px] leading-relaxed text-muted-foreground">{item.text}</li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    )
}

export default ProblemList
