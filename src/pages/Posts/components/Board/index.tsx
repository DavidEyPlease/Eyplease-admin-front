import { useMemo, useState } from 'react'
import { AlertTriangleIcon, ClockIcon, Loader2Icon } from 'lucide-react'

import { IPostRenderRun, IPostsCoverageResponse, PostArtifact } from '@/interfaces/posts'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import { cn } from '@/lib/utils'
import { Lane, SectionView, buildSectionView, closeMonthLabel } from '../../board.utils'
import { formatPeriodLabel, formatRelativeTime } from '../../page-utils'
import PeriodPicker from '../PeriodPicker'
import ReasonLanes from './ReasonLanes'
import RenderQueue from './RenderQueue'
import Ribbon from './Ribbon'
import SectionSheet from './SectionSheet'
import SectionsTable from './SectionsTable'

interface Props {
    coverage: IPostsCoverageResponse
    runs: IPostRenderRun[]
    loading: boolean
    isRefetching: boolean
    loadingRuns: boolean
    publishing: boolean
    saving: boolean
    period: string
    onPeriodChange: (period: string) => void
    onPublish: (sectionKeys: string[], artifacts: PostArtifact[]) => void
    onPause: (sectionKey: string, subSection: string | null, reason: string) => Promise<boolean>
    onResume: (sectionKey: string, subSection: string | null) => Promise<boolean>
}

/** Publicaciones · qué falta y por qué. */
const Board = ({ coverage, runs, loading, isRefetching, loadingRuns, publishing, saving, period, onPeriodChange, onPublish, onPause, onResume }: Props) => {
    const [lane, setLane] = useState<Lane>('close')
    const [openKey, setOpenKey] = useState<string | null>(null)

    const views = useMemo(() => coverage.sections.map(section => buildSectionView(section, runs)), [coverage, runs])
    const visible = views.filter(view => lane === 'all' || view.lane === lane)
    const openView = views.find(view => view.section.section_key === openKey) ?? null
    const isTargetPeriod = !coverage.current_target_period || coverage.current_target_period === period

    const lanes: { key: Lane, label: string }[] = [
        { key: 'close', label: `Cierre de ${closeMonthLabel(period).toLowerCase()}` },
        { key: 'daily', label: 'Del día' },
        { key: 'all', label: 'Todo' },
    ]

    // Generar pide todos los formatos de la sección: el job sólo crea lo que falta.
    const generate = (view: SectionView) => onPublish([view.section.section_key], view.section.artifacts)

    if (loading) {
        return (
            <div className="grid gap-4">
                <Skeleton className="h-36 w-full rounded-3xl" />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44 rounded-3xl" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
        )
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <PeriodPicker period={period} onChange={onPeriodChange} />
                    <div className="shell-glass gro-tabs" role="tablist">
                        {lanes.map(item => (
                            <a key={item.key} role="tab" aria-selected={lane === item.key} href="#" className={cn(lane === item.key && 'on')} onClick={event => { event.preventDefault(); setLane(item.key) }}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    {isRefetching ? <Loader2Icon className="size-3 animate-spin" /> : <ClockIcon className="size-3" />}
                    {coverage.snapshot_at ? `Lo que falta se revisó ${formatRelativeTime(coverage.snapshot_at)}` : 'Lo que falta todavía no se ha calculado'}
                </span>
            </div>

            {!isTargetPeriod && (
                <p className="pub-alert">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>Estás viendo <b>{formatPeriodLabel(period)}</b>, un mes que ya pasó. Generar sólo trabaja sobre <b>{formatPeriodLabel(coverage.current_target_period)}</b>.</span>
                </p>
            )}

            <Ribbon views={visible} />
            <ReasonLanes views={visible} publishing={publishing} onOpen={setOpenKey} onGenerate={generate} />

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <SectionsTable views={visible} onOpen={setOpenKey} />
                <RenderQueue runs={runs} loading={loadingRuns} />
            </div>

            <SectionSheet
                view={openView}
                publishing={publishing}
                saving={saving}
                onClose={() => setOpenKey(null)}
                onGenerate={generate}
                onPause={onPause}
                onResume={onResume}
            />
        </div>
    )
}

export default Board
