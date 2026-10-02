import { useEffect, useMemo, useState } from 'react'
import { AlertTriangleIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, SearchIcon, XIcon } from 'lucide-react'

import { IClientCoverageResponse, IClientCoverageRow, ICoverageColumn, IPostsCoverageResponse, PostArtifact } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { NEWSLETTER_LABEL, formatNumber } from '../../page-utils'
import PeriodPicker from '../PeriodPicker'

const SEARCH_DEBOUNCE_MS = 400
/** Con tantas secciones vacías a la vez, lo normal es que no se importó su reporte del mes. */
const NO_REPORT_EMPTY_SECTIONS = 4

const CELL_UI = {
    empty: { label: 'Sin pieza', tone: 'bad' },
    partial: { label: 'Le falta un formato', tone: 'warn' },
} as const

interface Props {
    coverage: IPostsCoverageResponse
    clientCoverage: IClientCoverageResponse | null
    loading: boolean
    updating: boolean
    publishing: boolean
    period: string
    search: string
    onPeriodChange: (period: string) => void
    onSearch: (search: string) => void
    onChangePage: (page: number) => void
    onPublishClient: (clientId: string, clientName: string, sections: { sectionKey: string, artifacts: PostArtifact[] }[]) => void
}

/** «María del Carmen» → MC: sin las partículas, que no dicen nada del nombre */
const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y'])
const initials = (name: string) => name.split(/\s+/).filter(word => word && !PARTICLES.has(word.toLowerCase())).slice(0, 2).map(word => word[0]).join('').toUpperCase()

/** Lo que su plan incluye, lo completo y lo que tiene hueco. */
const summarize = (row: IClientCoverageRow, columns: ICoverageColumn[]) => {
    const included = columns.filter(column => (row.cells[column.section_key] ?? 'empty') !== 'not_included')
    const problems = included.filter(column => ['empty', 'partial'].includes(row.cells[column.section_key] ?? 'empty'))
    const empty = problems.filter(column => (row.cells[column.section_key] ?? 'empty') === 'empty').length

    return { included: included.length, full: included.length - problems.length, problems, empty }
}

const ClientsSkeleton = () => (
    <section className="shell-glass min-w-0 overflow-hidden rounded-3xl" aria-busy aria-label="Cargando clientas">
        {[0, 1, 2, 3, 4, 5].map(row => (
            <div key={row} className="pub-client !cursor-default">
                <span className="pub-skel size-10 rounded-full" />
                <span className="grid gap-1.5"><span className="pub-skel h-3.5 w-40 rounded-full" /><span className="pub-skel h-2.5 w-24 rounded-full" /></span>
                <span className="flex flex-wrap gap-1.5">{[0, 1, 2].map(chip => <span key={chip} className="pub-skel h-6 w-24 rounded-full" />)}</span>
                <span className="grid gap-1.5"><span className="pub-skel h-2.5 w-24 rounded-full" /><span className="pub-skel h-1.5 w-full rounded-full" /></span>
                <span className="pub-skel h-8 w-28 rounded-full" />
            </div>
        ))}
    </section>
)

/** Por clienta: a quién le falta qué, ordenadas por huecos, y generar sólo lo suyo. */
const ClientsTab = ({ coverage, clientCoverage, loading, updating, publishing, period, search, onPeriodChange, onSearch, onChangePage, onPublishClient }: Props) => {
    const [text, setText] = useState(search)

    // Buscar al dejar de escribir, sin un botón de más.
    useEffect(() => {
        if (text === search) return
        const timer = setTimeout(() => onSearch(text.trim()), SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [text, search, onSearch])

    const columns = useMemo(() => clientCoverage?.columns ?? [], [clientCoverage?.columns])
    const artifactsOf = useMemo(() => {
        const bySection = new Map(coverage.sections.map(section => [section.section_key, section.artifacts]))
        return (sectionKey: string) => bySection.get(sectionKey) ?? (['image', 'video'] as PostArtifact[])
    }, [coverage.sections])

    /* Unidad y nacional repiten nombre («Cumpleaños»): se desambigua en el chip */
    const labelOf = useMemo(() => {
        const counts = new Map<string, number>()
        columns.forEach(column => counts.set(column.name, (counts.get(column.name) ?? 0) + 1))
        return (column: ICoverageColumn) => (counts.get(column.name) ?? 0) > 1 && column.newsletter
            ? `${column.name} · ${NEWSLETTER_LABEL[column.newsletter]}`
            : column.name
    }, [columns])

    const rows = clientCoverage?.items ?? []
    const withoutReport = rows.filter(row => summarize(row, columns).empty >= NO_REPORT_EMPTY_SECTIONS)

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <PeriodPicker period={period} onChange={onPeriodChange} />
                <label className="shell-glass flex h-10 min-w-0 flex-1 items-center gap-2 rounded-2xl px-3.5 sm:max-w-sm">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        value={text}
                        onChange={event => setText(event.target.value)}
                        onKeyDown={event => event.key === 'Enter' && onSearch(text.trim())}
                        placeholder="Buscar por nombre o cuenta"
                        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                    />
                    {text && <button type="button" aria-label="Limpiar" className="text-muted-foreground hover:text-foreground" onClick={() => { setText(''); onSearch('') }}><XIcon className="size-4" /></button>}
                </label>
                {clientCoverage && (
                    <span className="ml-auto text-[12px] text-muted-foreground">
                        {formatNumber(clientCoverage.total_items)} clientas con publicaciones · primero las que tienen más huecos
                    </span>
                )}
            </div>

            {withoutReport.length > 0 && (
                <p className="pub-alert">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>
                        <b>Probablemente sin reporte del mes importado:</b>{' '}
                        {withoutReport.map((row, index) => (
                            <span key={row.client_id}>
                                {index > 0 && ', '}
                                <button type="button" className="font-bold underline-offset-2 hover:underline" onClick={() => { const value = row.client_account ?? row.client_name; setText(value); onSearch(value) }}>
                                    {row.client_name}
                                </button>
                            </span>
                        ))}
                        . Tienen {NO_REPORT_EMPTY_SECTIONS} o más secciones sin pieza.
                    </span>
                </p>
            )}

            {loading || !clientCoverage ? <ClientsSkeleton /> : (
                <section className={cn('shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl transition-opacity', updating && 'pointer-events-none opacity-60')}>
                    {rows.length === 0 ? (
                        <p className="px-6 py-14 text-center text-[13px] text-muted-foreground">
                            {search ? 'Ninguna clienta coincide con la búsqueda en este mes.' : 'No hay publicaciones en este mes.'}
                        </p>
                    ) : rows.map(row => {
                        const summary = summarize(row, columns)

                        return (
                            <div key={row.client_id} className="pub-client">
                                <span className="pub-avatar" aria-hidden>{initials(row.client_name)}</span>
                                <span className="pub-name min-w-0">
                                    <b className="truncate">{row.client_name}</b>
                                    <small className="truncate">{[row.client_account, row.plan_name].filter(Boolean).join(' · ')}</small>
                                </span>

                                <span className="flex min-w-0 flex-wrap gap-1.5">
                                    {summary.problems.length === 0
                                        ? <span className="pub-chip ok"><CheckIcon className="size-3.5" /> Todo lo de su plan salió</span>
                                        : summary.problems.map(column => {
                                            const state = row.cells[column.section_key] === 'partial' ? 'partial' : 'empty'
                                            return (
                                                <span key={column.section_key} className={`pub-chip ${CELL_UI[state].tone}`} title={CELL_UI[state].label}>
                                                    <i />{labelOf(column)}
                                                </span>
                                            )
                                        })}
                                </span>

                                <span className="pub-fmt">
                                    <span><b>{summary.full}</b> de {summary.included} de su plan</span>
                                    <span className={`pub-prog thin ${summary.full === summary.included ? 'ok' : ''}`}><i style={{ width: `${summary.included ? (summary.full / summary.included) * 100 : 0}%` }} /></span>
                                </span>

                                <span className="flex justify-end">
                                    {summary.problems.length > 0 && (
                                        <button
                                            type="button"
                                            className="vta-btn !h-8 !text-[12px]"
                                            disabled={publishing}
                                            title="Genera sólo sus piezas que faltan, en todos sus formatos"
                                            onClick={() => onPublishClient(row.client_id, row.client_name, summary.problems.map(column => ({ sectionKey: column.section_key, artifacts: artifactsOf(column.section_key) })))}
                                        >
                                            <PlayIcon className="size-3.5" /> Generar lo suyo
                                        </button>
                                    )}
                                </span>
                            </div>
                        )
                    })}

                    <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="pub-chip bad !h-auto !border-0 !bg-transparent !p-0"><i /></span>{CELL_UI.empty.label}</span>
                        <span className="flex items-center gap-1.5"><span className="pub-chip warn !h-auto !border-0 !bg-transparent !p-0"><i /></span>{CELL_UI.partial.label}</span>
                        <span className="ml-auto flex items-center gap-2">
                            {formatNumber(rows.length)} de {formatNumber(clientCoverage.total_items)}
                            <button type="button" aria-label="Página anterior" className="vta-btn ghost !h-8 !px-2" disabled={clientCoverage.current_page <= 1} onClick={() => onChangePage(clientCoverage.current_page - 1)}><ChevronLeftIcon className="size-4" /></button>
                            <span className="tabular-nums">Página {clientCoverage.current_page} de {Math.max(clientCoverage.last_page, 1)}</span>
                            <button type="button" aria-label="Página siguiente" className="vta-btn ghost !h-8 !px-2" disabled={clientCoverage.current_page >= clientCoverage.last_page} onClick={() => onChangePage(clientCoverage.current_page + 1)}><ChevronRightIcon className="size-4" /></button>
                        </span>
                    </footer>
                </section>
            )}
        </div>
    )
}

export default ClientsTab
