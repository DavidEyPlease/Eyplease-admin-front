import { useMemo } from 'react'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { LiveNews } from '@/interfaces/liveNews'
import { AdminOverview, ServiceRequest } from '@/interfaces/overview'
import { IPostRenderRun } from '@/interfaces/posts'
import { AdminPulse, PulseLane, PulsePieces } from '@/interfaces/pulse'
import { DownloadRun } from '@/pages/Reports/useReports'
import { clock, isToday, lanesFromDaily } from './lib'

const REFRESH_MS = 2 * 60_000

export interface DailyReport {
    section_key: string
    name: string
    usual: number
    loaded: number
    rejected: number
    date: string
    last_at: string | null
}

export type PulseTone = 'ok' | 'warn' | 'bad' | 'live' | 'plain'
export type PulseGroup = 'live' | 'publishing' | 'reports' | 'requests'

/** Un HECHO del día: algo que corrió, salió, falló o llegó. No es una métrica. */
export interface PulseEvent {
    id: string
    /** ISO para ordenar; los de días anteriores van al final */
    at: string
    time: string
    group: PulseGroup
    tag: string
    tone: PulseTone
    title: string
    text: string
    thumbs?: string[]
    actions?: Array<{ label: string, to: string }>
    /** Viene de antes de hoy y sigue sin atender */
    carried?: boolean
}

const ARTIFACT: Record<string, string> = { image: 'imagen', video: 'video', image_square: 'cuadrada' }
const ROBOT_SECTION: Record<string, string> = { early: 'Ventas Mensuales Personales', pink_circle_hearts: 'Corazones de Círculo Rosa', pink_circle_vip_plus: 'Círculo Rosa VIP Plus' }

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const taskEvent = (task: ServiceRequest, kind: 'request' | 'correction'): PulseEvent => {
    const today = isToday(task.created_at)
    const number = task.consecutive ? `#${task.consecutive}` : ''
    return {
        id: `${kind}-${task.id}`,
        at: task.created_at ?? new Date(0).toISOString(),
        time: today ? clock(task.created_at) : task.days === 1 ? 'ayer' : `hace ${task.days} días`,
        group: 'requests',
        tag: kind === 'correction' ? 'Corrección' : 'Solicitud',
        tone: kind === 'correction' ? 'warn' : today ? 'plain' : 'warn',
        title: kind === 'correction' ? `Pidió corrección ${number}` : `Solicitud de diseño ${number}`,
        text: [task.title, task.client, task.account].filter(Boolean).join(' · ') + (kind === 'request' ? ' · sin asignar' : ''),
        actions: [{ label: kind === 'correction' ? 'Abrir la corrección' : 'Asignar', to: APP_ROUTES.TASKS.DETAIL.replace(':id', task.id) }],
        carried: !today,
    }
}

/**
 * Todo lo que el Inicio nuevo necesita, de lo que la API YA registra: corridas de publicación,
 * corridas del robot, reportes del día, solicitudes y correcciones. De `/pulse` (nuevo) salen el
 * calendario de carriles y las piezas de hoy; si todavía no está desplegado, la página sigue en pie
 * con un calendario más corto y hechos sin miniaturas.
 */
const usePulse = () => {
    const opts = { staleTime: 60_000, refetchInterval: REFRESH_MS }
    const overview = useFetchQuery<AdminOverview>('/overview', { customQueryKey: ['admin', 'overview'], ...opts })
    const reports = useFetchQuery<DailyReport[]>('/reports/daily-reports', { customQueryKey: ['admin', 'daily-reports'], ...opts })
    const renderRuns = useFetchQuery<IPostRenderRun[]>(API_ROUTES.POSTS.RUNS, { customQueryKey: ['admin', 'pulse', 'render-runs'], ...opts })
    const robotRuns = useFetchQuery<DownloadRun[]>(API_ROUTES.REPORTS.DOWNLOAD_RUNS, { customQueryKey: ['admin', 'pulse', 'robot-runs'], ...opts })
    const liveNews = useFetchQuery<LiveNews>('/live-news', { customQueryKey: ['admin', 'live-news'], ...opts })
    const pulse = useFetchQuery<AdminPulse>('/pulse', { customQueryKey: ['admin', 'pulse', 'today'], ...opts })

    const data = overview.response
    const dailyReports = useMemo(() => Array.isArray(reports.response) ? reports.response : [], [reports.response])
    const pieces = useMemo<PulsePieces[]>(() => pulse.response?.pieces ?? [], [pulse.response])

    const schedule = useMemo<PulseLane[]>(() => {
        if (pulse.response?.schedule?.length) return pulse.response.schedule
        return data ? lanesFromDaily(data.publishing.daily) : []
    }, [pulse.response, data])

    const events = useMemo<PulseEvent[]>(() => {
        const out: PulseEvent[] = []
        const laneOf = (key: string) => schedule.find(lane => lane.key === key)
        const thumbsOf = (key: string) => {
            const lane = laneOf(key)
            const sections = lane?.sections?.length ? lane.sections : [key]
            const live = lane?.kind === 'live'
            return pieces.filter(item => sections.includes(item.section_key) && item.live === live).flatMap(item => item.thumbs).slice(0, 4)
        }

        /* Corridas de publicación de hoy. Imagen, cuadrada y video de la misma sección arrancan
           juntas y son UN hecho: se juntan por sección y cuarto de hora. */
        const runs = (Array.isArray(renderRuns.response) ? renderRuns.response : []).filter(run => isToday(run.started_at))
        const grouped = new Map<string, IPostRenderRun[]>()
        runs.forEach(run => {
            const slot = Math.floor(new Date(run.started_at).getTime() / (15 * 60_000))
            const key = `${run.section_key}|${run.sub_section ?? ''}|${slot}`
            grouped.set(key, [...(grouped.get(key) ?? []), run])
        })
        grouped.forEach((group, key) => {
            const first = group[0]
            const total = group.reduce((sum, run) => sum + run.total_jobs, 0)
            const ok = group.reduce((sum, run) => sum + run.succeeded_jobs, 0)
            const failed = group.reduce((sum, run) => sum + run.failed_jobs, 0)
            const active = group.some(run => run.status === 'queued' || run.status === 'running')
            const lane = laneOf(first.section_key)
            const live = lane?.kind === 'live' || first.section_key.startsWith('live_')
            const name = lane?.label ?? first.section_name
            const formats = [...new Set(group.map(run => ARTIFACT[run.artifact] ?? run.artifact))].join(' + ')
            const errors = group.map(run => run.error_summary).filter(Boolean).join(' · ')

            out.push({
                id: `run-${key}`,
                at: first.started_at,
                time: clock(first.started_at),
                group: live ? 'live' : 'publishing',
                tag: live ? 'En vivo' : 'Publicaciones',
                tone: failed > 0 ? (ok === 0 ? 'bad' : 'warn') : live ? 'live' : 'ok',
                title: active ? `${name}: generando… ${ok} de ${total}` : total === 0 ? `${name}: hoy no le tocó a nadie` : `${name}: ${ok} de ${total} piezas`,
                text: [
                    total === 0 ? 'Corrió y no encontró a quién hacerle pieza. La mayoría de los días es lo normal.' : `En ${formats}.`,
                    failed > 0 ? `${plural(failed, 'falló', 'fallaron')}.` : '',
                    errors,
                    first.trigger_source === 'manual' ? `Lanzada a mano${first.triggered_by ? ` por ${first.triggered_by}` : ''}.` : '',
                ].filter(Boolean).join(' '),
                thumbs: thumbsOf(first.section_key),
                actions: [{ label: failed > 0 ? 'Relanzar en Publicaciones' : 'Ver en Publicaciones', to: APP_ROUTES.POSTS.DASHBOARD }],
            })
        })

        /* Corridas del robot de hoy */
        ;(Array.isArray(robotRuns.response) ? robotRuns.response : []).filter(run => isToday(run.queued_at ?? run.finished_at)).forEach(run => {
            const names = (run.sections ?? []).map(section => ROBOT_SECTION[section] ?? section).join(' + ') || 'reportes'
            const result = run.result
            const done = run.status !== 'queued' && run.status !== 'running'
            const retry = !!run.clients?.length
            out.push({
                id: `robot-${run.run_id}`,
                at: run.finished_at ?? run.queued_at ?? new Date().toISOString(),
                time: clock(run.finished_at ?? run.queued_at),
                group: 'reports',
                tag: 'Robot',
                tone: !done ? 'plain' : run.status === 'failed' || run.status === 'rejected' ? 'bad' : result && result.failed > 0 ? 'warn' : 'ok',
                title: !done ? `${retry ? 'Reintento' : 'Descarga'} de ${names}: en curso` : result ? `${retry ? 'Reintento' : 'Descarga'} de ${names}: ${result.uploaded} de ${result.total} archivos` : `${retry ? 'Reintento' : 'Descarga'} de ${names}`,
                text: [
                    retry ? `Sólo ${plural(run.clients!.length, 'cuenta', 'cuentas')}, una por una.` : 'Una entrada al portal por clienta.',
                    result && result.failed > 0 ? `${plural(result.failed, 'cuenta quedó', 'cuentas quedaron')} sin bajar; entran al reintento.` : '',
                    result && result.skipped > 0 ? `${result.skipped} ya estaban.` : '',
                    run.error ?? '',
                ].filter(Boolean).join(' '),
                actions: [{ label: 'Ver corridas', to: APP_ROUTES.REPORTS.DASHBOARD }],
            })
        })

        /* Reportes ya cargados hoy */
        dailyReports.filter(report => isToday(report.last_at)).forEach(report => {
            const complete = report.loaded >= report.usual
            out.push({
                id: `report-${report.section_key}`,
                at: report.last_at as string,
                time: clock(report.last_at),
                group: 'reports',
                tag: 'Reportes',
                tone: complete ? 'ok' : 'warn',
                title: `${report.name}: ${report.loaded} de ${report.usual} cargadas`,
                text: [complete ? 'El import cerró completo.' : `Faltan ${report.usual - report.loaded}.`, report.rejected > 0 ? `${plural(report.rejected, 'archivo rechazado', 'archivos rechazados')}.` : 'Sin rechazos.'].join(' '),
                actions: complete ? undefined : [{ label: 'Ver las que faltan', to: APP_ROUTES.REPORTS.DASHBOARD }],
            })
        })

        /* Lo que tenía que salir y no salió */
        data?.publishing.daily.filter(section => section.today_status === 'missing').forEach(section => {
            const [h, m] = section.scheduled_at.split(':').map(Number)
            const at = new Date(); at.setHours(h, m, 0, 0)
            out.push({
                id: `missing-${section.key}`,
                at: at.toISOString(),
                time: section.scheduled_at,
                group: 'publishing',
                tag: 'No salió',
                tone: 'bad',
                title: `${section.name} no ha salido hoy`,
                text: `Le tocaba a las ${section.scheduled_at} y no hay una corrida completa${section.failed_jobs ? ` (${plural(section.failed_jobs, 'trabajo fallido', 'trabajos fallidos')} este mes)` : ''}.`,
                actions: [{ label: 'Relanzar en Publicaciones', to: APP_ROUTES.POSTS.DASHBOARD }],
            })
        })

        data?.service_requests.latest.forEach(task => out.push(taskEvent(task, 'request')))
        data?.corrections.latest.forEach(task => out.push(taskEvent(task, 'correction')))

        /* Lo de hoy primero y del más reciente al más viejo; lo arrastrado de otros días, al final */
        return out.sort((a, b) => Number(!!a.carried) - Number(!!b.carried) || b.at.localeCompare(a.at))
    }, [renderRuns.response, robotRuns.response, dailyReports, data, schedule, pieces])

    return {
        loading: overview.loading && !data,
        overview: data,
        dailyReports,
        schedule,
        /** El calendario completo sólo llega de `/pulse`; sin él se avisa que es parcial */
        scheduleIsPartial: !pulse.response?.schedule?.length,
        pieces,
        liveNews: liveNews.response,
        events,
    }
}

export default usePulse
