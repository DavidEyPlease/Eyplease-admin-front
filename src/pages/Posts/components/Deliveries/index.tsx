import { useState } from 'react'
import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, Loader2Icon, OctagonAlertIcon } from 'lucide-react'

import { AlertConfirm } from '@/components/generics/AlertConfirm'
import { ClosingDelivery, DeliveriesResponse, DeliveryClient } from '@/interfaces/deliveries'
import { IPostsCoverageResponse, PostArtifact } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber, formatRelativeTime } from '../../page-utils'
import BoardSkeleton from '../Board/BoardSkeleton'
import ClientsCard from './ClientsCard'
import ClosingCard from './ClosingCard'
import LiveCard from './LiveCard'

const ALL_ARTIFACTS: PostArtifact[] = ['image', 'image_square', 'video']

interface Props {
    data: DeliveriesResponse | undefined
    loading: boolean
    isRefetching: boolean
    coverage: IPostsCoverageResponse
    publishing: boolean
    /** Una petición por sección, cada una con sus formatos */
    onLaunch: (sections: Array<{ sectionKey: string, artifacts: PostArtifact[] }>) => Promise<boolean>
    onPublishClient: (clientId: string, clientName: string, sections: Array<{ sectionKey: string, artifacts: PostArtifact[] }>) => Promise<boolean>
}

/** Publicaciones · Entregas del mes: el cierre, lo en vivo y las clientas pendientes. Lo atrasado arriba. */
const Deliveries = ({ data, loading, isRefetching, coverage, publishing, onLaunch, onPublishClient }: Props) => {
    const [confirming, setConfirming] = useState<ClosingDelivery | null>(null)

    if (loading || !data) return <BoardSkeleton />

    /* Los formatos de cada sección salen de sus plantillas del mes (lo mismo que «Qué falta») */
    const withArtifacts = (sectionKeys: string[]) => sectionKeys.map(sectionKey => ({
        sectionKey,
        artifacts: coverage.sections.find(section => section.section_key === sectionKey)?.artifacts ?? ALL_ARTIFACTS,
    }))

    const launch = async () => {
        if (!confirming) return
        await onLaunch(withArtifacts(confirming.sections))
        setConfirming(null)
    }

    const generateFor = (client: DeliveryClient) => {
        const closingSections = data.closing.filter(entry => entry.mode === 'manual').flatMap(entry => entry.sections)
        onPublishClient(client.client_id, client.name, withArtifacts(closingSections))
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <div className="grid gap-2">
                {data.alerts.length === 0 ? (
                    <p className="ent-ok"><CheckCircle2Icon className="size-4 shrink-0" />Todo va en tiempo.</p>
                ) : data.alerts.map(alert => (
                    <p key={alert.id} className={cn('pub-alert', alert.tone === 'bad' && 'ent-bad')}>
                        {alert.tone === 'bad' ? <OctagonAlertIcon className="mt-0.5 size-4 shrink-0" /> : <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />}
                        <span><b>{alert.title}.</b> {alert.text}</span>
                    </p>
                ))}
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    {isRefetching ? <Loader2Icon className="size-3 animate-spin" /> : <ClockIcon className="size-3" />}
                    Revisado {formatRelativeTime(data.generated_at)}
                </span>
            </div>

            <ClosingCard
                closingOf={data.closing_of}
                days={data.days}
                reports={data.reports}
                entries={data.closing}
                publishing={publishing}
                onLaunch={setConfirming}
            />
            <LiveCard lanes={data.live} days={data.days} />
            <ClientsCard clients={data.clients} publishing={publishing} onGeneratePieces={generateFor} />

            <AlertConfirm
                open={!!confirming}
                onOpenChange={() => setConfirming(null)}
                loading={publishing}
                title={confirming ? `¿Lanzar ${confirming.name}?` : ''}
                description={confirming ? `Genera ${formatNumber(confirming.pending)} piezas del cierre y les avisa a las clientas. Sólo saca lo que falta.` : ''}
                onConfirm={launch}
            />
        </div>
    )
}

export default Deliveries
