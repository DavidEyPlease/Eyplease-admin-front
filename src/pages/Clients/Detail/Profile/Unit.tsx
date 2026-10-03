import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, UsersRoundIcon } from "lucide-react";

import { API_ROUTES } from "@/constants/api";
import { APP_ROUTES } from "@/constants/app";
import useListQuery from "@/hooks/useListQuery";
import { PaginationResponse } from "@/interfaces/common";
import { INetworkPerson, NetworkRankGroupType } from "@/interfaces/vendors";
import { cn } from "@/lib/utils";
import { replaceRecordIdInPath } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import { initials, titleCase } from "../../List/names";
import UpdateNetwork from "../components/Network/UpdateNetwork";

const PER_PAGE = 24

const GROUPS: Array<{ value: NetworkRankGroupType, label: string }> = [
    { value: 'unity', label: 'Unidad' },
    { value: 'directors', label: 'Directoras' },
]

const Person = ({ person }: { person: INetworkPerson }) => {
    const name = titleCase(person.name)
    const body = (
        <>
            {person.photo?.url
                ? <img src={person.photo.url} alt="" loading="lazy" className="size-10 shrink-0 rounded-[13px] object-cover" />
                : <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-primary/10 text-[12px] font-extrabold text-primary">{initials(person.name)}</span>}
            <span className="min-w-0 flex-1">
                <b className="block truncate text-[13.5px] font-bold">{name}</b>
                <small className="block truncate text-[11.5px] text-muted-foreground"><span className="tabular-nums">{person.account}</span>{person.rank ? ` · ${person.rank}` : ''}</small>
            </span>
            {person.isClient && <span className={cn('pulse-tag shrink-0', person.isClientActive ? 'ok' : 'plain')}>{person.isClientActive ? 'Clienta activa' : 'Clienta'}</span>}
        </>
    )
    const className = "flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-foreground/[.035]"

    /* Si también es clienta de Eyplease+, su nombre lleva a su propia ficha */
    return person.isClient
        ? <Link to={replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, person.id)} className={className}>{body}</Link>
        : <div className={className}>{body}</div>
}

/**
 * Su unidad (o sus Directoras), con buscador que filtra al escribir, y el botón de siempre para
 * subir el Excel que la actualiza.
 */
const Unit = ({ clientId }: { clientId: string }) => {
    const {
        response,
        isLoading,
        page,
        filters,
        onApplyFilters,
        onChangePage,
        setSearch,
    } = useListQuery<PaginationResponse<INetworkPerson>, { vendorRole: NetworkRankGroupType }>({
        endpoint: replaceRecordIdInPath(API_ROUTES.CLIENTS.GET_NETWORK, clientId),
        defaultPerPage: PER_PAGE,
        defaultFilters: { vendorRole: 'unity' },
        customQueryKey: (params) => queryKeys.list(`client/${clientId}/network`, params),
    })
    const group = filters.vendorRole || 'unity'
    const people = response?.items ?? []
    const total = response?.total_items ?? 0
    const lastPage = response?.last_page ?? 1
    const current = page || 1

    /* Busca al dejar de teclear, sin tener que dar Enter */
    const [text, setText] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => setSearch(text.trim()), 350)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text])

    return (
        <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-[15px] font-extrabold"><UsersRoundIcon className="size-4 text-[#6C47FF] dark:text-[#A894FF]" /> {group === 'directors' ? 'Sus Directoras' : 'Su unidad'}</h2>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{isLoading && !response ? 'Cargando…' : `${total.toLocaleString('es-MX')} ${total === 1 ? 'persona' : 'personas'}`}</p>
                </div>
                <UpdateNetwork clientId={clientId} rolSelected={group} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="inline-flex shrink-0 rounded-xl border border-border bg-card/60 p-1">
                    {GROUPS.map(item => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onApplyFilters({ vendorRole: item.value })}
                            className={cn('h-8 cursor-pointer rounded-lg px-3.5 text-[12.5px] font-bold transition-colors', group === item.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={text} onChange={event => setText(event.target.value)} placeholder="Nombre o código…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                </label>
            </div>

            <div className="mt-3 grid min-w-0 grid-cols-1 gap-0.5 md:grid-cols-2">
                {isLoading && !response
                    ? Array.from({ length: 8 }, (_, index) => <span key={index} className="m-1 h-12 animate-pulse rounded-2xl bg-foreground/[.06]" />)
                    : people.map(person => <Person key={person.id} person={person} />)}
            </div>

            {!isLoading && !people.length && (
                <p className="px-2 py-10 text-center text-[13px] text-muted-foreground">
                    {text.trim() ? 'Nadie con ese nombre o código.' : group === 'directors' ? 'No tiene Directoras cargadas.' : 'Su unidad está vacía: sube su Excel con «Actualizar red».'}
                </p>
            )}

            {lastPage > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                    <button type="button" disabled={current <= 1} onClick={() => onChangePage(current - 1)} className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl px-3 text-[12.5px] font-bold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-default disabled:opacity-40">
                        <ChevronLeftIcon className="size-4" /> Anterior
                    </button>
                    <span className="text-[12px] font-semibold text-muted-foreground tabular-nums">Página {current} de {lastPage}</span>
                    <button type="button" disabled={current >= lastPage} onClick={() => onChangePage(current + 1)} className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl px-3 text-[12.5px] font-bold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-default disabled:opacity-40">
                        Siguiente <ChevronRightIcon className="size-4" />
                    </button>
                </div>
            )}
        </section>
    )
}

export default Unit;
