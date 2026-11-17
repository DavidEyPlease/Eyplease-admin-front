import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2Icon, ChevronDownIcon, CircleDashedIcon, CircleIcon, ExternalLinkIcon, MinusCircleIcon, Trash2Icon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { PostArtifact } from '@/interfaces/posts'
import { PrepItem, PrepPart, PrepState } from '@/interfaces/monthPrep'
import { cn } from '@/lib/utils'

const PILL: Record<PrepState, { label: string, css: string }> = {
    ready: { label: 'Listo', css: 'done' },
    partial: { label: 'A medias', css: 'day' },
    missing: { label: 'Falta', css: 'art' },
    skipped: { label: 'No va', css: 'off' },
}

const FORMATS: { key: PostArtifact, label: string }[] = [
    { key: 'image', label: 'Vertical' },
    { key: 'image_square', label: 'Cuadrada' },
    { key: 'video', label: 'Video' },
]

export const StateIcon = ({ state }: { state: PrepState }) => {
    if (state === 'ready') return <CheckCircle2Icon className="prep-ic ok" />
    if (state === 'partial') return <CircleDashedIcon className="prep-ic half" />
    if (state === 'skipped') return <MinusCircleIcon className="prep-ic off" />
    return <CircleIcon className="prep-ic no" />
}

/** Los diseños de una sección, juntos por momento (el cierre que sale a principios de mes, y los del mes) */
const DesignsDetail = ({ parts }: { parts: PrepPart[] }) => {
    const [showReady, setShowReady] = useState(false)
    const readyCount = parts.filter(part => part.ready).length
    const shown = showReady ? parts : parts.filter(part => !part.ready)

    const moments = new Map<string, { month?: number, items: PrepPart[] }>()
    shown.forEach(part => {
        const key = part.moment ?? ''
        const group = moments.get(key) ?? { month: part.month, items: [] }
        group.items.push(part)
        moments.set(key, group)
    })

    return (
        <div className="prep-detail">
            {[...moments.entries()].map(([moment, group]) => (
                <div key={moment} className="grid gap-1">
                    <div className="prep-moment">
                        <span>{moment}</span>
                        {group.month && (
                            <Link to={`${APP_ROUTES.TEMPLATES.POSTS}?mes=${group.month}`} className="prep-link">
                                Plantillas del mes {group.month} <ExternalLinkIcon className="size-3" />
                            </Link>
                        )}
                    </div>
                    <div className="prep-design hd">
                        <span>Diseño</span>
                        {FORMATS.map(format => <span key={format.key}>{format.label}</span>)}
                    </div>
                    {group.items.map(part => (
                        <div key={part.key} className={cn('prep-design', part.ready && 'ok')}>
                            <span className="min-w-0">
                                {part.label}
                                {part.scope_label && <span className="pub-tag">{part.scope_label}</span>}
                            </span>
                            {FORMATS.map(format => {
                                const state = part.formats?.[format.key] ?? 'off'
                                return (
                                    <span key={format.key} className={cn('prep-fmt', state)}>
                                        {state === 'ready' ? 'Está' : state === 'missing' ? 'Falta' : '—'}
                                    </span>
                                )
                            })}
                        </div>
                    ))}
                </div>
            ))}
            {readyCount > 0 && (
                <button type="button" className="prep-more" onClick={() => setShowReady(value => !value)}>
                    {showReady ? 'Ocultar los que ya están' : `Ver también los ${readyCount} que ya están`}
                </button>
            )}
        </div>
    )
}

interface Props {
    item: PrepItem
    saving: boolean
    onMark: (key: string, state: 'done' | 'skip' | null) => void
    onToggleCustom?: (id: string, done: boolean) => void
    onRemoveCustom?: (id: string) => void
}

/** Un renglón de la lista: qué es, para cuándo, en qué va y qué se puede hacer a mano. */
const ItemRow = ({ item, saving, onMark, onToggleCustom, onRemoveCustom }: Props) => {
    const [open, setOpen] = useState(false)
    const pill = PILL[item.state]
    const isDesigns = item.key.startsWith('posts:')
    const hasDetail = item.parts.length > 0
    const markedDone = item.mark?.state === 'done'
    const skipped = item.state === 'skipped'

    return (
        <div className={cn('prep-item', skipped && 'skipped')}>
            <div className="prep-row">
                {item.source === 'custom' || item.source === 'manual' ? (
                    <button
                        type="button"
                        disabled={saving || skipped}
                        className="prep-check"
                        aria-label={item.state === 'ready' ? 'Quitar palomita' : 'Palomear'}
                        onClick={() => item.source === 'custom'
                            ? onToggleCustom?.(item.id as string, item.state !== 'ready')
                            : onMark(item.key, item.state === 'ready' ? null : 'done')}
                    >
                        <StateIcon state={item.state} />
                    </button>
                ) : <span className="prep-check static"><StateIcon state={item.state} /></span>}

                <span className="pub-name min-w-0">
                    <b>{item.title}</b>
                    <small>
                        {item.detail}
                        {markedDone && item.auto_state !== 'ready' && item.source === 'auto' && ` · palomeado a mano${item.mark?.by ? ` por ${item.mark.by}` : ''}`}
                        {skipped && item.mark?.by && ` · ${item.mark.by} marcó que no va`}
                    </small>
                </span>

                <span className="prep-when">{item.when}</span>

                <span className={`pub-pill ${pill.css}`}>{pill.label}</span>

                <span className="prep-actions">
                    {hasDetail && (
                        <button type="button" className={cn('prep-toggle', open && 'open')} onClick={() => setOpen(value => !value)}>
                            {isDesigns ? 'Diseños' : 'Detalle'} <ChevronDownIcon className="size-3.5" />
                        </button>
                    )}
                    {item.source !== 'custom' && item.can_mark_done && item.auto_state !== 'ready' && !skipped && (
                        <button type="button" disabled={saving} className="prep-text-btn" onClick={() => onMark(item.key, markedDone ? null : 'done')}>
                            {markedDone ? 'Quitar palomita' : 'Ya está'}
                        </button>
                    )}
                    {item.source !== 'custom' && (skipped || item.state === 'missing' || item.state === 'partial') && (
                        <button type="button" disabled={saving} className="prep-text-btn" onClick={() => onMark(item.key, skipped ? null : 'skip')}>
                            {skipped ? 'Sí va' : 'No va este mes'}
                        </button>
                    )}
                    {item.source === 'custom' && (
                        <button type="button" disabled={saving} className="prep-icon-btn" aria-label="Quitar pendiente" onClick={() => onRemoveCustom?.(item.id as string)}>
                            <Trash2Icon className="size-3.5" />
                        </button>
                    )}
                </span>
            </div>

            {open && hasDetail && (isDesigns ? <DesignsDetail parts={item.parts} /> : (
                <div className="prep-detail flex flex-wrap gap-2">
                    {item.parts.map(part => (
                        <span key={part.key} className={cn('pub-chip', part.ready ? 'ok' : 'bad')}>
                            {!part.ready && <i />}{part.label}{part.ready ? ' · listo' : ' · falta'}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default ItemRow
