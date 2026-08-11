import { useMemo } from 'react'
import { AlertTriangleIcon, CheckCircle2Icon, LayersIcon, SendIcon, UsersIcon, VideoIcon } from 'lucide-react'

import { BtnGhost, BtnPrimary, MiniBar, Panel } from '@/components/generics/brand-ui'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import { IClientCoverageResponse, IPostsCoverageResponse, PostArtifact } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber, getMissingVideo } from '../../page-utils'
import PeriodPicker from '../PeriodPicker'
import ClientCoverageList from './ClientCoverageList'

interface Gap {
    icon: React.ReactNode
    tone: string
    title: string
    detail: string
    action: string
    onAction?: () => void
}

interface Props {
    coverage: IPostsCoverageResponse
    clientCoverage: IClientCoverageResponse | null
    loading: boolean
    loadingClients: boolean
    updatingClients: boolean
    publishing: boolean
    period: string
    search: string
    onPeriodChange: (period: string) => void
    onSearch: (search: string) => void
    onChangePage: (page: number) => void
    onPublish: (sectionKeys: string[], artifacts: PostArtifact[]) => void
}

const Coverage = ({
    coverage, clientCoverage, loading, loadingClients, updatingClients, publishing, period, search,
    onPeriodChange, onSearch, onChangePage, onPublish,
}: Props) => {
    const emptySections = coverage.sections.filter(section => section.posts === 0)
    const sectionsMissingVideo = coverage.sections.filter(section => getMissingVideo(section) > 0)
    const totalMissingVideo = sectionsMissingVideo.reduce((total, section) => total + getMissingVideo(section), 0)

    /* Huecos ya interpretados: lo que el admin tendría que deducir mirando la lista */
    const gaps = useMemo<Gap[]>(() => {
        const items: Gap[] = []

        emptySections.forEach(section => {
            items.push({
                icon: <AlertTriangleIcon className="size-4" />,
                tone: 'border-rose-200 bg-rose-50 text-rose-600',
                title: `${section.name} sin publicaciones`,
                detail: 'Sección completa vacía · no se ha lanzado este mes',
                action: 'Publicar sección',
                onAction: () => onPublish([section.section_key], section.artifacts),
            })
        })

        const clientsWithoutPosts = (clientCoverage?.items ?? []).filter(
            row => Object.values(row.cells).filter(state => state === 'empty').length >= 4,
        )
        clientsWithoutPosts.forEach(row => {
            items.push({
                icon: <UsersIcon className="size-4" />,
                tone: 'border-rose-200 bg-rose-50 text-rose-600',
                title: `${row.client_name} sin publicaciones mensuales`,
                detail: `${row.gaps} secciones vacías · probable reporte del mes sin importar`,
                action: 'Ver cliente',
            })
        })

        if (totalMissingVideo > 0) {
            items.push({
                icon: <VideoIcon className="size-4" />,
                tone: 'border-amber-200 bg-amber-50 text-amber-600',
                title: `${formatNumber(totalMissingVideo)} publicaciones sin video`,
                detail: sectionsMissingVideo
                    .map(section => `${section.name} (${getMissingVideo(section)})`)
                    .join(' · '),
                action: 'Publicar video',
                onAction: () => onPublish(sectionsMissingVideo.map(section => section.section_key), ['video']),
            })
        }

        return items
    }, [emptySections, clientCoverage?.items, sectionsMissingVideo, totalMissingVideo, onPublish])

    const pendingSections = coverage.sections.filter(section => (section.pending ?? 0) > 0)
    const totalPending = pendingSections.reduce((total, section) => total + (section.pending ?? 0), 0)

    if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <PeriodPicker period={period} onChange={onPeriodChange} />
                <div className="flex-1" />
                {totalPending > 0 && (
                    <BtnPrimary
                        className="text-xs"
                        disabled={publishing}
                        onClick={() => onPublish(pendingSections.map(section => section.section_key), ['image', 'video'])}
                    >
                        <SendIcon className="size-3.5" />
                        Publicar huecos ({formatNumber(totalPending)})
                    </BtnPrimary>
                )}
            </div>

            {/* Protagonistas del tab: el diagnóstico va antes que el detalle por cliente */}
            <div className="grid items-start gap-4 lg:grid-cols-2">
                <Panel className="overflow-hidden">
                    <header className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
                        <span className={cn(
                            'grid size-8 shrink-0 place-content-center rounded-lg border',
                            gaps.length ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600',
                        )}>
                            {gaps.length ? <AlertTriangleIcon className="size-4" /> : <CheckCircle2Icon className="size-4" />}
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Huecos detectados</h3>
                            <p className="text-[11px] font-medium text-muted-foreground">Lo que falta por publicar en el periodo</p>
                        </div>
                        {gaps.length > 0 && (
                            <span className="ml-auto rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600 tabular-nums">
                                {gaps.length}
                            </span>
                        )}
                    </header>
                    {gaps.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm font-medium text-muted-foreground">
                            Sin huecos en el periodo. Todas las secciones tienen publicaciones completas.
                        </p>
                    ) : (
                        <ul>
                            {gaps.map(gap => (
                                <li key={gap.title} className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                                    <span className={cn('grid size-8 shrink-0 place-content-center rounded-lg border', gap.tone)}>
                                        {gap.icon}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-foreground">{gap.title}</p>
                                        <p className="truncate text-[10.5px] font-medium text-muted-foreground">{gap.detail}</p>
                                    </div>
                                    <BtnGhost className="shrink-0 px-3 py-1.5 text-[11px]" disabled={!gap.onAction || publishing} onClick={gap.onAction}>
                                        {gap.action}
                                    </BtnGhost>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel className="overflow-hidden">
                    <header className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
                        <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-brand-violet-soft text-brand-violet">
                            <LayersIcon className="size-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Cobertura por sección</h3>
                            <p className="text-[11px] font-medium text-muted-foreground">Publicaciones creadas frente a archivos completos</p>
                        </div>
                    </header>
                    <div className="grid gap-x-6 gap-y-3.5 p-5 sm:grid-cols-2">
                        {coverage.sections.map(section => {
                            const missingVideo = getMissingVideo(section)

                            return (
                                <div key={section.section_key} className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline justify-between gap-2 text-[11.5px] font-semibold">
                                        <span className="truncate text-foreground">{section.name}</span>
                                        <span className="shrink-0 text-muted-foreground">
                                            {formatNumber(section.posts)} posts
                                            {missingVideo > 0 && ` · ${missingVideo} sin video`}
                                        </span>
                                    </div>
                                    <MiniBar
                                        value={section.posts === 0 ? 1 : section.with_video || section.with_image}
                                        total={section.posts === 0 ? 1 : section.posts}
                                        tone={section.posts === 0 ? 'bad' : missingVideo > 0 ? 'warn' : 'ok'}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </Panel>
            </div>

            {loadingClients || !clientCoverage ? (
                <Skeleton className="h-72 w-full rounded-2xl" />
            ) : (
                <ClientCoverageList
                    data={clientCoverage}
                    search={search}
                    updating={updatingClients}
                    onSearch={onSearch}
                    onChangePage={onChangePage}
                />
            )}
        </div>
    )
}

export default Coverage
