import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CalendarCheckIcon, GridIcon, ListChecksIcon } from 'lucide-react'

import { PostArtifact } from '@/interfaces/posts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uishadcn/ui/tabs'
import Board from './components/Board'
import ClientsTab from './components/Clients'
import Deliveries from './components/Deliveries'
import { currentPeriod, defaultPeriod } from './page-utils'
import { useClientCoverage, useDeliveries, useLaunchClosing, usePostPauses, usePostRenderRuns, usePostsCoverage, usePublishForClient, usePublishPosts } from './usePosts'
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import '@/pages/Growth/growth.css'
import './posts.css'

const TABS = [
    { value: 'entregas', label: 'Entregas', icon: <CalendarCheckIcon /> },
    { value: 'control', label: 'Qué falta', icon: <ListChecksIcon /> },
    { value: 'coverage', label: 'Por clienta', icon: <GridIcon /> },
]

const HEAD: Record<string, { title: React.ReactNode, sub: string }> = {
    entregas: { title: <>Lo que se entrega <em>este mes</em></>, sub: 'El cierre, lo en vivo y las clientas pendientes. Lo atrasado, arriba.' },
    control: { title: <>Qué falta por publicar <em>y por qué</em></>, sub: 'Cada archivo que todavía no sale, según lo que lo detiene: falta arte, está listo para generarse, se está generando o está apagado a propósito.' },
}

const PostsPage = () => {
    /* La pestaña va en la dirección (`?tab=control`): la torre de control enlaza directo a Entregas */
    const [params, setParams] = useSearchParams()
    const tab = TABS.some(item => item.value === params.get('tab')) ? params.get('tab') as string : TABS[0].value
    const onTabChange = (next: string) => setParams(current => { current.set('tab', next); return current }, { replace: true })

    const [period, setPeriod] = useState(defaultPeriod)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const { coverage, loading, isRefetching } = usePostsCoverage(period)
    const { clientCoverage, loading: loadingClients, updating: updatingClients } = useClientCoverage(period, page, undefined, search)
    const { runs, loading: loadingRuns } = usePostRenderRuns()
    const { publish, publishing } = usePublishPosts(period)
    const { pause, resume, saving } = usePostPauses()
    const { publishForClient, publishingClient } = usePublishForClient(period)
    const { deliveries, loading: loadingDeliveries, isRefetching: refetchingDeliveries } = useDeliveries()
    const { launch, launching } = useLaunchClosing()
    const { publishForClient: publishClientNow, publishingClient: publishingClientNow } = usePublishForClient(currentPeriod())

    const onPublish = (sectionKeys: string[], artifacts: PostArtifact[]) => {
        publish(sectionKeys, artifacts)
    }

    const onPeriodChange = (next: string) => {
        setPeriod(next)
        setPage(1)
    }

    // Estable: la búsqueda de «Por clienta» la usa en un efecto con espera.
    const onSearch = useCallback((next: string) => {
        setSearch(next)
        setPage(1)
    }, [])

    return (
        <div className="flex min-w-0 flex-col gap-4">
            {isNewShell() ? (
                <PageHead eyebrow="Operación · Publicaciones" title={(HEAD[tab] ?? HEAD.control).title} sub={(HEAD[tab] ?? HEAD.control).sub} />
            ) : (
                <div className="flex items-center gap-2.5">
                    <span className="h-7 w-1.5 rounded-full bg-brand-gradient-v" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Publicaciones</h1>
                </div>
            )}

            <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
                <TabsList className="max-w-full justify-start overflow-x-auto">
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="entregas">
                    <Deliveries
                        data={deliveries}
                        loading={loadingDeliveries}
                        isRefetching={refetchingDeliveries}
                        coverage={coverage}
                        publishing={launching || publishingClientNow}
                        onLaunch={launch}
                        onPublishClient={publishClientNow}
                    />
                </TabsContent>

                <TabsContent value="control">
                    <Board
                        coverage={coverage}
                        runs={runs}
                        loading={loading}
                        isRefetching={isRefetching}
                        loadingRuns={loadingRuns}
                        publishing={publishing}
                        saving={saving}
                        period={period}
                        onPeriodChange={onPeriodChange}
                        onPublish={onPublish}
                        onPause={pause}
                        onResume={resume}
                    />
                </TabsContent>

                <TabsContent value="coverage">
                    <ClientsTab
                        coverage={coverage}
                        clientCoverage={clientCoverage}
                        loading={loadingClients}
                        updating={updatingClients}
                        publishing={publishing || publishingClient}
                        period={period}
                        search={search}
                        onPeriodChange={onPeriodChange}
                        onSearch={onSearch}
                        onChangePage={setPage}
                        onPublishClient={publishForClient}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default PostsPage
