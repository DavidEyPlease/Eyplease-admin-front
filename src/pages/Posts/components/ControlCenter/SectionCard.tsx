import { ClockIcon, ImageIcon, BellIcon, SendIcon, VideoIcon } from 'lucide-react'

import { BtnPrimary, Panel } from '@/components/generics/brand-ui'
import { Badge } from '@/uishadcn/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/uishadcn/ui/tooltip'
import { ISectionCoverage } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber, formatRelativeTime, getCadenceHint, getPublishDisabledReason, getSectionHealth } from '../../page-utils'

/** Fila métrica: icono + etiqueta, barra y "hechas/total". El total SIEMPRE es posts creados. */
const MetricRow = ({ icon, label, value, total }: { icon: React.ReactNode, label: string, value: number, total: number }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0
    const fill = total === 0 || percent === 0 ? 'bg-rose-400' : percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'

    return (
        <div className="flex items-center gap-2.5">
            <span className="flex w-[70px] shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground [&_svg]:size-3">
                {icon}
                {label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span className={cn('block h-full rounded-full transition-all', fill)} style={{ width: `${percent}%` }} />
            </span>
            <span className="w-[62px] shrink-0 text-right text-[11px] font-bold tabular-nums text-muted-foreground">
                {formatNumber(value)}/{formatNumber(total)}
            </span>
        </div>
    )
}

interface Props {
    section: ISectionCoverage
    publishing: boolean
    onPublish: () => void
}

const SectionCard = ({ section, publishing, onPublish }: Props) => {
    const health = getSectionHealth(section)
    const hasVideo = section.artifacts.includes('video')
    const subsections = section.subsections
    const disabledReason = getPublishDisabledReason(section)
    const publishHint = disabledReason
        ?? (section.pending === null
            ? 'Crea los archivos que falten. Todavía no se ha revisado cuántos son.'
            : `Crea los ${formatNumber(section.pending)} archivos que faltan`)

    return (
        <Panel className={cn('flex flex-col gap-3 p-4 transition-shadow hover:shadow-panel-hover', health.tone !== 'ok' && 'border-amber-200/80')}>
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">{section.name}</h3>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted underline-offset-2">
                                    {section.cadence === 'daily' ? `Diaria · ${section.scheduled_at}` : 'Mensual'}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-56">{getCadenceHint(section)}</TooltipContent>
                        </Tooltip>
                        {subsections.length > 0 && ` · ${subsections.length} subsecciones`}
                    </p>
                </div>
                <Badge variant="outline" className={cn('shrink-0 rounded-full px-2 text-[10px] font-bold', health.badge)}>
                    {health.label}
                </Badge>
            </div>

            <p className="text-xs font-medium text-muted-foreground">
                <span className="text-lg font-bold tracking-tight text-foreground">{formatNumber(section.posts)}</span>
                {' '}publicaciones este mes
                {!hasVideo && ' · no genera video'}
            </p>

            <div className="flex flex-col gap-2">
                <MetricRow icon={<ImageIcon />} label="Imagen" value={section.with_image} total={section.posts} />
                {hasVideo && <MetricRow icon={<VideoIcon />} label="Video" value={section.with_video} total={section.posts} />}
                {/* <MetricRow icon={<BellIcon />} label="Push" value={section.notified} total={section.posts} /> */}
            </div>

            {subsections.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex h-1.5 gap-0.5">
                        {subsections.map(subsection => (
                            <Tooltip key={subsection.item_key}>
                                <TooltipTrigger asChild>
                                    <span
                                        className={cn(
                                            'block rounded-sm',
                                            subsection.posts > 0 ? 'bg-brand-gradient-r' : 'border border-rose-200 bg-rose-50',
                                        )}
                                        style={{ flex: Math.max(subsection.posts, 1) }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>{subsection.name}: {formatNumber(subsection.posts)} publicaciones</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] font-semibold">
                        {subsections.map(subsection => (
                            <span key={subsection.item_key} className={subsection.posts > 0 ? 'text-muted-foreground' : 'text-rose-500'}>
                                {subsection.name} <b className={subsection.posts > 0 ? 'text-foreground' : 'text-rose-600'}>{formatNumber(subsection.posts)}</b>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-auto flex items-center gap-2 border-t border-dashed border-border pt-3">
                <span className="flex flex-1 items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground">
                    <ClockIcon className="size-3 shrink-0" />
                    {formatRelativeTime(section.last_activity_at)}
                </span>
                {/* Un botón deshabilitado no dispara eventos: el tooltip cuelga del wrapper */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="shrink-0">
                            <BtnPrimary className="px-3 py-1.5 text-xs" disabled={publishing || !!disabledReason} onClick={onPublish}>
                                <SendIcon className="size-3" />
                                Publicar
                            </BtnPrimary>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-56">{publishHint}</TooltipContent>
                </Tooltip>
            </div>
        </Panel>
    )
}

export default SectionCard
