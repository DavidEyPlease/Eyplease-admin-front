import { AlertCircleIcon, ImageIcon, PlayIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { SectionView, progressOf } from '../../board.utils'
import { formatNumber, formatRelativeTime } from '../../page-utils'

interface Props {
    views: SectionView[]
    publishing: boolean
    onOpen: (sectionKey: string) => void
    onGenerate: (view: SectionView) => void
}

/** Tarjeta que abre el detalle. Es un div con rol de botón porque lleva botones dentro. */
const Item = ({ onOpen, children }: { onOpen: () => void, children: React.ReactNode }) => (
    <div
        role="button"
        tabIndex={0}
        className="pub-item"
        onClick={onOpen}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen() } }}
    >
        {children}
    </div>
)

const Lane = ({ index, title, tone, count, why, children }: { index: number, title: string, tone: string, count: number, why: string, children: React.ReactNode }) => (
    <div className="pub-lane" style={{ '--i': index } as React.CSSProperties}>
        <div className="pub-lane-head"><i className={`pub-swatch pub-c-${tone}`} />{title}<span className="n">{count}</span></div>
        <p className="pub-lane-why">{why}</p>
        {count === 0 ? <p className="pub-empty">Nada aquí.</p> : children}
    </div>
)

/** Las cuatro columnas: cada sección cae donde está lo que le falta (puede estar en dos). */
const ReasonLanes = ({ views, publishing, onOpen, onGenerate }: Props) => {
    const navigate = useNavigate()
    const art = views.filter(view => view.buckets.art > 0 && view.state !== 'paused')
    const ready = views.filter(view => view.buckets.ready > 0 && view.state !== 'paused')
    const running = views.filter(view => view.activeRuns.length > 0 || view.stalledRuns.length > 0)
    const paused = views.filter(view => view.buckets.paused > 0 || view.state === 'paused')

    const stop = (event: React.MouseEvent, action: () => void) => { event.stopPropagation(); action() }

    return (
        <div className="pub-lanes">
            <Lane index={0} title="Falta arte" tone="art" count={art.length} why="No hay plantilla del mes. Hasta que llegue el arte, generar no produce nada.">
                {art.map(view => (
                    <Item key={view.section.section_key} onOpen={() => onOpen(view.section.section_key)}>
                        <span className="pub-item-t"><span>{view.section.name}</span><span>{formatNumber(view.buckets.art)}</span></span>
                        <span className="pub-item-d">
                            {view.templates.total > 0 ? `Plantillas del mes: ${view.templates.ready} de ${view.templates.total}.` : 'Sin plantilla del mes.'} Cuenta archivos (cada formato aparte).
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                            <button type="button" className="vta-btn ghost !h-7 !px-2.5 !text-[12px]" onClick={event => stop(event, () => navigate(APP_ROUTES.TEMPLATES.POSTS))}>
                                <ImageIcon className="size-3.5" /> Ir a plantillas
                            </button>
                        </span>
                    </Item>
                ))}
            </Lane>

            <Lane index={1} title="Listas para generar" tone="ready" count={ready.length} why="Tienen plantilla y gente pendiente. Generar crea sólo lo que falta, en todos sus formatos.">
                {ready.map(view => (
                    <Item key={view.section.section_key} onOpen={() => onOpen(view.section.section_key)}>
                        <span className="pub-item-t"><span>{view.section.name}</span><span>{formatNumber(view.buckets.ready)}</span></span>
                        <span className="pub-item-d">Faltan {view.formats.filter(format => format.done < format.total && !format.liveOnly).map(format => format.label.toLowerCase()).join(', ') || 'archivos'}.</span>
                        <span className="flex">
                            <button type="button" disabled={publishing} className="vta-btn gro-primary !h-8 !text-[12px]" onClick={event => stop(event, () => onGenerate(view))}>
                                <PlayIcon className="size-3.5" /> Generar lo que falta
                            </button>
                        </span>
                    </Item>
                ))}
            </Lane>

            <Lane index={2} title="Generándose" tone="running" count={running.length} why="En la fila del motor. Si una corrida pasa horas sin avanzar, se marca.">
                {running.map(view => {
                    const runs = [...view.stalledRuns, ...view.activeRuns]
                    const done = runs.reduce((total, run) => total + run.processed_jobs, 0)
                    const total = runs.reduce((total, run) => total + run.total_jobs, 0)
                    const last = runs.map(run => run.updated_at ?? run.started_at).sort().at(-1) ?? null

                    return (
                        <Item key={view.section.section_key} onOpen={() => onOpen(view.section.section_key)}>
                            <span className="pub-item-t"><span>{view.section.name}</span><span>{formatNumber(done)} / {formatNumber(total)}</span></span>
                            <span className="pub-prog"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
                            <span className="pub-item-d">{runs.map(run => `${run.artifact === 'image' ? 'vertical' : run.artifact === 'image_square' ? 'cuadrada' : 'video'} ${progressOf(run)}%`).join(' · ')} · último avance {formatRelativeTime(last)}</span>
                            {view.stalledRuns.length > 0 && <span className="pub-flag"><AlertCircleIcon className="size-3.5" /> Sin avance en más de 3 h</span>}
                        </Item>
                    )
                })}
            </Lane>

            <Lane index={3} title="Apagadas a propósito" tone="paused" count={paused.length} why="Decisiones del equipo: no cuentan como faltantes. Se encienden desde el detalle.">
                {paused.map(view => {
                    const reasons = [...new Set([view.section.paused, ...view.section.subsections.map(sub => sub.paused)].filter(Boolean))] as string[]

                    return (
                        <Item key={view.section.section_key} onOpen={() => onOpen(view.section.section_key)}>
                            <span className="pub-item-t"><span>{view.section.name}</span><span>{formatNumber(view.buckets.paused)}</span></span>
                            <span className="pub-item-d">{reasons.join(' · ') || 'Apagada'}</span>
                        </Item>
                    )
                })}
            </Lane>
        </div>
    )
}

export default ReasonLanes
