import { ReactNode, useMemo, useRef, useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, ImageUpIcon, Loader2Icon, TrendingUpIcon, UploadIcon, UsersIcon } from "lucide-react";

import { API_ROUTES } from "@/constants/api";
import { Company, companyInfo } from "@/constants/companies";
import useRequestQuery from "@/hooks/useRequestQuery";
import { cn } from "@/lib/utils";
import { replaceRecordIdInPath } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import { parseRoster, ROSTER_COLUMNS, RosterPayload, RosterResult } from "./roster";
import { dayLabel } from "./utils";

const inputClass = "h-10 w-full min-w-0 rounded-xl border border-border bg-card/70 px-3 text-[13.5px] outline-none transition-colors focus:border-[#6C47FF]"
const labelClass = "text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase"

/** El texto del error de la API tal cual (la validación manda `message`; los errores de negocio, también) */
const apiMessage = (error: unknown) => (error as { message?: string } | null)?.message || 'La API no dijo qué pasó. Intenta de nuevo.'

const Field = ({ label, hint, children }: { label: string, hint?: ReactNode, children: ReactNode }) => (
    <label className="grid min-w-0 gap-1">
        <span className={labelClass}>{label}</span>
        {children}
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
)

const Section = ({ icon, title, sub, children }: { icon: ReactNode, title: string, sub: ReactNode, children: ReactNode }) => (
    <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold"><span className="text-[#6C47FF] dark:text-[#A894FF]">{icon}</span>{title}</h2>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3">{children}</div>
    </section>
)

const ErrorBox = ({ children }: { children: ReactNode }) => (
    <p className="flex gap-2 rounded-xl bg-rose-100 px-3 py-2 text-[12.5px] font-semibold text-rose-800 dark:bg-rose-400/15 dark:text-rose-300">
        <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" /><span className="min-w-0 break-words">{children}</span>
    </p>
)

const Count = ({ label, value }: { label: string, value: number }) => (
    <div className="rounded-2xl border border-border px-3 py-2.5">
        <p className={labelClass}>{label}</p>
        <p className="text-[20px] font-extrabold tabular-nums">{value}</p>
    </div>
)

/** Hoy en la hora del navegador (la de México para el equipo), como «AAAA-MM-DD» */
const today = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Cargar su grupo: el CSV que sale de su portal, pegado o subido. Antes de mandarlo se ve cuántas personas trae y qué
 * renglones están mal; con un error no se manda nada (con «apagar a quien ya no viene», mandar la lista a medias
 * apagaría a quien sí sigue).
 */
const RosterUpload = ({ clientId, company }: { clientId: string, company: Company }) => {
    const info = companyInfo(company)
    const [text, setText] = useState('')
    const [fileName, setFileName] = useState<string | null>(null)
    const [deactivateMissing, setDeactivateMissing] = useState(false)
    const [leaderRank, setLeaderRank] = useState('')
    const [result, setResult] = useState<RosterResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInput = useRef<HTMLInputElement>(null)

    const parsed = useMemo(() => text.trim() ? parseRoster(text, company) : null, [text, company])
    const ready = !!parsed && !parsed.missingColumns.length && !parsed.errors.length && parsed.people.length > 0

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.detail('client-insights', clientId), queryKeys.listBase(`client/${clientId}/network`)],
        onError: () => undefined,
    })

    const onPickFile = async (file: File | undefined) => {
        if (!file) return
        setText(await file.text())
        setFileName(file.name)
        setResult(null)
        setError(null)
        if (fileInput.current) fileInput.current.value = ''
    }

    const onSend = async () => {
        if (!parsed || !ready) return
        setError(null)
        setResult(null)
        try {
            const response = await request<RosterPayload, RosterResult>('POST', replaceRecordIdInPath(API_ROUTES.CLIENTS.COMPANY_ROSTER, clientId), {
                ...(leaderRank ? { leader_rank_key: leaderRank } : {}),
                deactivate_missing: deactivateMissing,
                people: parsed.people,
            })
            if (response.success) setResult(response.data)
            else setError(response.message || 'La API no aceptó el grupo.')
        } catch (exception) {
            setError(apiMessage(exception))
        }
    }

    return (
        <Section icon={<UsersIcon className="size-4" />} title="Cargar su grupo" sub={`Las personas de su grupo en ${info.label}, como vienen de su portal. Quien ya estaba se actualiza; quien no, se crea.`}>
            <p className="rounded-xl bg-foreground/[.04] px-3 py-2 text-[12px] text-muted-foreground">
                Un renglón por persona, con encabezado: <span className="font-mono text-[11.5px] break-all text-foreground">{ROSTER_COLUMNS.join(',')}</span>.
                Sólo <b>code</b> y <b>name</b> son obligatorias. Fechas en AAAA-MM-DD (o DD/MM/AAAA); el rango con su nombre («{info.ranks[1]?.label ?? 'Perla'}») o su llave; gender: female, male o vacío.
            </p>

            <Field label="Pega aquí su grupo" hint={fileName ? `Leído de ${fileName}` : 'O sube el archivo .csv'}>
                <textarea
                    value={text}
                    onChange={event => { setText(event.target.value); setFileName(null); setResult(null); setError(null) }}
                    rows={7}
                    spellCheck={false}
                    placeholder={`${ROSTER_COLUMNS.join(',')}\n123456,Ana Pérez,1990-05-14,2025-01-10,2026-11-02,Activa,Perla,5512345678,female`}
                    className="min-h-36 w-full min-w-0 rounded-xl border border-border bg-card/70 px-3 py-2 font-mono text-[12px] outline-none transition-colors focus:border-[#6C47FF]"
                />
            </Field>

            <div className="flex flex-wrap items-center gap-2">
                <input ref={fileInput} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={event => onPickFile(event.target.files?.[0])} />
                <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-[12.5px] font-bold transition-colors hover:border-[#6C47FF]/40">
                    <UploadIcon className="size-3.5" /> Subir CSV
                </button>
                {text && <button type="button" onClick={() => { setText(''); setFileName(null); setResult(null); setError(null) }} className="h-9 cursor-pointer rounded-xl px-3 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">Borrar</button>}
            </div>

            {parsed && (parsed.missingColumns.length ? (
                <ErrorBox>Al encabezado le falta {parsed.missingColumns.join(' y ')}. El primer renglón debe traer los nombres de las columnas.</ErrorBox>
            ) : (
                <div className="grid gap-2">
                    <p className="text-[13px]">
                        <b className="font-extrabold tabular-nums">{parsed.people.length}</b> {parsed.people.length === 1 ? 'persona lista' : 'personas listas'}
                        {parsed.errors.length > 0 && <> · <b className="font-extrabold text-rose-600 tabular-nums dark:text-rose-400">{parsed.errors.length}</b> {parsed.errors.length === 1 ? 'renglón con error' : 'renglones con error'}</>}
                    </p>
                    {parsed.errors.length > 0 && (
                        <ul className="grid max-h-40 gap-1 overflow-y-auto rounded-xl bg-rose-50 px-3 py-2 text-[12px] text-rose-800 dark:bg-rose-400/10 dark:text-rose-300">
                            {parsed.errors.slice(0, 50).map(item => <li key={`${item.line}-${item.message}`}><b className="font-bold">Renglón {item.line}:</b> {item.message}</li>)}
                            {parsed.errors.length > 50 && <li>… y {parsed.errors.length - 50} más.</li>}
                        </ul>
                    )}
                    {parsed.people.length > 0 && !parsed.errors.length && (
                        <p className="truncate text-[12px] text-muted-foreground">{parsed.people.slice(0, 4).map(person => person.name).join(', ')}{parsed.people.length > 4 ? ` y ${parsed.people.length - 4} más` : ''}.</p>
                    )}
                </div>
            ))}

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Rango de ella (la líder)" hint="Opcional: déjalo así si no cambió">
                    <select value={leaderRank} onChange={event => setLeaderRank(event.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                        <option value="">Sin cambiar</option>
                        {info.ranks.map(rank => <option key={rank.key} value={rank.key}>{rank.label}</option>)}
                    </select>
                </Field>
                <label className="flex cursor-pointer items-start gap-2.5 self-end rounded-xl border border-border px-3 py-2.5">
                    <input type="checkbox" checked={deactivateMissing} onChange={event => setDeactivateMissing(event.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#6C47FF]" />
                    <span className="grid gap-0.5">
                        <span className="text-[13px] font-bold">Apagar a quien ya no viene</span>
                        <span className="text-[11.5px] text-muted-foreground">Quien estaba en su grupo y no está en esta lista deja de contar.</span>
                    </span>
                </label>
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            {result && (
                <div className="grid gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[.06] p-3.5">
                    <p className="flex items-center gap-2 text-[13px] font-extrabold text-emerald-700 dark:text-emerald-400"><CheckCircle2Icon className="size-4" /> Grupo cargado</p>
                    <div className="grid grid-cols-3 gap-2">
                        <Count label="Nuevas" value={result.created} />
                        <Count label="Actualizadas" value={result.updated} />
                        <Count label="Apagadas" value={result.deactivated} />
                    </div>
                    {result.rank_ups.length > 0 ? (
                        <div>
                            <p className="flex items-center gap-1.5 text-[12.5px] font-bold"><TrendingUpIcon className="size-3.5" /> Subieron de rango ({result.rank_ups.length})</p>
                            <ul className="mt-1 grid gap-0.5 text-[12.5px]">
                                {result.rank_ups.map(item => (
                                    <li key={item.code}><b className="font-semibold">{item.name}</b> <span className="text-muted-foreground tabular-nums">({item.code})</span>: {item.from ?? '—'} → <b className="font-semibold">{item.to ?? '—'}</b></li>
                                ))}
                            </ul>
                        </div>
                    ) : <p className="text-[12px] text-muted-foreground">Nadie subió de rango con esta carga.</p>}
                </div>
            )}

            <div className="flex justify-end">
                <button type="button" onClick={onSend} disabled={!ready || requestState.loading} className="shell-cta inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {requestState.loading && <Loader2Icon className="size-4 animate-spin" />}
                    {parsed?.people.length ? `Cargar ${parsed.people.length} ${parsed.people.length === 1 ? 'persona' : 'personas'}` : 'Cargar grupo'}
                </button>
            </div>
        </Section>
    )
}

const PIECE_ACCEPT = '.jpg,.jpeg,.png,.webp,.mp4,.mov'
const PIECE_MAX_MB = 50

interface PieceResult { uri: string, person: string, section: string, date: string }

/**
 * Subir una pieza terminada (imagen o video) a una de sus secciones: para una persona de su grupo, o para ella misma
 * si es de todo el grupo. Con «avisarle», le llega la notificación al teléfono.
 */
const PieceUpload = ({ clientId, company }: { clientId: string, company: Company }) => {
    const info = companyInfo(company)
    const [section, setSection] = useState(info.pieceSections[0]?.key ?? '')
    const [personCode, setPersonCode] = useState('')
    const [date, setDate] = useState(today)
    const [title, setTitle] = useState('')
    const [notify, setNotify] = useState(true)
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<PieceResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInput = useRef<HTMLInputElement>(null)

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.listBase('posts/coverage/clients')],
        onError: () => undefined,
    })

    const sectionLabel = (key: string) => info.pieceSections.find(item => item.key === key)?.label ?? key
    const tooBig = !!file && file.size > PIECE_MAX_MB * 1024 * 1024
    const ready = !!section && !!date && !!file && !tooBig

    const onSend = async () => {
        if (!ready || !file) return
        setError(null)
        setResult(null)
        const body = new FormData()
        body.append('file', file)
        body.append('section_key', section)
        if (personCode.trim()) body.append('person_code', personCode.trim())
        body.append('date', date)
        if (title.trim()) body.append('title', title.trim())
        body.append('notify', notify ? '1' : '0')
        try {
            const response = await request<FormData, PieceResult>('POST', replaceRecordIdInPath(API_ROUTES.CLIENTS.COMPANY_PIECES, clientId), body)
            if (response.success) {
                setResult(response.data)
                setFile(null)
                setTitle('')
                if (fileInput.current) fileInput.current.value = ''
            } else {
                setError(response.message || 'La API no aceptó la pieza.')
            }
        } catch (exception) {
            setError(apiMessage(exception))
        }
    }

    return (
        <Section icon={<ImageUpIcon className="size-4" />} title="Subir una pieza" sub="Sus piezas no las arma el motor: se suben terminadas, una por una, y le salen en su app.">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Sección">
                    <select value={section} onChange={event => setSection(event.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                        {info.pieceSections.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                </Field>
                <Field label="Persona (código)" hint={`Vacío: la pieza es de ella, para todo su grupo. Con o sin «${info.accountPrefix}».`}>
                    <input value={personCode} onChange={event => setPersonCode(event.target.value)} placeholder="De ella" className={cn(inputClass, 'tabular-nums')} />
                </Field>
                <Field label="Fecha">
                    <input type="date" value={date} onChange={event => setDate(event.target.value)} className={cn(inputClass, 'dark:[color-scheme:dark]')} />
                </Field>
                <Field label="Título (opcional)">
                    <input value={title} onChange={event => setTitle(event.target.value)} maxLength={255} className={inputClass} />
                </Field>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <input ref={fileInput} type="file" accept={PIECE_ACCEPT} className="hidden" onChange={event => { setFile(event.target.files?.[0] ?? null); setResult(null); setError(null) }} />
                <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-[12.5px] font-bold transition-colors hover:border-[#6C47FF]/40">
                    <UploadIcon className="size-3.5" /> {file ? 'Cambiar archivo' : 'Elegir archivo'}
                </button>
                <span className={cn('min-w-0 truncate text-[12px]', tooBig ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                    {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB${tooBig ? ` (pesa más de ${PIECE_MAX_MB} MB)` : ''}` : `Imagen o video (jpg, png, webp, mp4, mov) de hasta ${PIECE_MAX_MB} MB`}
                </span>
            </div>

            <label className="flex w-max max-w-full cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={notify} onChange={event => setNotify(event.target.checked)} className="size-4 shrink-0 cursor-pointer accent-[#6C47FF]" />
                <span className="text-[13px] font-bold">Avisarle al teléfono</span>
            </label>

            {error && <ErrorBox>{error}</ErrorBox>}

            {result && (
                <div className="grid gap-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/[.06] p-3.5">
                    <p className="flex items-center gap-2 text-[13px] font-extrabold text-emerald-700 dark:text-emerald-400"><CheckCircle2Icon className="size-4" /> Pieza subida</p>
                    <p className="text-[12.5px]">{sectionLabel(result.section)} de <b className="font-semibold tabular-nums">{result.person}</b> del {dayLabel(result.date) ?? result.date}.</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground" title={result.uri}>{result.uri}</p>
                </div>
            )}

            <div className="flex justify-end">
                <button type="button" onClick={onSend} disabled={!ready || requestState.loading} className="shell-cta inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {requestState.loading && <Loader2Icon className="size-4 animate-spin" />} Subir pieza
                </button>
            </div>
        </Section>
    )
}

/**
 * «Su grupo y sus piezas»: sólo para clientas de otra empresa (Zermat). A las de Mary Kay su grupo lo trae el Excel de
 * InTouch y sus piezas las arma el motor; a éstas, las dos cosas se hacen aquí, a mano.
 */
const CompanyGroup = ({ clientId, company }: { clientId: string, company: Company }) => (
    <div className="grid min-w-0 grid-cols-1 gap-4">
        <RosterUpload clientId={clientId} company={company} />
        <PieceUpload clientId={clientId} company={company} />
    </div>
)

export default CompanyGroup;
