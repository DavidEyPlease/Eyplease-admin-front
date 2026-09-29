import { CalendarDaysIcon, ExternalLinkIcon, MapPinIcon, SparklesIcon, VideoIcon } from 'lucide-react'

import { IEvent } from '@/interfaces/events'
import { ITask, isCloneReel } from '@/interfaces/tasks'
import AutoTextarea from './AutoTextarea'
import { dayOf, hourOf } from './lib'
import useTextDraft from './useTextDraft'

const AUDIENCE: Record<string, string> = { clientas: 'Sus clientas', unidad: 'Su unidad', prospectas: 'Prospectas' }

const Swatch = ({ label, value }: { label: string, value?: string }) => value ? (
    <span className="ficha-swatch" title={value}>
        <i style={{ background: value }} />
        <span><b>{label}</b>{value.toUpperCase()}</span>
    </span>
) : null

/** La invitación: si es presencial o en línea, sus fechas con lugar y, en línea, dónde se conecta */
const EventDetails = ({ event }: { event: IEvent }) => {
    const online = event.online_data
    const links = [
        online?.event_link && { label: 'Liga del evento', href: online.event_link },
        online?.facebook_group && { label: 'Grupo de Facebook', href: online.facebook_group },
    ].filter(Boolean) as Array<{ label: string, href: string }>

    return (
        <div className="ficha-event">
            <span className="ficha-tag w-fit">{event.event_type === 'online' ? 'Evento en línea' : 'Evento presencial'}</span>
            {(event.event_dates ?? []).map(date => (
                <div key={date.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold"><CalendarDaysIcon className="size-4 text-muted-foreground" />{dayOf(date.start_date)} · {hourOf(date.start_date)}</span>
                    {date.location && <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground"><MapPinIcon className="size-4 shrink-0" /><span className="min-w-0 break-words">{date.location}</span></span>}
                </div>
            ))}
            {online?.zoom_id && <p className="inline-flex items-center gap-1.5 text-[13px]"><VideoIcon className="size-4 text-muted-foreground" />Zoom <b className="tabular-nums">{online.zoom_id}</b></p>}
            {links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {links.map(link => (
                        <a key={link.label} href={/^https?:\/\//.test(link.href) ? link.href : `https://${link.href}`} target="_blank" rel="noreferrer" className="ficha-btn sm">
                            <ExternalLinkIcon className="size-3.5" />{link.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

/** Lo que pidió la Directora en un «Reel con mi clon». Sólo lectura: lo produce la Mac y llega aquí en MP4. */
const CloneReelDetails = ({ task }: { task: ITask }) => {
    const meta = task.metadata ?? {}
    return (
        <div className="ficha-event">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#5B47E0] dark:text-[#A99BFF]"><SparklesIcon className="size-4" />Reel con su clon</span>
            <dl className="grid gap-x-4 gap-y-2 text-[13px] sm:grid-cols-2">
                <div><dt className="ficha-sub">Tema</dt><dd className="font-semibold">{meta.topic || '—'}</dd></div>
                <div><dt className="ficha-sub">Producto</dt><dd className="font-semibold">{meta.product || 'Sin producto'}</dd></div>
                <div><dt className="ficha-sub">Para</dt><dd className="font-semibold">{AUDIENCE[meta.audience || ''] || 'Sus clientas'}</dd></div>
                <div><dt className="ficha-sub">Versiones</dt><dd className="font-semibold">{meta.variants || 1}</dd></div>
            </dl>
            <div>
                <p className="ficha-sub">Guion</p>
                <p className="text-[13px] leading-relaxed whitespace-pre-line">{meta.script || 'Lo escribe Astra a partir del tema.'}</p>
            </div>
            <p className="ficha-sub">Lo produce la Mac: guion e imágenes con Codex, clon animado con sus gestos y su voz.</p>
        </div>
    )
}

interface SheetBriefProps {
    task: ITask
    event: IEvent | null | undefined
    locked: boolean
    onSaveDescription: (value: string) => void
}

/**
 * «Lo que se pidió»: la descripción (se edita en su lugar y se guarda sola), quién lo pidió y, según el
 * pedido, sus colores, la invitación con fechas y lugar, o lo que pidió para su reel.
 */
const SheetBrief = ({ task, event, locked, onSaveDescription }: SheetBriefProps) => {
    /* Las invitaciones guardan su texto en el evento: si lo trae, ése es el que se lee (así era antes) */
    const saved = event?.description || task.description || ''
    const description = useTextDraft(saved, onSaveDescription)
    const colors = task.metadata?.primaryColor || task.metadata?.secondaryColor

    return (
        <section className="ficha-card">
            <h3 className="ficha-h">Lo que se pidió</h3>

            <AutoTextarea
                value={description.draft}
                onChange={event => description.onChange(event.target.value)}
                onFocus={description.onFocus}
                onBlur={description.onBlur}
                disabled={locked}
                placeholder={locked ? 'Sin descripción.' : 'Sin descripción. Escribe aquí qué se necesita…'}
                className="ficha-desc"
                aria-label="Descripción del pedido"
            />

            {colors && (
                <div className="flex flex-wrap gap-2">
                    <Swatch label="Primario" value={task.metadata.primaryColor} />
                    <Swatch label="Secundario" value={task.metadata.secondaryColor} />
                </div>
            )}

            {event && <EventDetails event={event} />}
            {isCloneReel(task) && <CloneReelDetails task={task} />}
        </section>
    )
}

export default SheetBrief
