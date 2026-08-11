import { useMemo } from 'react'
import { CheckCircle2Icon, UsersIcon } from 'lucide-react'

import { MiniBar, Panel } from '@/components/generics/brand-ui'
import { EmptySection } from '@/components/generics/EmptySection'
import UIPagination from '@/components/generics/Pagination'
import SearchInput from '@/components/generics/SearchInput'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/uishadcn/ui/tooltip'
import { IClientCoverageResponse, IClientCoverageRow, ICoverageColumn } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber, NEWSLETTER_LABEL, PROBLEM_CELL_UI, ProblemCellState } from '../../page-utils'

interface Props {
    data: IClientCoverageResponse
    search: string
    /** Refetch en curso: se atenúa la lista en vez de desmontarla, para no dar el salto */
    updating: boolean
    onSearch: (search: string) => void
    onChangePage: (page: number) => void
}

/** Resumen por cliente contando solo las secciones que su plan incluye. */
const getRowSummary = (row: IClientCoverageRow, columns: ICoverageColumn[]) => {
    const included = columns.filter(column => (row.cells[column.section_key] ?? 'empty') !== 'not_included')
    const problems = included.filter(column => {
        const state = row.cells[column.section_key] ?? 'empty'
        return state === 'empty' || state === 'partial'
    })
    const full = included.length - problems.length
    const hasEmpty = problems.some(column => (row.cells[column.section_key] ?? 'empty') === 'empty')

    return {
        included: included.length,
        full,
        problems,
        tone: problems.length === 0 ? ('ok' as const) : hasEmpty ? ('bad' as const) : ('warn' as const),
    }
}

const ClientCoverageList = ({ data, search, updating, onSearch, onChangePage }: Props) => {
    /* Unidad y nacional repiten nombre («Cumpleaños», «Aniversarios») → se desambigua en el chip */
    const duplicatedNames = useMemo(() => {
        const counts = new Map<string, number>()
        data.columns.forEach(column => counts.set(column.name, (counts.get(column.name) ?? 0) + 1))
        return new Set([...counts].filter(([, total]) => total > 1).map(([name]) => name))
    }, [data.columns])

    const getColumnLabel = (column: ICoverageColumn) =>
        duplicatedNames.has(column.name) && column.newsletter
            ? `${column.name} · ${NEWSLETTER_LABEL[column.newsletter]}`
            : column.name

    return (
        <Panel className="overflow-hidden">
            <header className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-3.5">
                <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-brand-violet-soft text-brand-violet">
                    <UsersIcon className="size-4" />
                </span>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">Clientes</h3>
                    <p className="text-[11px] font-medium text-muted-foreground">
                        {formatNumber(data.total_items)} con publicaciones · ordenados por huecos
                    </p>
                </div>
                <div className="ml-auto w-full sm:max-w-xs">
                    <SearchInput value={search} placeholder="Nombre o cuenta…" onSubmitSearch={onSearch} />
                </div>
            </header>

            <div className={cn('transition-opacity duration-200', updating && 'pointer-events-none opacity-50')}>
                {data.items.length === 0 ? (
                    <EmptySection
                        title="Sin clientes con publicaciones"
                        description={search
                            ? 'Ningún cliente coincide con la búsqueda en este periodo.'
                            : 'No hay publicaciones en el periodo seleccionado.'}
                    />
                ) : (
                    <ul className="divide-y divide-border/60">
                        {data.items.map(row => {
                            const summary = getRowSummary(row, data.columns)

                            return (
                                <li key={row.client_id} className="flex flex-col gap-2.5 px-5 py-3.5 transition-colors hover:bg-muted/30 lg:flex-row lg:items-center lg:gap-5">
                                    <div className="min-w-0 shrink-0 lg:w-60">
                                        <p className="truncate text-[13px] font-semibold text-foreground">{row.client_name}</p>
                                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-muted-foreground">
                                            {row.client_account && <span>{row.client_account}</span>}
                                            {row.client_account && row.plan_name && <span aria-hidden>·</span>}
                                            {row.plan_name && <span className="truncate text-brand-violet">{row.plan_name}</span>}
                                        </p>
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                                        {summary.problems.length === 0 ? (
                                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                                                <CheckCircle2Icon className="size-3.5" />
                                                Cobertura completa
                                            </span>
                                        ) : (
                                            summary.problems.map(column => {
                                                const state = (row.cells[column.section_key] ?? 'empty') as ProblemCellState
                                                const ui = PROBLEM_CELL_UI[state]

                                                return (
                                                    <Tooltip key={column.section_key}>
                                                        <TooltipTrigger asChild>
                                                            <span className={cn('inline-flex cursor-default items-center rounded-md border px-2 py-0.5 text-[10.5px] font-semibold', ui.chip)}>
                                                                {getColumnLabel(column)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{ui.label}</TooltipContent>
                                                    </Tooltip>
                                                )
                                            })
                                        )}
                                    </div>

                                    <div className="flex w-full shrink-0 flex-col gap-1 lg:w-44">
                                        <span className="flex items-baseline justify-between gap-2 text-[10.5px] font-semibold text-muted-foreground">
                                            <span>Secciones de su plan</span>
                                            <span className="tabular-nums">{summary.full}/{summary.included}</span>
                                        </span>
                                        <MiniBar value={summary.full} total={summary.included} tone={summary.tone} />
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}

                <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border/60 bg-muted/40 px-5 py-3">
                    {Object.entries(PROBLEM_CELL_UI).map(([state, ui]) => (
                        <span key={state} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                            <span className={cn('size-2.5 rounded-full', ui.legend)} />
                            {ui.label}
                        </span>
                    ))}

                    <span className="ml-auto flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                        {formatNumber(data.items.length)} de {formatNumber(data.total_items)} clientes
                        <UIPagination
                            page={data.current_page}
                            totalPages={data.last_page}
                            perPage={data.per_page}
                            showPerPage={false}
                            onChangePage={onChangePage}
                        />
                    </span>
                </footer>
            </div>
        </Panel>
    )
}

export default ClientCoverageList
