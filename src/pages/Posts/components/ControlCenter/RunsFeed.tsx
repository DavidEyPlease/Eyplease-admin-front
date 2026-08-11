import { ActivityIcon, ClockIcon } from 'lucide-react'

import { MiniBar, Panel } from '@/components/generics/brand-ui'
import { Badge } from '@/uishadcn/ui/badge'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import { IPostRenderRun } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber, formatRelativeTime, RUN_STATUS_UI } from '../../page-utils'

interface Props {
    runs: IPostRenderRun[]
    loading: boolean
}

const RunsFeed = ({ runs, loading }: Props) => {
    return (
        <Panel className="overflow-hidden">
            <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <ActivityIcon className="size-4 text-muted-foreground" />
                <h3 className="flex-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Ejecuciones</h3>
            </header>

            {loading ? (
                <div className="flex flex-col gap-3 p-4">
                    {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}
                </div>
            ) : (
                <ul>
                    {runs.map(run => {
                        const status = RUN_STATUS_UI[run.status]

                        return (
                            <li key={run.id} className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 last:border-b-0">
                                <div className="flex items-start gap-2">
                                    <p className="min-w-0 flex-1 text-xs font-semibold tracking-tight text-foreground">
                                        {run.section_name}
                                        <span className="font-medium text-muted-foreground"> · {run.artifact === 'image' ? 'imagen' : 'video'}</span>
                                    </p>
                                    <Badge variant="outline" className={cn('shrink-0 rounded-full px-2 text-[10px] font-bold', status.badge)}>
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MiniBar value={run.processed_jobs} total={run.total_jobs} tone={status.bar} />
                                    <span className="shrink-0 text-[10.5px] font-bold tabular-nums text-muted-foreground">
                                        {formatNumber(run.processed_jobs)}/{formatNumber(run.total_jobs)}
                                    </span>
                                </div>

                                <p className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground">
                                    <ClockIcon className="size-3" />
                                    {formatRelativeTime(run.started_at)}
                                    <span>·</span>
                                    {run.trigger_source === 'cron' ? 'Cron' : `Manual · ${run.triggered_by}`}
                                    {run.failed_jobs > 0 && (
                                        <span className="font-bold text-rose-600">· {formatNumber(run.failed_jobs)} fallaron</span>
                                    )}
                                </p>
                            </li>
                        )
                    })}
                </ul>
            )}
        </Panel>
    )
}

export default RunsFeed
