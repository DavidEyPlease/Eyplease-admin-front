import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeftIcon, CalendarClockIcon, CircleIcon, EyeIcon, PencilLineIcon, PlusCircleIcon, SendIcon, Trash2Icon, UploadIcon, UserRoundIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ITask, ITaskActivity } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import { titleCase } from '@/pages/Clients/List/names'
import { TasksService } from '@/services/tasks.service'
import { replaceRecordIdInPath } from '@/utils'
import Face from '../Face'
import AutoTextarea from './AutoTextarea'
import { SystemIcon, TimelineEntry, clientOf, firstName, systemText, timelineOf, whenOf } from './lib'
import { errorText, sheetKeys } from './useTaskSheet'

type Filter = 'all' | 'comment' | 'request_correction'

const ICONS: Record<SystemIcon, typeof CircleIcon> = {
    created: PlusCircleIcon, stage: ArrowRightLeftIcon, person: UserRoundIcon, date: CalendarClockIcon, upload: UploadIcon, delete: Trash2Icon, other: CircleIcon,
}

/** Los comentarios los escribe la gente (y a veces traen formato); lo demás lo escribe el sistema */
const html = (value: string) => value.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ')

const Entry = ({ entry }: { entry: TimelineEntry }) => {
    const { activity } = entry
    /* El padrón trae los nombres de las clientas en mayúsculas */
    const who = activity.user?.name ? titleCase(activity.user.name) : 'Alguien'

    if (entry.kind === 'message') {
        return (
            <article className={cn('ficha-msg', entry.correction && 'fix')}>
                <Face user={activity.user ?? { name: who }} size={28} />
                <div className="min-w-0">
                    <p className="ficha-msg__head">
                        <b className="truncate">{who}</b>
                        {entry.correction && <span className="ficha-tag hot shrink-0"><PencilLineIcon className="size-3" />Pidió cambio</span>}
                        <time className="ml-auto shrink-0">{whenOf(activity.created_at)}</time>
                    </p>
                    <div className="ficha-msg__body" dangerouslySetInnerHTML={{ __html: html(activity.activity_description ?? '') }} />
                </div>
            </article>
        )
    }

    const Icon = ICONS[entry.icon]
    return (
        <p className="ficha-sys" title={entry.names.length > 1 ? entry.names.join('\n') : undefined}>
            <span><Icon className="size-3.5" /></span>
            <span className="min-w-0"><b>{firstName(who)}</b> {systemText(entry)} <time>· {whenOf(activity.created_at)}</time></span>
        </p>
    )
}

/**
 * La conversación del pedido: arriba se escribe y abajo queda todo, lo más nuevo primero. Los comentarios y
 * las correcciones van en globo; los movimientos (etapa, responsable, archivos) son una línea discreta.
 */
const SheetConversation = ({ task }: { task: ITask }) => {
    const queryClient = useQueryClient()
    const key = sheetKeys.activity(task.id)
    const [filter, setFilter] = useState<Filter>('all')
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const client = clientOf(task)

    /* Se pide todo una vez y se filtra aquí: los botones responden al instante y dicen cuántos hay */
    const { response, loading } = useFetchQuery<ITaskActivity[]>(replaceRecordIdInPath(API_ROUTES.TASKS.GET_ACTIVITY, task.id), {
        customQueryKey: key,
        queryParams: { activity_type: 'all' },
        enabled: Boolean(task.id),
    })
    const activities = useMemo(() => Array.isArray(response) ? response : [], [response])
    const counts = {
        comment: activities.filter(item => item.activity_type === 'comment').length,
        request_correction: activities.filter(item => item.activity_type === 'request_correction').length,
    }
    const entries = useMemo(() => timelineOf(filter === 'all' ? activities : activities.filter(item => item.activity_type === filter)), [activities, filter])

    const send = async () => {
        const comment = text.trim()
        if (!comment || sending) return
        setSending(true)
        try {
            const created = await TasksService.storeComment(task.id, comment)
            if (created?.data) queryClient.setQueryData<ITaskActivity[]>(key, current => [created.data, ...(Array.isArray(current) ? current : [])])
            setText('')
        } catch (error) {
            toast.error(errorText(error, 'No se pudo enviar el comentario'))
        } finally {
            setSending(false)
        }
    }

    const chip = (value: Filter, label: string, count?: number) => (
        <button type="button" onClick={() => setFilter(value)} className={cn('ficha-chip', filter === value && 'on')}>
            {label}{count ? <span className="tabular-nums opacity-70">{count}</span> : null}
        </button>
    )

    return (
        <section className="ficha-card">
            <h3 className="ficha-h">Conversación</h3>

            <div className="ficha-composer">
                {/* Nunca apagado mientras se envía: un cuadro apagado suelta el foco (y se pierde lo que sigue) */}
                <AutoTextarea
                    value={text}
                    onChange={event => setText(event.target.value)}
                    onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() } }}
                    placeholder="Escribe un comentario…"
                    aria-label="Comentario"
                />
                <div className="flex items-center gap-2">
                    <span className="ficha-sub min-w-0 flex-1 leading-snug">
                        {client
                            ? <><EyeIcon className="mr-1 inline size-3.5 align-[-2px]" />{firstName(client.name)} también lo ve en su pedido.</>
                            : task.assigned_to ? `Le llega aviso a ${firstName(task.assigned_to.name)}.` : 'Enter envía · Mayús+Enter, otro renglón'}
                    </span>
                    <button type="button" className="ficha-btn sm cta" disabled={!text.trim() || sending} onClick={send}>
                        <SendIcon className="size-3.5" />{sending ? 'Enviando…' : 'Comentar'}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {chip('all', 'Todo')}
                {chip('comment', 'Comentarios', counts.comment)}
                {chip('request_correction', 'Correcciones', counts.request_correction)}
            </div>

            <div className="ficha-timeline">
                {loading && !response && Array.from({ length: 3 }, (_, index) => <span key={index} className="h-10 animate-pulse rounded-xl bg-foreground/[.05]" />)}
                {!loading && !entries.length && (
                    <p className="ficha-sub py-3 text-center">{filter === 'all' ? 'Todavía no hay movimientos.' : filter === 'comment' ? 'Sin comentarios.' : 'Nadie ha pedido correcciones.'}</p>
                )}
                {entries.map(entry => <Entry key={entry.activity.id ?? `${entry.activity.created_at}-${entry.kind}`} entry={entry} />)}
            </div>
        </section>
    )
}

export default SheetConversation
