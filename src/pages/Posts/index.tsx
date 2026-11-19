import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CalendarCheckIcon, CalendarClockIcon, GridIcon, ListChecksIcon } from 'lucide-react'

import { PostArtifact } from '@/interfaces/posts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uishadcn/ui/tabs'
import Board from './components/Board'
import ClientsTab from './components/Clients'
import Deliveries from './components/Deliveries'
import MonthPrep from './components/MonthPrep'
import { currentPeriod, defaultPeriod, shiftPeriod } from './page-utils'
import { useMonthPrep, useMonthPrepActions, useMonthPrepRefresh } from './useMonthPrep'
import { useClientCoverage, useDeliveries, useLaunchClosing, usePostPauses, usePostRenderRuns, usePostsCoverage, usePublishForClient, usePublishPosts } from './usePosts'
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import CompanySwitch from "@/components/generics/CompanySwitch"
import { DEFAULT_COMPANY } from "@/constants/companies"
import useCompanyStore from "@/store/company"
import '@/pages/Hoy/hoy.css'
import '@/pages/Sales/ventas.css'
import '@/pages/Growth/growth.css'
import './posts.css'

const TABS = [
    { value: 'entregas', label: 'Entregas', icon: <CalendarCheckIcon /> },
    { value: 'preparar', label: 'Próximo mes', icon: <CalendarClockIcon /> },
    { value: 'control', label: 'Qué falta', icon: <ListChecksIcon /> },
    { value: 'coverage', label: 'Por clienta', icon: <GridIcon /> },
]

const HEAD: Record<string, { title: React.ReactNode, sub: string }> = {
    entregas: { title: <>Lo que se entrega <em>este mes</em></>, sub: 'El cierre, lo en vivo y las clientas pendientes. Lo atrasado, arriba.' },
    preparar: { title: <>Lo que falta para <em>el mes que viene</em></>, sub: 'Para adelantarlo: diseños, boletín, Biblioteca y revistas. Se palomea solo en cuanto se sube.' },
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
    /* «Qué falta» y «Por clienta» se miran por empresa (la API separa secciones y clientas); otra empresa es otra lista */
    const company = useCompanyStore(state => state.company)
    const [lastCompany, setLastCompany] = useState(company)
    if (lastCompany !== company) {
        setLastCompany(company)
        setPage(1)
    }
    const companyTab = tab === 'control' || tab === 'coverage'

    const { coverage, loading, isRefetching } = usePostsCoverage(period, undefined, company)
    /* Entregas es el cierre de Mary Kay: sus formatos salen siempre de las secciones de Mary Kay (si es la que se mira, es la misma consulta) */
    const { coverage: deliveriesCoverage } = usePostsCoverage(period, undefined, DEFAULT_COMPANY)
    const { clientCoverage, loading: loadingClients, updating: updatingClients } = useClientCoverage(period, page, undefined, search, company)
    const { runs, loading: loadingRuns } = usePostRenderRuns()
    const { publish, publishing } = usePublishPosts(period)
    const { pause, resume, saving } = usePostPauses()
    const { publishForClient, publishingClient } = usePublishForClient(period)
    const { deliveries, loading: loadingDeliveries, isRefetching: refetchingDeliveries } = useDeliveries()
    const { launch, launching } = useLaunchClosing()
    const { publishForClient: publishClientNow, publishingClient: publishingClientNow } = usePublishForClient(currentPeriod())

    /* Próximo mes: de entrada el que viene; se puede mirar también el siguiente */
    const nextPeriod = shiftPeriod(currentPeriod(), 1)
    const [prepPeriod, setPrepPeriod] = useState(nextPeriod)
    const { prep, loading: loadingPrep, isRefetching: refetchingPrep, setPrep } = useMonthPrep(prepPeriod, tab === 'preparar')
    const prepActions = useMonthPrepActions(prepPeriod, setPrep)
    const { refresh: refreshPrep, refreshing: refreshingPrep } = useMonthPrepRefresh(prepPeriod, setPrep)

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
                <PageHead eyebrow="Operación · Publicaciones" title={(HEAD[tab] ?? HEAD.control).title} sub={(HEAD[tab] ?? HEAD.control).sub}>
                    {companyTab && <CompanySwitch />}
                </PageHead>
            ) : (
                <div className="flex items-center gap-2.5">
                    <span className="h-7 w-1.5 rounded-full bg-brand-gradient-v" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Publicaciones</h1>
                    {companyTab && <CompanySwitch className="ml-auto" />}
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
                        coverage={deliveriesCoverage}
                        publishing={launching || publishingClientNow}
                        onLaunch={launch}
                        onPublishClient={publishClientNow}
                    />
                </TabsContent>

                <TabsContent value="preparar">
                    <MonthPrep
                        data={prep}
                        loading={loadingPrep}
                        isRefetching={refetchingPrep}
                        refreshing={refreshingPrep}
                        saving={prepActions.saving}
                        period={prepPeriod}
                        nextPeriod={nextPeriod}
                        onPeriodChange={setPrepPeriod}
                        onRefresh={refreshPrep}
                        onMark={prepActions.mark}
                        onAddCustom={prepActions.addCustom}
                        onToggleCustom={prepActions.toggleCustom}
                        onRemoveCustom={prepActions.removeCustom}
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
                        company={company}
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
