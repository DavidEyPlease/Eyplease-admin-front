import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ExternalLinkIcon, SearchIcon } from "lucide-react"

import { DataTable } from "@/components/generics/DataTable"
import UIPagination from "@/components/generics/Pagination"
import Dropdown from "@/components/common/Inputs/Dropdown"
import {
    PAYMENT_METHOD_LABELS,
    PAYMENT_SOURCE_LABELS,
    PAYMENT_STATUS_LABELS,
    PaymentRecord,
    PaymentSource,
} from "@/interfaces/finance"
import { formatDate } from "@/utils/dates"
import { formatMoney, MONTH_LABELS, periodLabel } from "@/utils/finance"
import { useFinancePaymentsPage } from "../useFinancePayments"
import { Panel, StatusPill } from "./ui"

// Radix Select forbids an empty-string item value, so "all" is the sentinel
// for the unfiltered option and is mapped back to an empty filter on change.
const ALL = "all"
const YEARS = [2026, 2027]

const SOURCE_TONE: Record<PaymentSource, string> = {
    stripe: "bg-violet-50 text-violet-600",
    manual: "bg-slate-100 text-slate-500",
    whatsapp_bot: "bg-emerald-50 text-emerald-600",
    import: "bg-sky-50 text-sky-600",
    system: "bg-amber-50 text-amber-600",
}

const SourceBadge = ({ source }: { source: PaymentSource | null }) =>
    source
        ? <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${SOURCE_TONE[source]}`}>{PAYMENT_SOURCE_LABELS[source]}</span>
        : <span className="text-slate-300">—</span>

const columns: ColumnDef<PaymentRecord>[] = [
    {
        id: "client",
        header: "Cliente",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-slate-800">{row.original.clientName ?? row.original.account ?? "—"}</span>
                {row.original.account && <span className="text-xs text-slate-400">{row.original.account}</span>}
            </div>
        ),
    },
    {
        id: "period",
        header: "Periodo",
        cell: ({ row }) => <span className="text-slate-600">{periodLabel(row.original.period)} {row.original.period.slice(0, 4)}</span>,
    },
    {
        id: "amount",
        header: () => <div className="text-right">Monto</div>,
        cell: ({ row }) => <div className="text-right font-semibold text-slate-800">{formatMoney(row.original.amount)}</div>,
    },
    {
        id: "status",
        header: "Estado",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
    },
    {
        id: "source",
        header: "Origen",
        cell: ({ row }) => <SourceBadge source={row.original.source} />,
    },
    {
        id: "method",
        header: "Método",
        cell: ({ row }) => <span className="text-slate-600">{row.original.method ? PAYMENT_METHOD_LABELS[row.original.method] : "—"}</span>,
    },
    {
        id: "paidAt",
        header: "Cobrado",
        cell: ({ row }) => <span className="text-slate-500">{row.original.paidAt ? formatDate(new Date(row.original.paidAt), { date: "medium" }) : "—"}</span>,
    },
    {
        id: "receipt",
        header: () => <span className="sr-only">Recibo</span>,
        cell: ({ row }) => row.original.receiptUrl
            ? <a href={row.original.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#5B47E0] hover:underline">Recibo <ExternalLinkIcon className="h-3.5 w-3.5" /></a>
            : null,
    },
]

const YEAR_OPTIONS = YEARS.map((y) => ({ label: String(y), value: String(y) }))
const MONTH_OPTIONS = [{ label: "Todo el año", value: ALL }, ...MONTH_LABELS.map((label, idx) => ({ label, value: String(idx + 1) }))]
const STATUS_OPTIONS = [{ label: "Todos", value: ALL }, ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ label, value }))]
const SOURCE_OPTIONS = [{ label: "Todos", value: ALL }, ...Object.entries(PAYMENT_SOURCE_LABELS).map(([value, label]) => ({ label, value }))]

const CURRENT_MONTH = new Date().getMonth() + 1

const PaymentsTab = ({ year: initialYear }: { year: number }) => {
    const [year, setYear] = useState(initialYear)
    // Default to the current month; the user can switch to "Todo el año".
    const [month, setMonth] = useState<number | null>(CURRENT_MONTH)
    const [status, setStatus] = useState("")
    const [source, setSource] = useState("")
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")

    const { payments, totalPages, totalItems, perPage, totalAmount, totalCollected, loading } = useFinancePaymentsPage({ year, page, month, status, source, search })

    // Debounced server-side search; reset to the first page on a new query.
    useEffect(() => {
        const id = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
        return () => clearTimeout(id)
    }, [searchInput])

    // Any filter change returns to the first page so results stay in range.
    const onFilter = (apply: () => void) => { apply(); setPage(1) }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5">
            <Panel className="p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Buscar cliente o cuenta..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15"
                        />
                    </div>
                    <Dropdown placeholder="Año" value={String(year)} items={YEAR_OPTIONS} onChange={(v) => onFilter(() => setYear(Number(v)))} />
                    <Dropdown placeholder="Mes" value={month ? String(month) : ALL} items={MONTH_OPTIONS} onChange={(v) => onFilter(() => setMonth(v === ALL ? null : Number(v)))} />
                    <Dropdown placeholder="Estado" value={status || ALL} items={STATUS_OPTIONS} onChange={(v) => onFilter(() => setStatus(v === ALL ? "" : v))} />
                    <Dropdown placeholder="Origen" value={source || ALL} items={SOURCE_OPTIONS} onChange={(v) => onFilter(() => setSource(v === ALL ? "" : v))} />
                </div>
            </Panel>

            <DataTable
                columns={columns}
                data={payments}
                isLoading={loading}
                contentHeader={
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-5">
                        <span className="text-slate-500">{totalItems} pago{totalItems === 1 ? "" : "s"} en el filtro</span>
                        <span className="text-slate-500">
                            Total: <b className="text-slate-800">{formatMoney(totalAmount)}</b>
                            <span className="text-slate-400"> · cobrado {formatMoney(totalCollected)}</span>
                        </span>
                    </div>
                }
            />

            {totalPages > 1 && (
                <UIPagination page={page} totalPages={totalPages} perPage={perPage} showPerPage={false} onChangePage={setPage} />
            )}
        </div>
    )
}

export default PaymentsTab
