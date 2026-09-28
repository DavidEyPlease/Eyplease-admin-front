import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeftIcon, ImageUpIcon, SendIcon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'

import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { initials, titleCase } from '@/pages/Clients/List/names'
import { APP_ROUTES } from '@/constants/app'
import { Acomodo, ChallengeDetail } from '@/interfaces/challenges'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/uishadcn/ui/alert-dialog'

import BaseEditor, { Sample } from './components/BaseEditor'
import { STATE, TYPE_LABEL, dayLabel } from './retos.utils'
import { useChallengeActions, useChallengeDetail } from './useChallenges'
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import './retos.css'

const STEPS = ['Pedida a diseño', 'Entregada', 'Medida']

/** En qué paso va la base: 0 nada, 1 pedida, 2 entregada (por medir), 3 medida y lista. */
const stepOf = (detail: ChallengeDetail) => ({ sin_base: 0, esperando: 0, pedida: 1, por_medir: 2, lista: 3 })[detail.template.state]

/** Las ganadoras del reto con lo que ya se sabe de su pieza (publicada, en camino o esperando la base). */
const winnersOf = (detail: ChallengeDetail) => {
    const celebrated = new Map(detail.celebrated.map(entry => [entry.person_id, entry]))
    return detail.rows.filter(row => row.done).map(row => ({ row, entry: celebrated.get(row.id) ?? null }))
}

const ChallengeDetailPage = () => {
    const { id = '' } = useParams()
    const { response: detail, loading } = useChallengeDetail(id)
    const actions = useChallengeActions(id)
    const fileInput = useRef<HTMLInputElement>(null)
    const [uploaded, setUploaded] = useState<{ key: string, url: string } | null>(null)
    const [useCurrent, setUseCurrent] = useState(false)
    const [confirm, setConfirm] = useState<string[] | null>(null)

    const winners = useMemo(() => detail ? winnersOf(detail) : [], [detail])

    if (loading || !detail) {
        return <p className="mx-auto max-w-[1100px] text-[13px] text-muted-foreground">{loading ? 'Cargando el reto…' : 'No se encontró el reto.'}</p>
    }

    const state = STATE[detail.template.state]
    const step = stepOf(detail)
    const { candidate, base, acomodo, has_value: hasValue } = detail.template
    const pending = winners.filter(({ entry }) => !entry?.post_id).length

    /* Qué base se mide: la que subiste, la nueva que entregó diseño o la vigente (para ajustarla) */
    const working = uploaded
        ? { key: uploaded.key, url: uploaded.url, label: 'La base que subiste', initial: null as Acomodo | null, save: 'Guardar esta base' }
        : candidate?.url && !useCurrent
            ? { key: candidate.uri, url: candidate.url, label: 'La base nueva que entregó diseño', initial: null, save: 'Guardar base' }
            : base?.url
                ? { key: base.uri, url: base.url, label: 'La base vigente', initial: acomodo, save: 'Guardar cambios' }
                : null

    const samples: Sample[] = [
        { id: null, label: 'Persona de prueba (sin foto y nombre largo)', value: hasValue ? '1,502' : null },
        ...winners.map(({ row }) => ({ id: row.id, label: titleCase(row.name), value: hasValue ? row.current.toLocaleString('en-US') : null })),
    ]

    const onUpload = async (file: File | undefined) => {
        if (!file) return
        const key = await actions.upload(file, `private/challenges/${detail.client.id}/${detail.id}/plantilla/`)
        if (key) {
            setUploaded({ key, url: URL.createObjectURL(file) })
            toast.success('Base subida: mídela y guárdala')
        }
    }

    const askPublish = async () => {
        const result = await actions.celebrate(true)
        if (!result) return
        if (!result.winners.length) {
            toast.info('No hay ganadoras pendientes')
            return
        }
        setConfirm(result.winners.map(winner => titleCase(winner.person)))
    }

    const publish = async () => {
        setConfirm(null)
        const result = await actions.celebrate(false)
        if (result) toast.success(`Se están armando ${result.winners.length} ${result.winners.length === 1 ? 'pieza' : 'piezas'}: salen en Mi unidad → Retos en unos segundos`)
        window.setTimeout(() => actions.refresh(), 9000)
    }

    const range = `del ${dayLabel(detail.starts_on)} al ${dayLabel(detail.ends_on)}`
    const percent = detail.progress.goal ? Math.min(100, Math.round(100 * detail.progress.current / detail.progress.goal)) : 0

    return (
        <div className="mx-auto grid w-full max-w-[1180px] min-w-0 grid-cols-1 items-start gap-[18px] xl:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="pulse-rail order-2 grid gap-3.5 xl:order-1 xl:sticky xl:top-[90px]">
                <Link to={APP_ROUTES.CHALLENGES.LIST} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground">
                    <ArrowLeftIcon className="size-4" /> Todos los retos
                </Link>

                <section className="shell-glass grid gap-2.5 rounded-[22px] p-4">
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-primary/10 text-[12px] font-extrabold text-primary">{initials(detail.client.name)}</span>
                        <div className="min-w-0">
                            <b className="block truncate text-[13.5px] leading-tight">{titleCase(detail.client.name)}</b>
                            <small className="block text-[11.5px] text-muted-foreground">{detail.client.username}</small>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="rt-tag plain">{TYPE_LABEL[detail.type] ?? detail.type}</span>
                        <span className={cn('rt-tag', detail.is_open ? 'ok' : 'plain')}>{detail.is_open ? 'Abierto' : 'Cerrado'}</span>
                    </div>
                    <p className="text-[12px] leading-snug text-muted-foreground">
                        {detail.prize ? <>Premio: <b className="text-foreground">{detail.prize}</b> · </> : null}{range}
                    </p>
                    <div>
                        <div className="flex items-baseline justify-between gap-2 text-[12px]">
                            <span className="font-semibold">{detail.progress.detail ?? `${detail.progress.current} de ${detail.progress.goal}`}</span>
                        </div>
                        <div className="rt-bar mt-1.5"><i style={{ width: `${Math.max(percent, 3)}%` }} /></div>
                    </div>
                    {detail.piece?.url && (
                        <a href={detail.piece.url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-[14px] border border-border p-2 hover:bg-foreground/5">
                            <img src={detail.piece.url} alt="" className="h-14 w-10 shrink-0 rounded-md object-cover" />
                            <span className="min-w-0 text-[11.5px] leading-snug">
                                <b className="block">Su anuncio (kit)</b>
                                <span className="block truncate text-muted-foreground">{detail.kit_task?.title ?? 'Pedido de diseño'}</span>
                            </span>
                        </a>
                    )}
                </section>

                <section className="shell-glass grid gap-3 rounded-[22px] p-4">
                    <div>
                        <b className="block text-[13.5px]">La base de sus ganadoras</b>
                        <small className="block text-[11.5px] leading-snug text-muted-foreground">El diseño sin persona ni nombre. Se mide una vez y de ahí sale cada ganadora.</small>
                    </div>
                    <div className="vta-steps">
                        {STEPS.map((label, index) => (
                            <span key={label} className={cn((index + 1 < step || step === 3) && 'done', index + 1 === step && step !== 3 && 'now')}>
                                {index > 0 && <b className={cn(index < step && 'done')} />}
                                <i />
                                {label}
                            </span>
                        ))}
                    </div>
                    {detail.template.base_task && (
                        <p className="text-[11.5px] leading-snug text-muted-foreground">
                            Pedido: <b className="text-foreground">{detail.template.base_task.title}</b>
                            {detail.template.base_task.status_name ? ` · ${detail.template.base_task.status_name}` : ''}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {!detail.template.base_task && detail.template.state !== 'lista' && (
                            <button type="button" className="rt-btn cta" disabled={!!actions.busy} onClick={actions.requestBase}>
                                <SendIcon className="size-4" /> {actions.busy === 'request' ? 'Pidiendo…' : 'Pedir a diseño'}
                            </button>
                        )}
                        <button type="button" className="rt-btn" disabled={!!actions.busy} onClick={() => fileInput.current?.click()}>
                            <ImageUpIcon className="size-4" /> {actions.busy === 'upload' ? 'Subiendo…' : 'Subir una base'}
                        </button>
                        <input ref={fileInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { onUpload(event.target.files?.[0]); event.target.value = '' }} />
                    </div>
                </section>
            </aside>

            <div className="order-1 grid min-w-0 gap-[18px] xl:order-2">
                {isNewShell() ? (
                    <PageHead
                        eyebrow={`Operación · Retos · ${TYPE_LABEL[detail.type] ?? ''}`}
                        title={<>{detail.title}. <em className={cn(detail.template.state === 'lista' && '!bg-none !text-emerald-600 dark:!text-emerald-400')}>{state.label}.</em></>}
                        sub={state.hint}
                    />
                ) : (
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{detail.title} · {state.label}</h1>
                )}

                <section className="shell-glass grid min-w-0 grid-cols-1 gap-3 rounded-[22px] p-4 sm:p-5">
                    {working ? <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <b className="block text-[14.5px]">Medir la base</b>
                                <small className="block text-[11.5px] text-muted-foreground">{working.label}</small>
                            </div>
                            {!uploaded && candidate?.url && base?.url && (
                                <button type="button" className="rt-btn" onClick={() => setUseCurrent(!useCurrent)}>
                                    {useCurrent ? 'Medir la nueva' : 'Ver la vigente'}
                                </button>
                            )}
                            {uploaded && <button type="button" className="rt-btn" onClick={() => setUploaded(null)}>Quitar la que subí</button>}
                        </div>
                        <BaseEditor
                            key={working.key}
                            imageUrl={working.url}
                            hasValue={hasValue}
                            initial={working.initial}
                            samples={samples}
                            busy={actions.busy}
                            saveLabel={working.save}
                            onPreview={(layout, sample) => actions.preview(working.key, layout, sample.id, sample.value)}
                            onSave={async layout => {
                                const saved = await actions.save(working.key, layout)
                                if (saved) { setUploaded(null); setUseCurrent(false) }
                            }}
                        />
                    </> : (
                        <div className="grid place-items-center gap-2 px-4 py-10 text-center">
                            <SparklesIcon className="size-7 text-primary" />
                            <b className="text-[15px]">{detail.template.state === 'pedida' ? 'Esperando la base de diseño' : 'Todavía no hay base'}</b>
                            <p className="max-w-[52ch] text-[12.5px] text-muted-foreground">
                                {detail.template.state === 'pedida'
                                    ? 'Cuando diseño la entregue en su pedido, aparece aquí para medirla: dónde va la cara, el nombre y, si lleva, el número.'
                                    : 'Pídela a diseño o súbela tú: aparece aquí para medir dónde va la cara, el nombre y, si lleva, el número.'}
                            </p>
                        </div>
                    )}
                </section>

                <section className="shell-glass grid min-w-0 grid-cols-1 gap-3 rounded-[22px] p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <b className="block text-[14.5px]">Ganadoras · {winners.length}</b>
                            <small className="block text-[11.5px] text-muted-foreground">
                                {detail.template.state === 'lista'
                                    ? 'Las nuevas salen solas a las 8:50 y 14:10; las que esperan, con «Publicar pendientes».'
                                    : 'Esperan la base: salen todas en cuanto quede medida y la publiques.'}
                            </small>
                        </div>
                        <button type="button" className="rt-btn cta" disabled={!!actions.busy || detail.template.state !== 'lista' || pending === 0} onClick={askPublish}>
                            <SendIcon className="size-4" /> {actions.busy === 'celebrate' ? 'Revisando…' : `Publicar pendientes${pending ? ` (${pending})` : ''}`}
                        </button>
                    </div>

                    {winners.length === 0 && <p className="text-[12.5px] text-muted-foreground">Todavía nadie llega a la meta.</p>}

                    <ul className="grid min-w-0 grid-cols-1 gap-2">
                        {winners.map(({ row, entry }) => {
                            const published = !!entry?.post_id
                            const tag = published ? { tone: 'ok', text: entry?.photo === 'avatar' ? 'Publicada con avatar' : 'Publicada' }
                                : entry ? { tone: 'plain', text: 'Armándose…' }
                                    : detail.template.state === 'lista' ? { tone: 'hot', text: 'Por publicar' } : { tone: 'warn', text: 'Esperando la base' }
                            return (
                                <li key={row.id} className="flex min-w-0 items-center gap-3 rounded-[14px] border border-border px-3 py-2.5">
                                    {row.photo?.has_photo && row.photo.url
                                        ? <img src={row.photo.url} alt="" className="size-9 shrink-0 rounded-full object-cover" />
                                        : <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary">{initials(row.name)}</span>}
                                    <span className="min-w-0 flex-1">
                                        <b className="block truncate text-[13px]">{titleCase(row.name)}</b>
                                        <small className="block truncate text-[11.5px] text-muted-foreground">
                                            {row.returned_on ? `Regresó el ${dayLabel(row.returned_on)}` : `${row.current.toLocaleString('es-MX')} de ${row.goal.toLocaleString('es-MX')}`}
                                            {published && entry?.photo === 'avatar' && entry.avatar_reason ? ` · ${entry.avatar_reason}` : ''}
                                        </small>
                                    </span>
                                    <span className={cn('rt-tag shrink-0', tag.tone)}>{tag.text}</span>
                                    {row.piece?.url && (
                                        <a href={row.piece.url} target="_blank" rel="noreferrer" title="Ver su pieza" className="shrink-0 overflow-hidden rounded-lg border border-border">
                                            <img src={row.piece.url} alt="Su pieza" className="h-12 w-8 object-cover" />
                                        </a>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </section>
            </div>

            <AlertDialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Publicar {confirm?.length === 1 ? 'la pieza' : `las ${confirm?.length} piezas`}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirm?.join(', ')}. Salen en Mi unidad → Retos de {titleCase(detail.client.name)} y le llega un aviso al celular por cada una.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Todavía no</AlertDialogCancel>
                        <AlertDialogAction onClick={publish}>Publicar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ChallengeDetailPage
