import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { HeartIcon, LayersIcon, PencilIcon, UsersRoundIcon } from "lucide-react";

import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import { IClient, IClientListItem, IClientStats } from "@/interfaces/clients";
import { PaginationResponse } from "@/interfaces/common";
import { cn } from "@/lib/utils";
import { replaceRecordIdInPath } from "@/utils";
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";
import { queryKeys } from "@/utils/queryKeys";
import PaymentLinkDialog from "@/components/generics/PaymentLinkDialog";
import ClientForm from "../../components/Form";
import { titleCase } from "../../List/names";
import StatusDialog from "../../List/StatusDialog";
import { statusTarget } from "../../List/statusTarget";
import LinkedAccounts from "../components/LinkedAccounts";
import PinkCircleColombia from "../components/PinkCircleColombia";
import AccountFacts from "./AccountFacts";
import CloneReel from "./CloneReel";
import Hero from "./Hero";
import MonthPulse from "./MonthPulse";
import PlanPicker from "./PlanPicker";
import Unit from "./Unit";
import { countryOf } from "./utils";
import "@/pages/Hoy/hoy.css";

type Tab = 'unit' | 'pink' | 'edit' | 'plan'

const Skeleton = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4" aria-busy>
        <span className="h-[172px] animate-pulse rounded-3xl bg-foreground/[.06]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <span key={index} className="h-[118px] animate-pulse rounded-2xl bg-foreground/[.05]" />)}</div>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <span className="h-[420px] animate-pulse rounded-3xl bg-foreground/[.05]" />
            <span className="h-[420px] animate-pulse rounded-3xl bg-foreground/[.05]" />
        </div>
    </div>
)

/**
 * La ficha de la clienta con el marco nuevo: quién es y cómo va este mes arriba; sus datos y su
 * acceso al portal a la izquierda; su unidad, sus ajustes y la edición a la derecha. Usa los mismos
 * datos y acciones que la ficha de siempre (que sigue en `Legacy` para `?nuevo=0`).
 */
const ClientProfile = () => {
    const params = useParams<{ id: string }>()
    const id = params.id || ''
    const [tab, setTab] = useState<Tab>('unit')
    const [changingStatus, setChangingStatus] = useState(false)
    const [paying, setPaying] = useState(false)

    const { response, loading, setData, fetchRetry } = useFetchQuery<{ client: IClient, stats: IClientStats }>(replaceRecordIdInPath(API_ROUTES.CLIENTS.DETAIL, id), {
        customQueryKey: queryKeys.detail('client', id),
    })
    const detail = response?.client
    const stats = response?.stats ?? null
    const country = countryOf(detail?.country)

    /* Los puntos del mes y si paga con tarjeta vienen en el padrón, no en la ficha: su fila, buscada por cuenta */
    const row = useFetchQuery<PaginationResponse<IClientListItem>>(API_ROUTES.CLIENTS.LIST, {
        queryParams: { page: 1, perPage: 5, search: detail?.account ?? '', country },
        customQueryKey: queryKeys.list('clients/profile-row', { account: detail?.account, country }),
        enabled: !!detail?.account,
        staleTime: 60_000,
    })
    const listRow = row.response?.items?.find(item => item.id === id)

    const client = useMemo<IClientListItem | null>(() => detail ? {
        current_month_points: 0,
        previous_month_points: 0,
        client_current_month_points: 0,
        client_previous_month_points: 0,
        ...listRow,
        ...detail,
        card_subscription: listRow?.card_subscription,
    } : null, [detail, listRow])

    const onClientUpdated = useCallback((event: BrowserEvent<IClient>) => {
        if (!response) return
        setData({ client: event.detail, stats: response.stats })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response])

    useEffect(() => {
        subscribeEvent('client-updated', onClientUpdated as EventListener)
        return () => unsubscribeEvent('client-updated', onClientUpdated as EventListener)
    }, [onClientUpdated])

    if (loading && !response) return <Skeleton />
    if (!client) return <p className="px-2 py-16 text-center text-[13.5px] text-muted-foreground">No encontramos a esta clienta.</p>

    const isColombia = country === 'COL'
    const tabs: Array<{ value: Tab, label: string, icon: ReactNode }> = [
        { value: 'unit', label: 'Su unidad', icon: <UsersRoundIcon className="size-4" /> },
        ...(isColombia ? [{ value: 'pink' as Tab, label: 'Círculo Rosa', icon: <HeartIcon className="size-4" /> }] : []),
        { value: 'plan', label: 'Plan y ajustes', icon: <LayersIcon className="size-4" /> },
        { value: 'edit', label: 'Editar datos', icon: <PencilIcon className="size-4" /> },
    ]

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4">
            <Hero
                client={client}
                onEdit={() => setTab('edit')}
                onPaymentLink={() => setPaying(true)}
                onChangeStatus={() => setChangingStatus(true)}
            />

            <MonthPulse client={client} stats={stats} country={country} pointsLoading={row.loading && !row.response} />

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="grid min-w-0 grid-cols-1 gap-4">
                    <AccountFacts client={client} />
                    <LinkedAccounts clientId={client.id} />
                </aside>

                <div className="grid min-w-0 grid-cols-1 gap-3">
                    <nav className="flex min-w-0 gap-1 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Secciones de la ficha">
                        {tabs.map(item => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setTab(item.value)}
                                aria-current={tab === item.value ? 'page' : undefined}
                                className={cn(
                                    'inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 text-[13px] font-bold transition-colors',
                                    tab === item.value ? 'shell-grad text-white shadow-[0_8px_18px_-10px_rgba(108,71,255,.9)]' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                                )}
                            >
                                {item.icon}{item.label}
                            </button>
                        ))}
                    </nav>

                    {tab === 'unit' && <Unit clientId={client.id} />}
                    {tab === 'pink' && isColombia && <PinkCircleColombia clientId={client.id} />}
                    {tab === 'plan' && (
                        <div className="grid min-w-0 grid-cols-1 gap-4">
                            <PlanPicker key={client.user?.plan?.id ?? 'none'} clientId={client.id} activePlanId={client.user?.plan?.id ?? null} />
                            <CloneReel clientId={client.id} userId={client.user?.id} />
                        </div>
                    )}
                    {tab === 'edit' && (
                        <ClientForm client={client} onSetClient={updated => setData({ client: updated, stats: response!.stats })} />
                    )}
                </div>
            </div>

            <StatusDialog
                target={changingStatus ? statusTarget(client) : null}
                onClose={() => setChangingStatus(false)}
                onChanged={() => fetchRetry()}
            />
            <PaymentLinkDialog account={paying ? client.account : null} name={titleCase(client.name)} onClose={() => setPaying(false)} />
        </div>
    )
}

export default ClientProfile;
