import { Reason, SectionView, joinNames, sumBuckets } from '../../board.utils'
import { formatNumber } from '../../page-utils'

const SEGMENTS: { reason: Reason, label: string }[] = [
    { reason: 'art', label: 'Falta arte' },
    { reason: 'ready', label: 'Listas para generar' },
    { reason: 'running', label: 'Generándose' },
    { reason: 'scheduled', label: 'Programadas del día' },
    { reason: 'paused', label: 'Apagadas a propósito' },
]

interface Props {
    views: SectionView[]
}

/** Cuánto falta, partido por motivo, y en una frase lo que le toca hacer a alguien. */
const Ribbon = ({ views }: Props) => {
    const buckets = sumBuckets(views)
    const missing = buckets.art + buckets.ready + buckets.running + buckets.scheduled
    const barTotal = missing + buckets.paused

    const byState = (state: SectionView['state']) => views.filter(view => view.state === state).map(view => view.section.name)
    const art = views.filter(view => view.buckets.art > 0).map(view => view.section.name)
    const ready = byState('ready')
    const stalled = byState('stalled')

    const todo = [
        art.length > 0 && <><b>{art.length === 1 ? '1 sección espera' : `${art.length} secciones esperan`} arte del mes</b> ({joinNames(art)})</>,
        ready.length > 0 && <><b>{joinNames(ready)}</b> {ready.length === 1 ? 'está lista' : 'están listas'} para generar</>,
        stalled.length > 0 && <><b>{joinNames(stalled)}</b> sin avanzar en horas</>,
    ].filter(Boolean)

    return (
        <section className="shell-glass pub-ribbon">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div className="pub-big">{formatNumber(missing)}<small>archivos por salir</small></div>
                <p className="pub-todo">
                    {todo.length > 0
                        ? <>Lo que te toca: {todo.map((part, index) => <span key={index}>{index > 0 && ' · '}{part}</span>)}.</>
                        : missing > 0 ? 'Todo lo que falta ya está en camino: no hay nada que lanzar.' : 'No falta nada por publicar.'}
                </p>
            </div>

            {barTotal > 0 && (
                <div className="pub-bar" aria-hidden>
                    {SEGMENTS.filter(segment => buckets[segment.reason] > 0).map(segment => (
                        <span key={segment.reason} className={`pub-c-${segment.reason}`} style={{ width: `${(buckets[segment.reason] / barTotal) * 100}%` }} />
                    ))}
                </div>
            )}

            <div className="pub-legend">
                {SEGMENTS.filter(segment => buckets[segment.reason] > 0).map(segment => (
                    <span key={segment.reason}><i className={`pub-swatch pub-c-${segment.reason}`} />{segment.label} <b>{formatNumber(buckets[segment.reason])}</b></span>
                ))}
            </div>
        </section>
    )
}

export default Ribbon
