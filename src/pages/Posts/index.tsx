import { useState } from 'react'
import { GaugeIcon, GridIcon } from 'lucide-react'

import { PostArtifact } from '@/interfaces/posts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uishadcn/ui/tabs'
import ControlCenter from './components/ControlCenter'
import Coverage from './components/Coverage'
import { defaultPeriod } from './page-utils'
import { useClientCoverage, usePostRenderRuns, usePostsCoverage, usePublishPosts } from './usePosts'

const TABS = [
    { value: 'control', label: 'Centro de control', icon: <GaugeIcon /> },
    { value: 'coverage', label: 'Cobertura', icon: <GridIcon /> },
]

const PostsPage = () => {
    const [period, setPeriod] = useState(defaultPeriod)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const { coverage, loading, isRefetching } = usePostsCoverage(period)
    const { clientCoverage, loading: loadingClients, updating: updatingClients } = useClientCoverage(period, page, undefined, search)
    const { runs, loading: loadingRuns } = usePostRenderRuns()
    const { publish, publishing } = usePublishPosts(period)

    const onPublish = (sectionKeys: string[], artifacts: PostArtifact[]) => {
        publish(sectionKeys, artifacts)
    }

    const onPeriodChange = (next: string) => {
        setPeriod(next)
        setPage(1)
    }

    const onSearch = (next: string) => {
        setSearch(next)
        setPage(1)
    }

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center gap-2.5">
                <span className="h-7 w-1.5 rounded-full bg-brand-gradient-v" />
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Publicaciones</h1>
            </div>

            <Tabs defaultValue={TABS[0].value} className="gap-4">
                <TabsList>
                    {TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="control">
                    <ControlCenter
                        coverage={coverage}
                        runs={runs}
                        loading={loading}
                        isRefetching={isRefetching}
                        loadingRuns={loadingRuns}
                        publishing={publishing}
                        period={period}
                        onPeriodChange={onPeriodChange}
                        onPublish={onPublish}
                    />
                </TabsContent>

                <TabsContent value="coverage">
                    <Coverage
                        coverage={coverage}
                        clientCoverage={clientCoverage}
                        loading={loading}
                        loadingClients={loadingClients}
                        updatingClients={updatingClients}
                        publishing={publishing}
                        period={period}
                        search={search}
                        onPeriodChange={onPeriodChange}
                        onSearch={onSearch}
                        onChangePage={setPage}
                        onPublish={onPublish}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default PostsPage
