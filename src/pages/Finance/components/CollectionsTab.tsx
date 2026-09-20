import { useEffect, useMemo, useState } from "react"
import { BanknoteIcon, CheckIcon, ChevronRightIcon, CopyIcon, CreditCardIcon, FileTextIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/uishadcn/ui/dialog"
import Spinner from "@/components/common/Spinner"
import Dropdown from "@/components/common/Inputs/Dropdown"
import DateInput from "@/components/common/Inputs/DateInput"
import UIPagination from "@/components/generics/Pagination"
import { COLLECTION_STATUS_OPTIONS, CollectionStatus, FinanceClient, FinanceClientPromotion, PaymentStatus } from "@/interfaces/finance"
import { formatDate } from "@/utils/dates"
import { formatDueDate, formatMoney, periodLabel, periodOf, periodPaid, periodRemaining, periodsForYear } from "@/utils/finance"
import FinanceService, { PaymentMethodsConfig } from "@/services/finance.service"
import { useFinanceClientsPage, useMarkPayment, useReviewReceipt } from "../useFinanceClients"
import { BtnGhost, BtnPrimary, ChipTone, MonthChip, Panel } from "./ui"
import { cn } from "@/lib/utils"
import { isNewShell } from "@/layouts/TopShell/useNewShell"


const DEFAULT_STATUS: CollectionStatus = "collectable"

const BILLING_ALL = "all"
const BILLING_OPTIONS = [
    { label: "Todos", value: BILLING_ALL },
    { label: "Stripe", value: "stripe" },
    { label: "Manual", value: "manual" },
]

const MONTHS_ALL = "all"
const OVERDUE_MONTHS_OPTIONS = [
    { label: "Todos los meses", value: MONTHS_ALL },
    { label: "1 mes de retraso", value: "1" },
    { label: "2 meses", value: "2" },
    { label: "3 meses", value: "3" },
    { label: "4+ meses", value: "4" },
]

/** Empty-state copy per selected state (with no other filter active). */
const EMPTY_COPY: Record<CollectionStatus, string> = {
    collectable: "Nadie tiene pagos por cobrar. 🎉",
    overdue: "Sin clientes en retraso. 🎉",
    pending: "Sin pagos por vencer.",
    in_review: "Sin comprobantes por revisar.",
    paid: "Sin pagos registrados este año.",
}

/** Month chip tone per payment status — same palette as StatusPill. */
const CHIP_TONE_BY_STATUS: Partial<Record<Exclude<PaymentStatus, null>, ChipTone>> = {
    overdue: "rose",
    partial: "sky",
    pending: "amber",
    in_review: "violet",
}

/** A client's periods of the year, bucketed by what the admin can do with them. */
interface CollectionRow {
    client: FinanceClient
    /** overdue | partial — behind on payment. */
    overduePeriods: string[]
    /** pending — booked, due day still ahead. */
    pendingPeriods: string[]
    /** in_review — receipt uploaded by the client, awaiting validation. */
    reviewPeriods: string[]
    overdueAmount: number
    pendingAmount: number
    reviewAmount: number
}

const buildRow = (client: FinanceClient, periods: string[]): CollectionRow => {
    const withStatus = (matches: (status: PaymentStatus) => boolean) =>
        periods.filter((p) => matches(client.payments[p]?.status ?? null))
    const remaining = (list: string[]) =>
        list.reduce((acc, p) => acc + periodRemaining(client.payments[p], client.fixedPayment ?? 0), 0)

    const overduePeriods = withStatus((s) => s === "overdue" || s === "partial")
    const pendingPeriods = withStatus((s) => s === "pending")
    const reviewPeriods = withStatus((s) => s === "in_review")

    return {
        client,
        overduePeriods,
        pendingPeriods,
        reviewPeriods,
        overdueAmount: remaining(overduePeriods),
        pendingAmount: remaining(pendingPeriods),
        reviewAmount: remaining(reviewPeriods),
    }
}

/** Periods the admin can charge or mark right now (oldest first). */
const collectablePeriods = (row: CollectionRow) => [...row.overduePeriods, ...row.pendingPeriods].sort()

const promoDiscountLabel = (promotion: FinanceClientPromotion) =>
    promotion.discount_type === "percent" ? `${promotion.discount}%` : formatMoney(promotion.discount)

/** Stripe vs. manual billing chip. */
const BillingTypeChip = ({ type }: { type: "stripe" | "manual" }) =>
    type === "stripe" ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#635BFF]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#635BFF]">
            <CreditCardIcon className="h-3 w-3" /> Stripe
        </span>
    ) : (
        <span className="inline-flex shrink-0 items-center rounded-md bg-foreground/[.06] px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Manual</span>
    )

/** Active per-client promotion badge (with a "Vencida" tag once the deadline passed). */
const PromoBadge = ({ promotion }: { promotion: FinanceClientPromotion | null }) => {
    if (!promotion) return <span className="text-xs text-muted-foreground/60">—</span>
    const expired = dayjs(promotion.expires_at).isBefore(dayjs(), "day")
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="truncate text-xs font-medium text-foreground">{promotion.name ?? "Promoción"}</span>
            <span className="shrink-0 rounded-md bg-[#5B47E0]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#5B47E0] dark:text-[#A99BFF]">{promoDiscountLabel(promotion)}</span>
            {expired && <span className="shrink-0 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">Vencida</span>}
        </span>
    )
}

/** "Día 10 · próx. 10 sep" — the day is the agreement, the date comes resolved from the API. */
const ChargeDay = ({ client, compact = false }: { client: FinanceClient; compact?: boolean }) => {
    if (!client.paymentDay && !client.nextChargeDate) return <>—</>
    if (compact) {
        return (
            <p className="text-xs text-[#5B47E0] dark:text-[#A99BFF]">
                {client.paymentDay ? `Día ${client.paymentDay}` : "Cobro automático"} · próx. {formatDueDate(client.nextChargeDate)}
            </p>
        )
    }
    return (
        <div className="flex flex-col leading-tight">
            <span className="font-medium text-foreground">{client.paymentDay ? `Día ${client.paymentDay}` : "Automático"}</span>
            <span className="text-xs text-muted-foreground">próx. {formatDueDate(client.nextChargeDate)}</span>
        </div>
    )
}

/** One chip per period, toned by its status; falls back to the balance or "Al día". */
const PeriodChips = ({ row }: { row: CollectionRow }) => {
    const periods = [...row.overduePeriods, ...row.pendingPeriods, ...row.reviewPeriods].sort()
    if (periods.length) {
        return (
            <>
                {periods.map((p) => (
                    <MonthChip key={p} tone={CHIP_TONE_BY_STATUS[row.client.payments[p]?.status ?? "overdue"] ?? "rose"}>
                        {periodLabel(p).slice(0, 3)}
                    </MonthChip>
                ))}
            </>
        )
    }
    if (row.client.balance > 0) return <MonthChip tone="amber">Saldo</MonthChip>
    return <span className="text-xs text-emerald-600 dark:text-emerald-400">Al día</span>
}

/** The amount that matters most for the row: overdue first, then upcoming, then under review. */
const RowAmount = ({ row }: { row: CollectionRow }) => {
    if (row.overdueAmount > 0) return <span className="font-semibold text-rose-600 dark:text-rose-400">{formatMoney(row.overdueAmount)}</span>
    if (row.pendingAmount > 0) {
        return (
            <span className="font-semibold text-foreground">
                {formatMoney(row.pendingAmount)} <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">por vencer</span>
            </span>
        )
    }
    if (row.reviewAmount > 0) {
        return (
            <span className="font-semibold text-[#5B47E0] dark:text-[#A99BFF]">
                {formatMoney(row.reviewAmount)} <span className="text-[11px] font-medium">en revisión</span>
            </span>
        )
    }
    return <span className="text-muted-foreground/60">—</span>
}

/** Las cifras de titular van sin centavos; las de cada fila, exactas */
const whole = (n: number) => `$${Math.round(n).toLocaleString("es-MX")}`

const chip = (active: boolean) => cn("inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors", active ? "border-transparent bg-foreground text-background" : "border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground")

const CollectionsTab = ({ year, onOpenDetail }: { year: number; onOpenDetail: (id: string) => void }) => {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<CollectionStatus>(DEFAULT_STATUS)
    const [billing, setBilling] = useState<string>(BILLING_ALL)
    const [monthsFilter, setMonthsFilter] = useState<string>(MONTHS_ALL)
    const [minAmountInput, setMinAmountInput] = useState("")
    const [minAmount, setMinAmount] = useState<number>(0)
    const [payDate, setPayDate] = useState<Date | undefined>()
    // Dropdown is uncontrolled (defaultValue), so a state reset alone leaves the
    // old option on screen: bumping this key remounts the selects on "Limpiar".
    const [filtersVersion, setFiltersVersion] = useState(0)
    /* Con el marco nuevo Cobranza sigue el lenguaje de «La caja del mes»: total con su desglose,
       estados como fichas y los filtros finos detrás de un botón. La lógica es la misma. */
    const newShell = isNewShell()
    const [showFilters, setShowFilters] = useState(false)

    // "4" en el dropdown = 4+ (sólo mínimo); el resto es un rango exacto de meses.
    const monthsRange = useMemo(() => {
        if (monthsFilter === MONTHS_ALL) return { min: undefined, max: undefined }
        const n = Number(monthsFilter)
        return n >= 4 ? { min: 4, max: undefined } : { min: n, max: n }
    }, [monthsFilter])

    const { clients, totalPages, totalItems, perPage, totalOverdue, totalPending, totalInReview, loading } = useFinanceClientsPage({
        year,
        page,
        search,
        collectionStatus: status,
        billingType: billing === BILLING_ALL ? undefined : (billing as "stripe" | "manual"),
        overdueMonthsMin: monthsRange.min,
        overdueMonthsMax: monthsRange.max,
        minOverdue: minAmount || undefined,
        paymentDay: payDate ? dayjs(payDate).date() : undefined,
    })
    const { markPayment, marking } = useMarkPayment()
    const { reviewReceipt, reviewing } = useReviewReceipt()
    const periods = useMemo(() => periodsForYear(year), [year])

    const [manageId, setManageId] = useState<string | null>(null)
    const [methods, setMethods] = useState<PaymentMethodsConfig | null>(null)
    const [stripeLoading, setStripeLoading] = useState(false)
    const [showTransfer, setShowTransfer] = useState(false)
    const [abono, setAbono] = useState<Record<string, string>>({}) // monto de abono por periodo

    useEffect(() => {
        FinanceService.getPaymentMethods().then(setMethods).catch(() => { })
    }, [])

    // Debounced server-side search; reset to page 1 on a new query.
    useEffect(() => {
        const id = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
        return () => clearTimeout(id)
    }, [searchInput])

    // Debounced server-side min-amount filter.
    useEffect(() => {
        const id = setTimeout(() => { setMinAmount(Number(minAmountInput) || 0); setPage(1) }, 400)
        return () => clearTimeout(id)
    }, [minAmountInput])

    // Reset to the first page when the year changes.
    useEffect(() => { setPage(1) }, [year])

    const closeManage = () => { setManageId(null); setShowTransfer(false); setAbono({}) }

    const rows = useMemo(() => clients.map((client) => buildRow(client, periods)), [clients, periods])

    // Every filter is applied server-side; we only derive whether any is active
    // for the empty-state copy and the "Limpiar" link. The state filter has its
    // own empty copy, so it doesn't count as "other filters".
    const otherFiltersActive = billing !== BILLING_ALL || monthsFilter !== MONTHS_ALL || minAmount > 0 || Boolean(payDate)
    const filtersActive = status !== DEFAULT_STATUS || otherFiltersActive
    const clearFilters = () => {
        setStatus(DEFAULT_STATUS); setBilling(BILLING_ALL); setMonthsFilter(MONTHS_ALL); setMinAmountInput(""); setPayDate(undefined)
        setFiltersVersion((v) => v + 1)
        setPage(1)
    }
    const emptyCopy = otherFiltersActive ? "Sin resultados con estos filtros." : EMPTY_COPY[status]

    const manageRow = rows.find((r) => r.client.id === manageId)
    const manageCollectable = manageRow ? collectablePeriods(manageRow) : []
    const manageAmount = manageRow ? manageRow.overdueAmount + manageRow.pendingAmount : 0
    // Nothing to charge nor validate: the only thing left is paying next month ahead.
    const manageIsUpToDate = !!manageRow && manageCollectable.length === 0 && manageRow.reviewPeriods.length === 0
    const advancePeriod = manageRow?.client.nextChargeDate ? periodOf(manageRow.client.nextChargeDate) : null

    const markPeriodPaid = async (account: string, period: string, method?: "transfer") => {
        await markPayment({ account, period, status: "paid", source: "manual", method })
    }

    const markMonthPaid = async (account: string, period: string) => {
        await markPeriodPaid(account, period)
        toast.success(`${periodLabel(period)} marcado como pagado`)
    }

    const markAllPaid = async (row: CollectionRow) => {
        await Promise.all(collectablePeriods(row).map((period) => markPeriodPaid(row.client.id, period)))
        toast.success(`${row.client.name} al corriente`)
        closeManage()
    }

    const chargeWithStripe = async (row: CollectionRow) => {
        setStripeLoading(true)
        try {
            const targets = collectablePeriods(row)
            const concept = row.overduePeriods.length ? "Adeudo" : "Pago"
            const res = await FinanceService.createStripeCheckout(
                row.client.id,
                targets,
                row.overdueAmount + row.pendingAmount,
                `${concept} Eyplease+ · ${targets.length} mes(es)`
            )
            navigator.clipboard.writeText(res.checkout_url)
            window.open(res.checkout_url, "_blank")
            toast.success("Link de pago con tarjeta generado y copiado")
        } catch {
            toast.error("No se pudo generar el link de Stripe")
        } finally {
            setStripeLoading(false)
        }
    }

    const registerTransfer = async (row: CollectionRow) => {
        await Promise.all(collectablePeriods(row).map((period) => markPeriodPaid(row.client.id, period, "transfer")))
        toast.success(`Transferencia registrada · ${row.client.name}`)
        closeManage()
    }

    // Registra un abono (pago parcial) de un periodo; el backend acumula y deriva el estatus.
    const registerAbono = async (account: string, period: string) => {
        const amount = Number(abono[period])
        if (!amount || amount <= 0) return
        await markPayment({ account, period, amount, source: "manual" })
        toast.success(`Abono de ${formatMoney(amount)} registrado en ${periodLabel(period)}`)
        setAbono((prev) => ({ ...prev, [period]: "" }))
    }

    // Pays the next open month before its due day. Only offered to manual
    // clients with nothing pending, so periods are always settled in order.
    const registerAdvance = async (row: CollectionRow, period: string) => {
        await markPayment({ account: row.client.id, period, status: "paid", source: "manual" })
        toast.success(`Adelanto de ${periodLabel(period)} registrado · ${row.client.name}`)
    }

    const resolveReceipt = async (row: CollectionRow, period: string, decision: "approve" | "reject") => {
        await reviewReceipt({ account: row.client.id, period, decision })
        toast.success(decision === "approve"
            ? `Comprobante de ${periodLabel(period)} validado · ${row.client.name}`
            : `Comprobante de ${periodLabel(period)} rechazado`)
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5">
            {newShell && (
                <section className="shell-glass rounded-3xl p-[22px]">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <small className="text-[11px] font-bold tracking-[.08em] text-muted-foreground uppercase">Por cobrar en {year}</small>
                            <b className="mt-1 block text-[34px] leading-none font-extrabold tracking-[-.035em] tabular-nums">{whole(totalOverdue + totalPending)}</b>
                        </div>
                        <span className="text-[12.5px] text-muted-foreground"><b className="text-foreground tabular-nums">{totalItems}</b> {totalItems === 1 ? "clienta" : "clientas"} con este filtro</span>
                    </div>
                    {totalOverdue + totalPending > 0 && (
                        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-foreground/[.07]">
                            <i className="block h-full bg-rose-500" style={{ width: `${(totalOverdue / (totalOverdue + totalPending)) * 100}%` }} />
                            <i className="block h-full bg-foreground/25" style={{ width: `${(totalPending / (totalOverdue + totalPending)) * 100}%` }} />
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-rose-500" />En retraso <b className="text-rose-600 tabular-nums dark:text-rose-400">{whole(totalOverdue)}</b></span>
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-foreground/30" />Por vencer <b className="text-foreground tabular-nums">{whole(totalPending)}</b></span>
                        {totalInReview > 0 && <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#6C47FF]" />Con comprobante por validar <b className="text-[#5B47E0] tabular-nums dark:text-[#A99BFF]">{whole(totalInReview)}</b></span>}
                    </div>
                </section>
            )}

            {newShell && (
                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[300px]">
                        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                        <input placeholder="Nombre o cuenta…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                    </label>
                    {COLLECTION_STATUS_OPTIONS.map((option) => (
                        <button key={option.value} type="button" onClick={() => { setStatus(option.value as CollectionStatus); setPage(1) }} className={chip(status === option.value)}>{option.label}</button>
                    ))}
                    <button type="button" onClick={() => setShowFilters((v) => !v)} className={chip(showFilters || otherFiltersActive)}>
                        <SlidersHorizontalIcon className="size-3.5" /> Más filtros{otherFiltersActive ? " ·" : ""}
                    </button>
                    {filtersActive && <button onClick={clearFilters} className="text-[12px] font-bold text-primary hover:underline">Limpiar</button>}
                </div>
            )}

            <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", newShell && !showFilters && "hidden")}>
                <div className={cn("relative w-full sm:max-w-xs", newShell && "hidden")}>
                    <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Buscar por nombre o cuenta..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15" />
                </div>
                <div className={cn("w-full sm:w-40", newShell && "hidden")}>
                    <Dropdown key={`status-${filtersVersion}`} placeholder="Estado" value={status} items={COLLECTION_STATUS_OPTIONS} onChange={(v) => { setStatus(v as CollectionStatus); setPage(1) }} />
                </div>
                <div className="w-full sm:w-44">
                    <Dropdown key={`billing-${filtersVersion}`} placeholder="Tipo de cliente" value={billing} items={BILLING_OPTIONS} onChange={(v) => { setBilling(v); setPage(1) }} />
                </div>
                <div className="w-full sm:w-48">
                    <Dropdown key={`months-${filtersVersion}`} placeholder="Meses de retraso" value={monthsFilter} items={OVERDUE_MONTHS_OPTIONS} onChange={(v) => { setMonthsFilter(v); setPage(1) }} />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground focus-within:border-[#5B47E0]">
                    <span className="whitespace-nowrap text-muted-foreground">Retraso mín. $</span>
                    <input type="number" min={0} step={100} value={minAmountInput} onChange={(e) => setMinAmountInput(e.target.value)} placeholder="0" className="w-20 bg-transparent text-right outline-none" />
                </div>
                <DateInput
                    value={payDate}
                    onChange={(date) => { setPayDate(date); setPage(1) }}
                    placeholder="Día de pago"
                    className="w-full sm:w-auto"
                />
                {filtersActive && !newShell && (
                    <button onClick={clearFilters} className="text-xs font-medium text-[#5B47E0] dark:text-[#A99BFF] hover:underline">Limpiar filtros</button>
                )}
            </div>

            {loading ? (
                <Panel className="p-12"><Spinner size="md" color="primary" /></Panel>
            ) : (
                <>
                    {/* Desktop: table */}
                    <Panel className="hidden overflow-hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-foreground/[.03] text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                                        <th className="px-5 py-3 font-semibold">{newShell ? "Clienta" : "Nombre"}</th>
                                        {!newShell && <th className="px-5 py-3 font-semibold">Cuenta</th>}
                                        {!newShell && <th className="px-5 py-3 font-semibold">Plan</th>}
                                        <th className="px-5 py-3 font-semibold">Día de pago</th>
                                        <th className="px-5 py-3 font-semibold">Promoción</th>
                                        <th className="px-5 py-3 font-semibold">Meses</th>
                                        <th className="px-5 py-3 text-right font-semibold">Por cobrar</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length ? rows.map((row) => (
                                        <tr key={row.client.id} onClick={() => setManageId(row.client.id)} className="cursor-pointer border-b border-border transition hover:bg-foreground/[.04]">
                                            <td className="px-5 py-3.5 font-medium text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span>{row.client.name}</span>
                                                    <BillingTypeChip type={row.client.billingType} />
                                                </div>
                                                {newShell && <small className="mt-0.5 block text-[11.5px] font-normal text-muted-foreground">{row.client.id} · {row.client.plan ?? "sin plan"}</small>}
                                            </td>
                                            {!newShell && <td className="px-5 py-3.5 text-muted-foreground">{row.client.id}</td>}
                                            {!newShell && <td className="px-5 py-3.5 text-muted-foreground">{row.client.plan ?? "—"}</td>}
                                            <td className="px-5 py-3.5 text-muted-foreground"><ChargeDay client={row.client} /></td>
                                            <td className="px-5 py-3.5"><PromoBadge promotion={row.client.promotion} /></td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1"><PeriodChips row={row} /></div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right"><RowAmount row={row} /></td>
                                            <td className="px-5 py-3.5 text-right"><span className="text-xs font-medium text-[#5B47E0] dark:text-[#A99BFF]">Gestionar</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={newShell ? 6 : 8} className="py-16 text-center text-muted-foreground">{emptyCopy}</td></tr>
                                    )}
                                </tbody>
                                {rows.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t border-border bg-foreground/[.03] text-sm">
                                            <td className="px-5 py-3 text-muted-foreground" colSpan={newShell ? 4 : 6}>
                                                <span className="font-medium">{totalItems} {totalItems === 1 ? "cliente" : "clientes"}</span>
                                                <span className="text-muted-foreground"> · retrasado </span><span className="font-semibold text-rose-600 dark:text-rose-400">{formatMoney(totalOverdue)}</span>
                                                <span className="text-muted-foreground"> · por vencer </span><span className="font-semibold text-foreground">{formatMoney(totalPending)}</span>
                                                {totalInReview > 0 && (
                                                    <><span className="text-muted-foreground"> · en revisión </span><span className="font-semibold text-[#5B47E0] dark:text-[#A99BFF]">{formatMoney(totalInReview)}</span></>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right font-bold text-foreground">{formatMoney(totalOverdue + totalPending)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </Panel>

                    {/* Mobile: cards */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {rows.length ? rows.map((row) => (
                            <button key={row.client.id} onClick={() => setManageId(row.client.id)} className="w-full text-left">
                                <Panel className="flex items-center gap-3 p-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-medium text-foreground">{row.client.name}</p>
                                            <BillingTypeChip type={row.client.billingType} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{row.client.id} · {row.client.plan ?? "—"}</p>
                                        <ChargeDay client={row.client} compact />
                                        {row.client.promotion && <div className="mt-1"><PromoBadge promotion={row.client.promotion} /></div>}
                                        <div className="mt-1.5 flex flex-wrap gap-1"><PeriodChips row={row} /></div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <RowAmount row={row} />
                                        <ChevronRightIcon className="ml-auto mt-1 h-4 w-4 text-muted-foreground/60" />
                                    </div>
                                </Panel>
                            </button>
                        )) : (
                            <Panel className="p-10 text-center text-muted-foreground">{emptyCopy}</Panel>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <UIPagination page={page} totalPages={totalPages} perPage={perPage} showPerPage={false} onChangePage={setPage} />
                    )}
                </>
            )}

            {/* Payment management modal */}
            <Dialog open={!!manageId} onOpenChange={(o) => !o && closeManage()}>
                <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-border bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Gestionar pago</DialogTitle>
                        <DialogDescription className="text-muted-foreground">{manageRow?.client.name ?? ""} · {manageRow?.client.id ?? ""}</DialogDescription>
                    </DialogHeader>
                    {manageRow ? (
                        <div className="space-y-4">
                            {/* Charge what's collectable: card or transfer */}
                            {manageCollectable.length > 0 && (
                                <div className="rounded-xl bg-foreground/[.03] p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">{manageRow.overdueAmount > 0 ? "Cobrar adeudo" : "Cobrar"}</span>
                                        <span className={`text-sm font-bold ${manageRow.overdueAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{formatMoney(manageAmount)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => chargeWithStripe(manageRow)}
                                            disabled={stripeLoading || methods?.stripe.enabled === false}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
                                            style={{ backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" }}
                                        >
                                            <CreditCardIcon className="h-4 w-4" /> {stripeLoading ? "Generando..." : "Con tarjeta"}
                                        </button>
                                        <button
                                            onClick={() => setShowTransfer((v) => !v)}
                                            disabled={methods?.transfer.enabled === false}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/[.04] active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <BanknoteIcon className="h-4 w-4" /> Transferencia
                                        </button>
                                    </div>

                                    {showTransfer && methods?.transfer && (
                                        <div className="mt-2 space-y-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                                            {methods.transfer.accounts.map((acc, i) => (
                                                <div key={i} className="rounded-lg bg-foreground/[.03] p-2">
                                                    <div className="flex items-center justify-between">
                                                        <b className="text-foreground">{acc.bank}</b>
                                                        <span className="text-[11px] uppercase text-muted-foreground">{acc.numberType}</span>
                                                    </div>
                                                    <p className="text-muted-foreground">{acc.beneficiary}</p>
                                                    <p className="flex items-center gap-1.5">
                                                        <b className="tracking-wide text-foreground">{acc.number}</b>
                                                        <button onClick={() => { navigator.clipboard.writeText(acc.number.replace(/\s/g, "")); toast.success(`${acc.bank} copiado`) }} className="text-muted-foreground hover:text-[#5B47E0]"><CopyIcon className="h-3.5 w-3.5" /></button>
                                                    </p>
                                                </div>
                                            ))}
                                            <p className="pt-1 text-muted-foreground">{methods.transfer.instructions}</p>
                                            <button onClick={() => registerTransfer(manageRow)} disabled={marking} className="mt-1 w-full rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 disabled:opacity-50">
                                                <CheckIcon className="mr-1 inline h-4 w-4" /> Marcar pagado por transferencia
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Receipts uploaded by the client, waiting for a decision */}
                            {manageRow.reviewPeriods.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Comprobantes por validar:</p>
                                    {manageRow.reviewPeriods.map((p) => {
                                        const pay = manageRow.client.payments[p]
                                        return (
                                            <div key={p} className="rounded-xl border border-[#5B47E0]/20 bg-[#5B47E0]/[.06] px-3 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-foreground">{periodLabel(p)}</span>
                                                    <span className="text-sm font-semibold text-foreground">{formatMoney(periodRemaining(pay, manageRow.client.fixedPayment ?? 0))}</span>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    {pay?.receiptUrl && (
                                                        <a href={pay.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[#5B47E0] dark:text-[#A99BFF] hover:underline">
                                                            <FileTextIcon className="h-3.5 w-3.5" /> Ver comprobante
                                                        </a>
                                                    )}
                                                    {pay?.referenceNumber && <span>Ref. {pay.referenceNumber}</span>}
                                                    {pay?.receiptUploadedAt && <span>Subido {formatDate(new Date(pay.receiptUploadedAt), { date: "medium" })}</span>}
                                                </div>
                                                <div className="mt-2 flex items-center justify-end gap-2">
                                                    <button onClick={() => resolveReceipt(manageRow, p, "reject")} disabled={reviewing} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 disabled:opacity-50">
                                                        <XIcon className="h-3.5 w-3.5" /> Rechazar
                                                    </button>
                                                    <button onClick={() => resolveReceipt(manageRow, p, "approve")} disabled={reviewing} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 disabled:opacity-50">
                                                        <CheckIcon className="h-3.5 w-3.5" /> Validar
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Por mes: registrar abono (pago parcial) o marcar pagado */}
                            {manageCollectable.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Registra un abono (pago parcial) o marca el mes como pagado:</p>
                                    {manageCollectable.map((p) => {
                                        const pay = manageRow.client.payments[p]
                                        const remaining = periodRemaining(pay, manageRow.client.fixedPayment ?? 0)
                                        const paidSoFar = periodPaid(pay)
                                        const upcoming = pay?.status === "pending"
                                        return (
                                            <div key={p} className="rounded-xl border border-border px-3 py-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                                                        {periodLabel(p)}
                                                        {upcoming && <MonthChip tone="amber">por vencer</MonthChip>}
                                                    </span>
                                                    <div className="text-right">
                                                        <span className={`text-sm font-semibold ${upcoming ? "text-foreground" : "text-rose-600 dark:text-rose-400"}`}>{formatMoney(remaining)}</span>
                                                        <span className="text-xs text-muted-foreground"> restante</span>
                                                        {paidSoFar > 0 && <div className="text-[11px] text-sky-600 dark:text-sky-400">Abonado {formatMoney(paidSoFar)}</div>}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex flex-1 items-center gap-1 rounded-lg border border-border px-2 py-1 focus-within:border-[#5B47E0]">
                                                        <span className="text-sm text-muted-foreground">$</span>
                                                        <input
                                                            type="number" min={0} placeholder="Abono"
                                                            value={abono[p] ?? ""}
                                                            onChange={(e) => setAbono((prev) => ({ ...prev, [p]: e.target.value }))}
                                                            className="w-full min-w-0 bg-transparent text-right text-sm text-foreground outline-none"
                                                        />
                                                    </div>
                                                    <button onClick={() => registerAbono(manageRow.client.id, p)} disabled={marking || !Number(abono[p])} className="rounded-lg bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-100 disabled:opacity-50">
                                                        Abonar
                                                    </button>
                                                    <button onClick={() => markMonthPaid(manageRow.client.id, p)} disabled={marking} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 disabled:opacity-50">
                                                        <CheckIcon className="h-3.5 w-3.5" /> Pagado
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Up to date: the next open month can be paid ahead (manual clients only) */}
                            {manageIsUpToDate && (
                                <div className="rounded-xl bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                                    <p className="font-medium">Este cliente está al día.</p>
                                    {manageRow.client.nextChargeDate && (
                                        <p className="mt-0.5 text-xs text-emerald-600/80">
                                            Próximo cobro {formatDueDate(manageRow.client.nextChargeDate)}
                                            {manageRow.client.nextChargeAmount != null && ` · ${formatMoney(manageRow.client.nextChargeAmount)}`}
                                            {manageRow.client.billingType === "stripe" && " · se cobra automáticamente a su tarjeta"}
                                        </p>
                                    )}
                                    {manageRow.client.billingType === "manual" && advancePeriod && (
                                        <button onClick={() => registerAdvance(manageRow, advancePeriod)} disabled={marking} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 shadow-sm hover:bg-emerald-100 disabled:opacity-50">
                                            <CheckIcon className="h-3.5 w-3.5" /> Registrar adelanto de {periodLabel(advancePeriod)}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="rounded-xl bg-emerald-500/10 px-3 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">✓ Cliente al corriente.</p>
                    )}
                    <DialogFooter className="gap-2">
                        {manageRow && (
                            <>
                                <BtnGhost onClick={() => { onOpenDetail(manageRow.client.id); closeManage() }}>Ver historial</BtnGhost>
                                {manageCollectable.length > 0 && (
                                    <BtnPrimary onClick={() => markAllPaid(manageRow)}><CheckIcon className="h-4 w-4" /> Marcar todo pagado</BtnPrimary>
                                )}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CollectionsTab
