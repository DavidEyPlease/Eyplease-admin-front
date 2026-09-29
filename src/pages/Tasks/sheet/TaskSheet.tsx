import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CalendarClockIcon, CheckCircle2Icon, CheckIcon, EyeIcon, MoreHorizontalIcon, SendIcon, Trash2Icon, XIcon } from 'lucide-react'

import { ITask, ITaskStatus, TaskStatusTypes, TaskTypes } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import Face from '../Face'
import { STAGES, dueInfo, kindInfo } from '../lib'
import AutoTextarea from './AutoTextarea'
import SheetBrief from './SheetBrief'
import SheetConfirm from './SheetConfirm'
import SheetConversation from './SheetConversation'
import SheetFacts from './SheetFacts'
import SheetFiles from './SheetFiles'
import SheetNexrender from './SheetNexrender'
import StageBar from './StageBar'
import { clientOf, dayOf, firstName, isLocked, nextStepOf, stageHint } from './lib'
import useSheetFiles from './useSheetFiles'
import useTaskSheet from './useTaskSheet'
import useTextDraft from './useTextDraft'
import '../board/board.css'
import './sheet.css'

const DUE_ICON = { review: EyeIcon, stale: EyeIcon, done: CheckCircle2Icon } as const

/**
 * La ficha de un pedido de diseño, con la piel nueva. Arriba lo que es y en qué etapa va (con el siguiente
 * paso en un botón); al centro lo que se pidió y los diseños en grande; a un lado los datos y la conversación.
 * Todo se guarda solo, con los mismos PATCH de siempre.
 */
const TaskSheet = ({ task, onClose }: { task: ITask, onClose: () => void }) => {
    const sheet = useTaskSheet(task)
    const { current, save } = sheet
    const statuses = useAuthStore(state => state.utilData.task_statuses)
    const { designs } = useSheetFiles(current)
    const [confirm, setConfirm] = useState<'complete' | 'delete' | null>(null)

    const locked = isLocked(current)
    const client = clientOf(current)
    const kind = kindInfo(current)
    const due = dueInfo(current)
    const DueIcon = DUE_ICON[due.tone as keyof typeof DUE_ICON] ?? CalendarClockIcon
    const next = nextStepOf(current)
    const hint = stageHint(current)
    const isTools = current.task_type?.slug === TaskTypes.TOOLS
    const published = isTools && current.task_status?.slug === TaskStatusTypes.PUBLISHED

    const title = useTextDraft(current.title ?? '', value => save({ title: value }, { title: value }))

    /** Cambiar de etapa: el mismo PATCH que al arrastrar en la mesa */
    const moveTo = (status: ITaskStatus) => {
        const stage = STAGES.find(item => item.statuses.includes(status.slug))
        const label = stage && stage.statuses.length > 1 && status.name !== stage.title ? status.name : stage?.title ?? status.name
        return save(
            { status: status.id },
            { task_status: status, ...(status.slug === TaskStatusTypes.UNASSIGNED ? { assigned_to: null } : {}) },
            `#${current.consecutive} pasó a «${label}»`,
        )
    }

    const pick = (slug: TaskStatusTypes) => {
        const status = statuses.find(item => item.slug === slug)
        if (!status || current.task_status?.slug === slug) return
        /* Completar uno de Biblioteca lo cierra: se pregunta antes, como siempre */
        if (slug === TaskStatusTypes.COMPLETED && isTools) return setConfirm('complete')
        moveTo(status)
    }

    const completed = statuses.find(item => item.slug === TaskStatusTypes.COMPLETED)
    const blocked = next?.needsDesigns && designs.length === 0

    return (
        <DialogPrimitive.Root open onOpenChange={open => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="ficha-overlay" />
                {/* Un archivo que se suelta fuera de «Diseños» no debe abrirse en la pestaña (y sacar del panel) */}
                <DialogPrimitive.Content
                    className="ficha"
                    aria-describedby={undefined}
                    onOpenAutoFocus={event => event.preventDefault()}
                    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() }}
                    onDrop={event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() }}
                >
                    <header className="ficha-head">
                        <div className="ficha-meta">
                            <span className="mesa-kind" style={{ ['--kind' as string]: kind.color }}><i />{kind.label}</span>
                            <span className="ficha-num">#{current.consecutive}</span>
                            {client && <span className="inline-flex min-w-0 items-center gap-1.5">de <Face user={client} size={18} /><b className="truncate text-foreground">{client.name}</b></span>}
                            {current.created_at && <span className="hidden sm:inline">· pedido el {dayOf(current.created_at)}</span>}
                            <span className={cn('ficha-saving', sheet.saving && 'on')} aria-live="polite">
                                {sheet.saving ? 'Guardando…' : sheet.savedAt ? <><CheckIcon className="size-3.5" />Guardado</> : null}
                            </span>
                            <div className="ficha-actions">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="ficha-x" aria-label="Más acciones"><MoreHorizontalIcon className="size-[18px]" /></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-56 rounded-2xl p-1.5">
                                        <DropdownMenuItem disabled={locked} className="cursor-pointer gap-2 rounded-xl text-[13px] font-semibold text-rose-600 focus:text-rose-600 dark:text-rose-400" onClick={() => setConfirm('delete')}>
                                            <Trash2Icon className="size-4" />Eliminar pedido…
                                        </DropdownMenuItem>
                                        {locked && <p className="max-w-56 px-2 pt-1 pb-1.5 text-[11px] leading-snug text-muted-foreground">Completado: ya no se puede eliminar.</p>}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DialogPrimitive.Close className="ficha-x" aria-label="Cerrar"><XIcon className="size-[18px]" /></DialogPrimitive.Close>
                            </div>
                        </div>

                        <DialogPrimitive.Title className="sr-only">Pedido #{current.consecutive}: {current.title}</DialogPrimitive.Title>
                        <AutoTextarea
                            value={title.draft}
                            onChange={event => title.onChange(event.target.value)}
                            onFocus={title.onFocus}
                            onBlur={title.onBlur}
                            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }}
                            disabled={locked}
                            maxLength={255}
                            className="ficha-title"
                            aria-label="Título del pedido"
                        />

                        <div className="ficha-stagerow">
                            <StageBar task={current} disabled={locked} onPick={pick} />
                            <span className={cn('ficha-due', due.tone)}><DueIcon className="size-3.5 shrink-0" />{due.text}</span>
                            {next && (
                                <button type="button" className="ficha-btn cta ml-auto" disabled={Boolean(blocked) || sheet.saving} title={blocked ? 'Sube primero los diseños' : undefined} onClick={() => pick(next.status)}>
                                    {next.status === TaskStatusTypes.COMPLETED ? <CheckCircle2Icon className="size-4" /> : <SendIcon className="size-4" />}{next.label}
                                </button>
                            )}
                        </div>
                        {(hint || blocked) && <p className="ficha-hint">{blocked ? `Sube los diseños para poder entregárselos${client ? ` a ${firstName(client.name)}` : ''}.` : hint}</p>}
                    </header>

                    <div className="ficha-body">
                        <div className="ficha-main">
                            <SheetBrief task={current} event={sheet.detail?.event} locked={locked} onSaveDescription={value => save({ description: value }, { description: value })} />
                            <SheetFiles task={current} onChanged={sheet.refreshActivity} />
                            {isTools && <SheetNexrender task={current} onChanged={sheet.refreshActivity} />}
                        </div>
                        <aside className="ficha-side">
                            <SheetFacts task={current} locked={locked} save={save} />
                            <SheetConversation task={current} />
                        </aside>
                    </div>

                    <SheetConfirm
                        open={confirm === 'complete'}
                        title={`¿Marcar #${current.consecutive} como completado?`}
                        lines={[
                            'Se cierra el pedido y la ficha ya no se podrá editar.',
                            designs.length ? 'Revisa que los diseños estén cargados y en su orden: son los que se publican.' : 'Ojo: no tiene ningún diseño cargado.',
                        ]}
                        confirm="Sí, completar"
                        onConfirm={() => completed && moveTo(completed)}
                        onClose={() => setConfirm(null)}
                    />
                    <SheetConfirm
                        open={confirm === 'delete'}
                        title={`¿Eliminar el pedido #${current.consecutive}?`}
                        lines={[
                            'Se borran también sus archivos y su conversación. No se puede deshacer.',
                            ...(client ? [`A ${firstName(client.name)} le desaparece de sus pedidos.`] : []),
                            ...(published ? ['Lo que ya se publicó en la biblioteca no se quita con esto: se despublica aparte.'] : []),
                        ]}
                        confirm="Eliminar"
                        danger
                        onConfirm={async () => { if (await sheet.remove()) onClose() }}
                        onClose={() => setConfirm(null)}
                    />
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

export default TaskSheet
