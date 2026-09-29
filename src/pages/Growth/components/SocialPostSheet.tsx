import { useEffect, useRef, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ExternalLinkIcon, ImagePlusIcon, Loader2Icon, RotateCcwIcon, SendIcon, Trash2Icon, XIcon } from 'lucide-react'

import { SocialChannel, SocialFormat, SocialMedia, SocialPost, SocialPostInput } from '@/interfaces/social'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/uishadcn/ui/sheet'

import { CHANNELS, FLOW, FORMATS, STATUS, flowStep, fromLocalInput, missingToApprove, timeText, toLocalInput } from '../social.utils'
import { SocialActions } from '../useSocial'

interface Props {
    open: boolean
    /** null = publicación nueva */
    post: SocialPost | null
    /** Día que se tocó en el calendario, para la nueva */
    defaultDate?: string | null
    pillars: Array<{ key: string, label: string }>
    actions: SocialActions
    onClose: () => void
    onSaved: (post: SocialPost) => void
}

const CAPTION_MAX = 2200
const FIELD = 'w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-[13.5px] outline-none transition-colors focus:border-[#6C47FF]/60'
const LABEL = 'text-[11px] font-extrabold tracking-[.08em] text-muted-foreground uppercase'

/**
 * La ficha de una publicación: se ve, se edita y se mueve de paso. Lo programado o publicado se lee (con sus números);
 * para cambiarlo se regresa primero a «por aprobar».
 */
const SocialPostSheet = ({ open, post, defaultDate, pillars, actions, onClose, onSaved }: Props) => {
    const [title, setTitle] = useState('')
    const [pillar, setPillar] = useState<string>('')
    const [format, setFormat] = useState<SocialFormat>('post')
    const [channels, setChannels] = useState<SocialChannel[]>(['ig', 'fb'])
    const [when, setWhen] = useState('')
    const [caption, setCaption] = useState('')
    const [media, setMedia] = useState<SocialMedia[]>([])
    const [note, setNote] = useState('')
    const [asking, setAsking] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) return
        setTitle(post?.title ?? '')
        setPillar(post?.pillar ?? '')
        setFormat(post?.format ?? 'post')
        setChannels(post?.channels ?? ['ig', 'fb'])
        setWhen(toLocalInput(post?.scheduled_at) || (defaultDate ? `${defaultDate}T19:00` : ''))
        setCaption(post?.caption ?? '')
        setMedia(post?.media ?? [])
        setNote('')
        setAsking(false)
    }, [open, post, defaultDate])

    const editable = !post || ['idea', 'production', 'review', 'failed'].includes(post.status)
    const working = actions.busy === (post?.id ?? 'new') || actions.busy === 'upload'
    const input = (): SocialPostInput => ({
        title: title.trim(), pillar: pillar || null, format, channels, caption: caption.trim() || null, scheduled_at: fromLocalInput(when), media,
    })
    const dirty = !post || JSON.stringify(input()) !== JSON.stringify({
        title: post.title, pillar: post.pillar, format: post.format, channels: post.channels, caption: post.caption, scheduled_at: post.scheduled_at ? fromLocalInput(toLocalInput(post.scheduled_at)) : null, media: post.media,
    })

    const save = async () => {
        if (!title.trim()) return
        const saved = await actions.save(post, input())
        if (saved) onSaved(saved)
        return saved
    }
    const saveAndApprove = async () => {
        const saved = dirty ? await save() : post
        if (saved) {
            const approved = await actions.approve(saved)
            if (approved) onSaved(approved)
        }
    }
    const addFiles = async (files: FileList | null) => {
        for (const file of Array.from(files ?? [])) {
            const uploaded = await actions.upload(file)
            if (uploaded) setMedia(prev => [...prev, uploaded])
        }
        if (fileRef.current) fileRef.current.value = ''
    }
    const move = (index: number, delta: number) => setMedia(prev => {
        const next = [...prev]
        const [item] = next.splice(index, 1)
        next.splice(index + delta, 0, item)
        return next
    })

    /* Lo que falta para aprobar, sobre lo que hay en pantalla (guardado o no) */
    const missing = missingToApprove({ ...(post ?? {}), ...input(), caption, media } as SocialPost)
    const step = post ? flowStep(post.status) : 0
    const metrics = post?.metrics

    return (
        <Sheet open={open} onOpenChange={value => !value && onClose()}>
            <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[520px]">
                <SheetHeader className="border-b border-border px-5 py-4">
                    <SheetTitle className="pr-8 text-[17px] font-extrabold tracking-tight">{post ? post.title : 'Publicación nueva'}</SheetTitle>
                    <SheetDescription className="text-[12px]">
                        {post
                            ? <span className={cn('pulse-tag', STATUS[post.status].tone)}>{STATUS[post.status].label}</span>
                            : 'Guárdala como idea o, con su pieza, déjala por aprobar.'}
                        {post?.approved_by && post.status === 'scheduled' && <span className="ml-2">Aprobó {post.approved_by.split(' ')[0]}</span>}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 px-5 py-4">
                    {post && (
                        <div className="vta-steps">
                            {FLOW.map((status, index) => (
                                <span key={status} className={cn(index < step && 'done', index === step && 'now')}>
                                    {index > 0 && <b className={cn(index <= step && 'done')} />}
                                    <i />
                                    {STATUS[status].label}
                                </span>
                            ))}
                        </div>
                    )}

                    {post?.change_note && (post.status === 'production' || post.status === 'idea') && (
                        <p className="gro-insight"><b>Cambio pedido:</b> {post.change_note}</p>
                    )}
                    {post?.last_error && (
                        <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-600 dark:text-rose-300">
                            <b>Meta contestó:</b> {post.last_error}{post.status === 'scheduled' && ` · se reintenta sola (intento ${post.attempts} de 3)`}
                        </p>
                    )}

                    <label className="grid gap-1.5">
                        <span className={LABEL}>Nombre interno</span>
                        <input className={FIELD} value={title} disabled={!editable} maxLength={160} onChange={event => setTitle(event.target.value)} placeholder="Ej. Tu asistente, a distancia" />
                    </label>

                    <div className="grid gap-1.5">
                        <span className={LABEL}>Pieza</span>
                        <div className="grid grid-cols-3 gap-2">
                            {media.map((item, index) => (
                                <div key={item.url} className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-foreground/5">
                                    {item.type === 'video'
                                        ? <video src={item.url} className="size-full object-cover" muted playsInline />
                                        : <img src={item.url} alt="" className="size-full object-cover" />}
                                    <span className="absolute top-1.5 left-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-[10px] font-extrabold text-white">{index + 1}</span>
                                    {editable && (
                                        <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                            <span className="flex gap-1">
                                                {index > 0 && <button type="button" title="Antes" className="grid size-6 place-items-center rounded-full bg-black/60 text-white" onClick={() => move(index, -1)}><ArrowUpIcon className="size-3.5 -rotate-90" /></button>}
                                                {index < media.length - 1 && <button type="button" title="Después" className="grid size-6 place-items-center rounded-full bg-black/60 text-white" onClick={() => move(index, 1)}><ArrowDownIcon className="size-3.5 -rotate-90" /></button>}
                                            </span>
                                            <button type="button" title="Quitar" className="grid size-6 place-items-center rounded-full bg-black/60 text-white" onClick={() => setMedia(prev => prev.filter((_, i) => i !== index))}><XIcon className="size-3.5" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {editable && media.length < 10 && (
                                <button type="button" disabled={working} onClick={() => fileRef.current?.click()} className="grid aspect-[4/5] place-items-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-[#6C47FF]/50 hover:text-foreground">
                                    <span className="grid justify-items-center gap-1 text-[11.5px] font-bold">
                                        {actions.busy === 'upload' ? <Loader2Icon className="size-5 animate-spin" /> : <ImagePlusIcon className="size-5" />}
                                        {actions.busy === 'upload' ? 'Subiendo…' : 'Agregar'}
                                    </span>
                                </button>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" multiple hidden onChange={event => addFiles(event.target.files)} />
                        <small className="text-[11px] text-muted-foreground">Feed 1080×1350 · historia y reel 1080×1920. En carrusel salen en este orden.</small>
                    </div>

                    <div className="grid gap-1.5">
                        <span className={LABEL}>Formato</span>
                        <div className="flex flex-wrap gap-1.5">
                            {FORMATS.map(item => (
                                <button key={item.key} type="button" title={item.hint} disabled={!editable} onClick={() => setFormat(item.key)} className={cn('gro-chip', format === item.key && 'on')}>{item.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <span className={LABEL}>Dónde sale</span>
                            <div className="flex flex-wrap gap-1.5">
                                {CHANNELS.map(item => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        disabled={!editable}
                                        onClick={() => setChannels(prev => prev.includes(item.key) ? prev.filter(value => value !== item.key) : [...prev, item.key])}
                                        className={cn('gro-chip', channels.includes(item.key) && 'on')}
                                    >
                                        {channels.includes(item.key) && <CheckIcon className="mr-1 size-3" />}{item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="grid gap-1.5">
                            <span className={LABEL}>Cuándo</span>
                            <input type="datetime-local" className={FIELD} value={when} disabled={!editable} onChange={event => setWhen(event.target.value)} />
                        </label>
                    </div>

                    <label className="grid gap-1.5">
                        <span className={LABEL}>Tema</span>
                        <select className={FIELD} value={pillar} disabled={!editable} onChange={event => setPillar(event.target.value)}>
                            <option value="">Sin tema</option>
                            {pillars.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                        </select>
                    </label>

                    <label className="grid gap-1.5">
                        <span className="flex items-center justify-between">
                            <span className={LABEL}>Texto de la publicación</span>
                            <small className={cn('text-[11px] tabular-nums text-muted-foreground', caption.length > CAPTION_MAX && 'text-rose-500')}>{caption.length} / {CAPTION_MAX}</small>
                        </span>
                        <textarea className={cn(FIELD, 'min-h-[150px] resize-y leading-relaxed')} value={caption} disabled={!editable} onChange={event => setCaption(event.target.value)} placeholder="Lo que dice el post. En Instagram las ligas no se pueden tocar: di «liga en la bio»." />
                    </label>

                    {metrics && (
                        <div className="grid gap-2">
                            <span className={LABEL}>Cómo le fue {post?.metrics_at && <span className="normal-case tracking-normal">· {timeText(post.metrics_at)}</span>}</span>
                            {(['ig', 'fb'] as SocialChannel[]).filter(channel => metrics[channel]).map(channel => (
                                <div key={channel} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[14px] border border-border px-3 py-2 text-[12.5px]">
                                    <b>{channel === 'ig' ? 'Instagram' : 'Facebook'}</b>
                                    {[['reach', 'la vieron'], ['likes', 'me gusta'], ['comments', 'comentarios'], ['saved', 'guardados'], ['shares', 'compartidos'], ['replies', 'respuestas']].map(([key, label]) => {
                                        const value = metrics[channel]?.[key as keyof NonNullable<typeof metrics.ig>]
                                        return value != null ? <span key={key} className="text-muted-foreground"><b className="text-foreground tabular-nums">{Number(value).toLocaleString('es-MX')}</b> {label}</span> : null
                                    })}
                                    {post?.results?.[channel]?.permalink && <a href={post.results[channel]!.permalink!} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 font-bold text-[#6C47FF] dark:text-[#A894FF]">Verla <ExternalLinkIcon className="size-3" /></a>}
                                </div>
                            ))}
                        </div>
                    )}

                    {asking && (
                        <label className="grid gap-1.5">
                            <span className={LABEL}>¿Qué le cambio?</span>
                            <textarea autoFocus className={cn(FIELD, 'min-h-[80px]')} value={note} onChange={event => setNote(event.target.value)} placeholder="Ej. la foto más cálida, y el texto más corto" />
                        </label>
                    )}
                </div>

                <div className="sticky bottom-0 mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-background/90 px-5 py-3 backdrop-blur">
                    {post && editable && post.status !== 'published' && !asking && (
                        <button type="button" disabled={working} className="vta-btn ghost" onClick={async () => { if (window.confirm('¿Borrar esta publicación?') && await actions.remove(post)) onClose() }}>
                            <Trash2Icon className="size-3.5" /> Borrar
                        </button>
                    )}
                    <span className="flex-1" />

                    {asking ? <>
                        <button type="button" className="vta-btn ghost" onClick={() => setAsking(false)}>Cancelar</button>
                        <button type="button" disabled={working} className="vta-btn gro-primary" onClick={async () => { if (post) { const done = await actions.requestChange(post, note.trim()); if (done) onSaved(done) } }}>Mandar a cambios</button>
                    </> : <>
                        {post?.status === 'scheduled' && <>
                            <button type="button" disabled={working} className="vta-btn" onClick={async () => { const done = await actions.unschedule(post); if (done) onSaved(done) }}><RotateCcwIcon className="size-3.5" /> Quitar de programadas</button>
                            <button type="button" disabled={working} className="vta-btn gro-primary" onClick={async () => { const done = await actions.publishNow(post); if (done) onSaved(done) }}><SendIcon className="size-3.5" /> Publicar ya</button>
                        </>}
                        {post && post.status === 'review' && (
                            <button type="button" disabled={working} className="vta-btn" onClick={() => setAsking(true)}>Pedir un cambio</button>
                        )}
                        {editable && (dirty || !post) && (
                            <button type="button" disabled={working || !title.trim()} className="vta-btn" onClick={save}>{working ? 'Guardando…' : post ? 'Guardar' : 'Guardar como idea'}</button>
                        )}
                        {editable && (
                            <button
                                type="button"
                                disabled={working || !title.trim() || missing.length > 0}
                                title={missing.length ? `Falta: ${missing.join(', ')}` : 'Sale sola a su hora'}
                                className="vta-btn gro-primary"
                                onClick={saveAndApprove}
                            >
                                <CheckIcon className="size-3.5" /> Aprobar
                            </button>
                        )}
                    </>}
                </div>
                {editable && missing.length > 0 && (post || media.length > 0) && (
                    <p className="px-5 pb-3 text-[11.5px] text-muted-foreground">Para aprobarla falta: {missing.join(', ')}.</p>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default SocialPostSheet
