import { useEffect, useRef } from 'react'

import ISOTIPO from '@/assets/images/icon-white.png'
import { ICopilotMessage } from '@/interfaces/copilot'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import CopilotRichText from './CopilotRichText'

export const Orb = ({ className }: { className?: string }) => (
    <span className={cn('shell-grad shell-orb grid shrink-0 place-items-center rounded-full', className)}>
        <img src={ISOTIPO} alt="" className="relative w-1/2" />
    </span>
)

export interface CopilotIntro {
    title: string
    text: string
    suggestions: string[]
}

interface Props {
    messages: ICopilotMessage[]
    sending: boolean
    loadingHistory: boolean
    intro: CopilotIntro
    onSuggestion: (text: string) => void
}

const Bubble = ({ message }: { message: ICopilotMessage }) => message.role === 'user' ? (
    <p className="shell-grad max-w-[88%] self-end rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-white">
        {message.text}
    </p>
) : (
    <div className="flex items-start gap-2">
        <Orb className="mt-0.5 size-7 [animation:none] before:hidden" />
        <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-border bg-foreground/[.035] px-3.5 py-2.5 text-[13px] leading-relaxed dark:bg-white/[.05]">
            <CopilotRichText text={message.text} />
        </div>
    </div>
)

/** El Copiloto consulta la operación antes de contestar: tarda más que un chat normal y se dice */
const Working = () => (
    <div className="flex items-start gap-2">
        <Orb className="mt-0.5 size-7" />
        <span className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-foreground/[.035] px-3.5 py-3 text-[12px] font-semibold text-muted-foreground dark:bg-white/[.05]">
            <span className="flex items-center gap-1">
                {[0, 150, 300].map(delay => <i key={delay} className="size-1.5 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${delay}ms` }} />)}
            </span>
            Revisando la operación…
        </span>
    </div>
)

const CopilotThread = ({ messages, sending, loadingHistory, intro, onSuggestion }: Props) => {
    const bottom = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, sending])

    const isEmpty = !loadingHistory && messages.length === 0

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 py-4">
            {loadingHistory && (
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-10 w-3/5 self-end rounded-2xl" />
                    <Skeleton className="h-24 w-4/5 rounded-2xl" />
                    <Skeleton className="h-10 w-2/5 self-end rounded-2xl" />
                </div>
            )}

            {isEmpty && (
                <div className="m-auto flex flex-col items-center gap-2.5 px-2 text-center">
                    <Orb className="size-14" />
                    <h2 className="mt-1 text-[19px] font-extrabold tracking-tight">{intro.title}</h2>
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground">{intro.text}</p>
                    <div className="mt-2 grid w-full gap-1.5">
                        {intro.suggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => onSuggestion(suggestion)}
                                className="cursor-pointer rounded-xl border border-border bg-card/60 px-3 py-2.5 text-left text-[12.5px] font-semibold transition-colors hover:border-[#6C47FF]/40 hover:text-primary"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.length > 0 && (
                <div className="flex flex-col gap-3">
                    {messages.map(message => <Bubble key={message.id} message={message} />)}
                    {sending && <Working />}
                </div>
            )}

            <div ref={bottom} />
        </div>
    )
}

export default CopilotThread
