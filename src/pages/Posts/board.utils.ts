import { IPostRenderRun, ISectionCoverage, PostArtifact } from '@/interfaces/posts'
import { ACTIVE_RUN_STATUSES, shiftPeriod, formatPeriodLabel } from './page-utils'

/*
 * «Qué falta y por qué»: cada archivo que falta cae en UN motivo.
 *  - art        no hay plantilla del mes: generar no lo produciría.
 *  - ready      hay plantilla y nadie lo está generando: un clic lo lanza.
 *  - running    hay una corrida viva de esa sección y formato.
 *  - scheduled  las diarias: su cron lo hace solo.
 *  - paused     apagado a propósito: no cuenta como faltante.
 */

export const ARTIFACT_ORDER: PostArtifact[] = ['image', 'image_square', 'video']

export const ARTIFACT_LABEL: Record<PostArtifact, string> = {
    image: 'Vertical',
    image_square: 'Cuadrada',
    video: 'Video',
}

/** Una corrida «en curso» que no avanza en este tiempo se da por atorada. */
export const STALLED_AFTER_MS = 3 * 60 * 60 * 1000

export type Lane = 'close' | 'daily' | 'all'
export type Reason = 'art' | 'ready' | 'running' | 'scheduled' | 'paused'
export type SectionState = 'done' | 'running' | 'stalled' | 'ready' | 'art' | 'scheduled' | 'paused' | 'unknown'

export const STATE_UI: Record<SectionState, { label: string, tone: string }> = {
    done: { label: 'Completa', tone: 'done' },
    running: { label: 'Generándose', tone: 'run' },
    stalled: { label: 'Sin avance', tone: 'bad' },
    ready: { label: 'Lista para generar', tone: 'ready' },
    art: { label: 'Falta arte', tone: 'art' },
    scheduled: { label: 'Programada', tone: 'day' },
    paused: { label: 'Apagada', tone: 'off' },
    unknown: { label: 'Sin datos', tone: 'off' },
}

export interface FormatView {
    artifact: PostArtifact
    label: string
    /** Hechas: del cierre, o las en vivo cuando la sección sólo tiene eso */
    done: number
    total: number
    /** Lo que se muestra son piezas en vivo (no hay cierre que medir) */
    liveOnly: boolean
    /** Hay dato: algo hecho o un pendiente calculado. Sin esto, «0 / 0» parecería un hueco */
    known: boolean
    running: boolean
}

export interface SectionView {
    section: ISectionCoverage
    lane: Exclude<Lane, 'all'>
    formats: FormatView[]
    /** Archivos por motivo */
    buckets: Record<Reason, number>
    activeRuns: IPostRenderRun[]
    stalledRuns: IPostRenderRun[]
    state: SectionState
    templates: { ready: number, total: number }
}

const emptyBuckets = (): Record<Reason, number> => ({ art: 0, ready: 0, running: 0, scheduled: 0, paused: 0 })

export const isActiveRun = (run: IPostRenderRun) => ACTIVE_RUN_STATUSES.includes(run.status)

export const isStalledRun = (run: IPostRenderRun, now = Date.now()) =>
    isActiveRun(run) && now - new Date(run.updated_at ?? run.started_at).getTime() > STALLED_AFTER_MS

export const buildSectionView = (section: ISectionCoverage, runs: IPostRenderRun[], now = Date.now()): SectionView => {
    const lane = section.cadence === 'daily' ? 'daily' : 'close'
    const sectionRuns = runs.filter(run => run.section_key === section.section_key && isActiveRun(run))
    const stalledRuns = sectionRuns.filter(run => isStalledRun(run, now))
    const activeRuns = sectionRuns.filter(run => !isStalledRun(run, now))
    const artifacts = ARTIFACT_ORDER.filter(artifact => section.artifacts.includes(artifact))
    const buckets = emptyBuckets()
    let hasSnapshot = false

    const formats = artifacts.map((artifact): FormatView => {
        const format = section.formats?.[artifact]
        const running = sectionRuns.some(run => run.artifact === artifact)

        // API vieja, sin formatos: lo de siempre (publicadas con imagen / con video).
        if (!format) {
            const done = artifact === 'video' ? section.with_video : section.with_image
            return { artifact, label: ARTIFACT_LABEL[artifact], done, total: section.posts, liveOnly: false, known: true, running }
        }

        const pending = format.pending ?? 0
        if (format.pending !== null) hasSnapshot = true

        const missing = format.missing_template_pending
        const withTemplate = Math.max(pending - missing, 0)

        buckets.art += missing
        buckets.paused += format.paused_pending
        if (lane === 'daily') buckets.scheduled += withTemplate
        else if (running) buckets.running += withTemplate
        else buckets.ready += withTemplate

        return {
            artifact,
            label: ARTIFACT_LABEL[artifact],
            done: format.done,
            total: format.done + pending,
            liveOnly: false,
            known: format.pending !== null || format.done > 0,
            running,
        }
    })

    // Sólo cuando la sección no tiene NADA de cierre se enseña lo en vivo (el Cuadro de Honor
    // con el clásico apagado). Si no, una cuadrada «1,852 en vivo» junto a una vertical «0 / 220»
    // mezcla dos cosas distintas.
    const closeTotal = formats.reduce((total, format) => total + format.total, 0)
    if (closeTotal === 0) {
        formats.forEach(format => {
            const live = section.formats?.[format.artifact]?.live ?? 0
            if (live > 0) Object.assign(format, { done: live, total: live, liveOnly: true, known: true })
        })
    }

    const first = section.formats?.[artifacts[0]]
    const templates = { ready: first?.templates_ready ?? 0, total: first?.templates_total ?? 0 }
    const madeSomething = formats.some(format => format.done > 0)

    const state: SectionState = section.paused ? 'paused'
        : stalledRuns.length ? 'stalled'
        : activeRuns.length ? 'running'
        : buckets.ready > 0 ? 'ready'
        : buckets.art > 0 ? 'art'
        : buckets.scheduled > 0 ? 'scheduled'
        : !hasSnapshot && !madeSomething ? 'unknown'
        : 'done'

    return { section, lane, formats, buckets, activeRuns, stalledRuns, state, templates }
}

export const sumBuckets = (views: SectionView[]) =>
    views.reduce((total, view) => {
        (Object.keys(total) as Reason[]).forEach(reason => { total[reason] += view.buckets[reason] })
        return total
    }, emptyBuckets())

/** El mes de los datos del cierre: las mensuales publican en octubre lo de septiembre. */
export const closeMonthLabel = (period: string) => formatPeriodLabel(shiftPeriod(period, -1)).split(' ')[0]

/** «Ana, Bea y Caro» */
export const joinNames = (names: string[]) =>
    names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`

export const progressOf = (run: IPostRenderRun) =>
    run.total_jobs > 0 ? Math.round((run.processed_jobs / run.total_jobs) * 100) : 0
