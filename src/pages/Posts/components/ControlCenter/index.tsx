import { AlertTriangleIcon, ClockIcon, LayersIcon, Loader2Icon, RefreshCwIcon, VideoIcon } from 'lucide-react'

import { BtnGhost, HeroTile, KpiTile } from '@/components/generics/brand-ui'
import { EmptySection } from '@/components/generics/EmptySection'
import { Separator } from '@/uishadcn/ui/separator'
import { Skeleton } from '@/uishadcn/ui/skeleton'
import { IPostRenderRun, IPostsCoverageResponse, NewsletterCode, PostArtifact } from '@/interfaces/posts'
import { formatNumber, formatPeriodLabel, formatRelativeTime } from '../../page-utils'
import { usePeriodTotals } from '../../usePosts'
import PeriodPicker from '../PeriodPicker'
import LaunchPanel from './LaunchPanel'
import RunsFeed from './RunsFeed'
import SectionCard from './SectionCard'

const NEWSLETTER_GROUPS: { code: NewsletterCode, label: string }[] = [
    { code: 'unit_newsletter', label: 'Boletín de unidad' },
    { code: 'national_newsletter', label: 'Boletín nacional' },
]

interface Props {
    coverage: IPostsCoverageResponse
    runs: IPostRenderRun[]
    loading: boolean
    isRefetching: boolean
    loadingRuns: boolean
    publishing: boolean
    period: string
    onPeriodChange: (period: string) => void
    onPublish: (sectionKeys: string[], artifacts: PostArtifact[]) => void
}

const ControlCenter = ({ coverage, runs, loading, isRefetching, loadingRuns, publishing, period, onPeriodChange, onPublish }: Props) => {
    const totals = usePeriodTotals(coverage)
    const isTargetPeriod = !coverage.current_target_period || coverage.current_target_period === period

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-56 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <HeroTile
                label={formatPeriodLabel(period)}
                value={`${formatNumber(totals.posts)} publicaciones`}
                icon={<LayersIcon className="size-4" />}
                sub={
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {coverage.sections.length} secciones activas
                        <span>·</span>
                        {formatNumber(totals.missingVideo)} sin video
                        <span>·</span>
                        {totals.emptySections} sin publicar
                    </span>
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <PeriodPicker period={period} onChange={onPeriodChange} />
                <div className="flex items-center gap-3">
                    {isRefetching && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <Loader2Icon className="size-3 animate-spin" />
                            Actualizando…
                        </span>
                    )}
                    {coverage.snapshot_at && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <ClockIcon className="size-3" />
                            Cobertura calculada {formatRelativeTime(coverage.snapshot_at)}
                        </span>
                    )}
                </div>
            </div>

            {!isTargetPeriod && (
                <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>
                        Estás viendo <b>{formatPeriodLabel(period)}</b>, un mes cerrado. Publicar solo genera sobre{' '}
                        <b>{formatPeriodLabel(coverage.current_target_period)}</b>, así que aquí no se muestran pendientes.
                    </span>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiTile
                    label="Publicadas"
                    value={formatNumber(totals.posts)}
                    sub={`${coverage.sections.length} secciones activas`}
                    icon={<LayersIcon className="size-4" />}
                />
                <KpiTile
                    label="Sin video"
                    value={formatNumber(totals.missingVideo)}
                    sub="imagen generada, video no"
                    accent="rose"
                    icon={<VideoIcon className="size-4" />}
                />
                <KpiTile
                    label="Sin publicar"
                    value={totals.emptySections}
                    sub="secciones con 0 posts este mes"
                    accent="amber"
                    icon={<AlertTriangleIcon className="size-4" />}
                />
                <KpiTile
                    label="Pendientes"
                    value={totals.hasPendingData ? formatNumber(totals.pending) : '—'}
                    sub="elegibles sin publicación"
                    accent="slate"
                    icon={<ClockIcon className="size-4" />}
                />
            </div>

            {coverage.sections.length === 0 && (
                <EmptySection
                    title="Sin secciones publicables"
                    description="Ninguna sección tiene has_posts activo. Actívalas en la configuración del boletín para poder publicar."
                />
            )}

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-4">
                    {NEWSLETTER_GROUPS.map(group => {
                        const sections = coverage.sections.filter(section => section.newsletter === group.code)
                        if (!sections.length) return null

                        const groupPending = sections.filter(section => (section.pending ?? 0) > 0)

                        return (
                            <section key={group.code} className="flex flex-col gap-3">
                                <header className="flex items-center gap-3">
                                    <h2 className="text-sm font-bold tracking-tight text-foreground">{group.label}</h2>
                                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                                        {sections.length} secciones
                                    </span>
                                    <Separator className="flex-1" />
                                    {groupPending.length > 0 && (
                                        <BtnGhost
                                            className="px-3 py-1.5 text-xs"
                                            disabled={publishing}
                                            onClick={() => onPublish(groupPending.map(section => section.section_key), ['image', 'video'])}
                                        >
                                            <RefreshCwIcon className="size-3" />
                                            Publicar pendientes ({groupPending.length})
                                        </BtnGhost>
                                    )}
                                </header>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {sections.map(section => (
                                        <SectionCard
                                            key={section.section_key}
                                            section={section}
                                            publishing={publishing}
                                            onPublish={() => onPublish([section.section_key], section.artifacts)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>

                <aside className="flex flex-col gap-4 xl:sticky xl:top-4">
                    <RunsFeed runs={runs} loading={loadingRuns} />
                    {coverage.sections.length > 0 && (
                        <LaunchPanel
                            sections={coverage.sections}
                            publishing={publishing}
                            onPublish={onPublish}
                        />
                    )}
                </aside>
            </div>
        </div>
    )
}

export default ControlCenter
