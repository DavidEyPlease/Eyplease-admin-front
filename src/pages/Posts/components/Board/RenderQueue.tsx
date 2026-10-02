import { AlertTriangleIcon } from 'lucide-react'

import { IPostRenderRun } from '@/interfaces/posts'
import { ARTIFACT_LABEL, isActiveRun, isStalledRun, progressOf } from '../../board.utils'
import { RUN_STATUS_UI, formatNumber, formatRelativeTime } from '../../page-utils'

interface Props {
    runs: IPostRenderRun[]
    loading: boolean
}

const RunRow = ({ run }: { run: IPostRenderRun }) => {
    const stalled = isStalledRun(run)
    const active = isActiveRun(run)

    return (
        <div className="pub-job">
            <div className="pub-job-t">
                <span className="min-w-0 truncate">{run.section_name}<span className="pub-tag">{ARTIFACT_LABEL[run.artifact] ?? run.artifact}</span></span>
                <span>{formatNumber(run.processed_jobs)}/{formatNumber(run.total_jobs)}</span>
            </div>
            {active && <span className="pub-prog"><i style={{ width: `${progressOf(run)}%` }} /></span>}
            <div className="pub-job-m">
                <span>
                    {active
                        ? `${run.trigger_source === 'cron' ? 'Automática' : run.triggered_by ?? 'A mano'} · último avance ${formatRelativeTime(run.updated_at ?? run.started_at)}`
                        : `${RUN_STATUS_UI[run.status].label} ${formatRelativeTime(run.finished_at ?? run.started_at)}${run.failed_jobs ? ` · ${run.failed_jobs} con falla` : ''}`}
                </span>
                {stalled && <span className="font-bold text-rose-600 dark:text-rose-400">Sin avance</span>}
            </div>
        </div>
    )
}

/** Lo que está en la fila del motor y lo último que terminó. */
const RenderQueue = ({ runs, loading }: Props) => {
    const active = runs.filter(isActiveRun)
    const stalled = active.filter(run => isStalledRun(run))
    const recent = runs.filter(run => !isActiveRun(run)).slice(0, 6)

    return (
        <aside className="shell-glass pulse-rise min-w-0 rounded-3xl px-[18px] py-4">
            <header className="mb-2 flex items-center gap-2">
                <h2 className="text-[15px] font-extrabold tracking-tight">Fila de render</h2>
                <span className="ml-auto text-[12px] text-muted-foreground">{active.length ? `${active.length} en curso` : 'sin nada en curso'}</span>
            </header>

            {stalled.length > 0 && (
                <p className="pub-alert">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>{stalled.length === 1 ? 'Una corrida lleva' : `${stalled.length} corridas llevan`} más de 3 h sin avanzar. Los videos van en fila detrás de todo lo demás: revisa si el motor sigue saturado.</span>
                </p>
            )}

            {loading && <p className="pub-empty py-3">Cargando…</p>}
            {!loading && active.length === 0 && <p className="pub-empty py-3">El motor no tiene nada en la fila.</p>}
            {active.map(run => <RunRow key={run.id} run={run} />)}

            {recent.length > 0 && (
                <>
                    <p className="mt-3 mb-1 text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">Terminadas</p>
                    {recent.map(run => <RunRow key={run.id} run={run} />)}
                </>
            )}
        </aside>
    )
}

export default RenderQueue
