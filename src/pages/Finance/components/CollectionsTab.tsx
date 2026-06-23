import { useEffect, useMemo, useState } from "react"
import { BanknoteIcon, CheckIcon, ChevronRightIcon, CopyIcon, CreditCardIcon, ExternalLinkIcon, SearchIcon } from "lucide-react"
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
import UIPagination from "@/components/generics/Pagination"
import { FinanceClient, FinanceClientPromotion } from "@/interfaces/finance"
import { formatMoney, periodLabel, periodsForYear } from "@/utils/finance"
import FinanceService, { PaymentMethodsConfig } from "@/services/finance.service"
import { useFinanceClientsPage, useMarkPayment } from "../useFinanceClients"
import { BtnGhost, BtnPrimary, MonthChip, Panel } from "./ui"

const WHATSAPP_ADMIN = "https://whatsapp.eyplease.com.mx/admin"

const BILLING_ALL = "all"
const BILLING_OPTIONS = [
    { label: "Todos", value: BILLING_ALL },
    { label: "Stripe", value: "stripe" },
    { label: "Manual", value: "manual" },
]

const WhatsappIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.516 5.26l-.999 3.648 3.972-.717zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg>
)

interface OverdueInfo {
    client: FinanceClient
    overduePeriods: string[]
    overdueAmount: number
}

const promoDiscountLabel = (promotion: FinanceClientPromotion) =>
    promotion.discount_type === "percent" ? `${promotion.discount}%` : formatMoney(promotion.discount)

/** Stripe vs. manual billing chip. */
const BillingTypeChip = ({ type }: { type: "stripe" | "manual" }) =>
    type === "stripe" ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#635BFF]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#635BFF]">
            <CreditCardIcon className="h-3 w-3" /> Stripe
        </span>
    ) : (
        <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">Manual</span>
    )

/** Active per-client promotion badge (with a "Vencida" tag once the deadline passed). */
const PromoBadge = ({ promotion }: { promotion: FinanceClientPromotion | null }) => {
    if (!promotion) return <span className="text-xs text-slate-300">—</span>
    const expired = dayjs(promotion.expires_at).isBefore(dayjs(), "day")
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="truncate text-xs font-medium text-slate-700">{promotion.name ?? "Promoción"}</span>
            <span className="shrink-0 rounded-md bg-[#5B47E0]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#5B47E0]">{promoDiscountLabel(promotion)}</span>
            {expired && <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-600">Vencida</span>}
        </span>
    )
}

const CollectionsTab = ({ year, onOpenDetail }: { year: number; onOpenDetail: (id: string) => void }) => {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [billing, setBilling] = useState<string>(BILLING_ALL)

    const { clients, totalPages, totalItems, perPage, totalOverdue, loading } = useFinanceClientsPage({
        year,
        page,
        search,
        billingType: billing === BILLING_ALL ? undefined : (billing as "stripe" | "manual"),
    })
    const { markPayment, marking } = useMarkPayment()
    const periods = useMemo(() => periodsForYear(year), [year])

    const [manageId, setManageId] = useState<string | null>(null)
    const [methods, setMethods] = useState<PaymentMethodsConfig | null>(null)
    const [stripeLoading, setStripeLoading] = useState(false)
    const [showTransfer, setShowTransfer] = useState(false)

    useEffect(() => {
        FinanceService.getPaymentMethods().then(setMethods).catch(() => { })
    }, [])

    // Debounced server-side search; reset to page 1 on a new query.
    useEffect(() => {
        const id = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
        return () => clearTimeout(id)
    }, [searchInput])

    // Reset to the first page when the year changes.
    useEffect(() => { setPage(1) }, [year])

    const closeManage = () => { setManageId(null); setShowTransfer(false) }

    const rows: OverdueInfo[] = useMemo(() => clients.map((client) => {
        const overduePeriods = periods.filter((p) => client.payments[p]?.status === "overdue")
        const overdueAmount =
            overduePeriods.reduce((acc, p) => acc + (client.payments[p]?.amount ?? client.fixedPayment ?? 0), 0)
            || (client.balance > 0 ? client.balance : 0)
        return { client, overduePeriods, overdueAmount }
    }), [clients, periods])

    const manageRow = rows.find((r) => r.client.id === manageId)

    type Row = OverdueInfo
    const latestPeriod = (row: Row) => row.overduePeriods[row.overduePeriods.length - 1] ?? periods[periods.length - 1]

    const markPeriodPaid = async (account: string, period: string, method?: "transfer") => {
        await markPayment({ account, period, status: "paid", source: "manual", method })
    }

    const markMonthPaid = async (account: string, period: string) => {
        await markPeriodPaid(account, period)
        toast.success(`${periodLabel(period)} marcado como pagado`)
    }

    const markAllPaid = async (row: Row) => {
        await Promise.all(row.overduePeriods.map((period) => markPeriodPaid(row.client.id, period)))
        toast.success(`${row.client.name} al corriente`)
        closeManage()
    }

    const chargeWithStripe = async (row: Row) => {
        setStripeLoading(true)
        try {
            const res = await FinanceService.createStripeCheckout(
                row.client.id, latestPeriod(row), row.overdueAmount,
                `Adeudo Eyplease+ · ${row.overduePeriods.length} mes(es)`
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

    const registerTransfer = async (row: Row) => {
        const targets = row.overduePeriods.length ? row.overduePeriods : [latestPeriod(row)]
        await Promise.all(targets.map((period) => markPeriodPaid(row.client.id, period, "transfer")))
        toast.success(`Transferencia registrada · ${row.client.name}`)
        closeManage()
    }

    const overdueChips = (row: Row) => {
        if (row.overduePeriods.length) {
            return row.overduePeriods.map((p) => <MonthChip key={p}>{periodLabel(p).slice(0, 3)}</MonthChip>)
        }
        if (row.client.balance > 0) return <MonthChip tone="amber">Saldo</MonthChip>
        return <span className="text-xs text-emerald-600">Al día</span>
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5">
            <a href={WHATSAPP_ADMIN} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-[#5DD9D2]/40 bg-gradient-to-r from-[#EEF9F8] to-white px-4 py-3 transition hover:shadow-sm sm:px-5 sm:py-3.5">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#1DA851]"><WhatsappIcon className="h-4.5 w-4.5" /></span>
                    <div>
                        <p className="text-sm font-medium text-slate-800">Conectado al bot de WhatsApp</p>
                        <p className="text-xs text-slate-400">Reporta pagos y activación de nuevos usuarios.</p>
                    </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-[#5B47E0] sm:flex">Abrir <ExternalLinkIcon className="h-4 w-4" /></span>
            </a>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-sm">
                    <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Buscar por nombre o cuenta..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15" />
                </div>
                <div className="w-full sm:w-48">
                    <Dropdown placeholder="Tipo de cliente" value={billing} items={BILLING_OPTIONS} onChange={(v) => { setBilling(v); setPage(1) }} />
                </div>
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
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-slate-400">
                                        <th className="px-5 py-3 font-semibold">Nombre</th>
                                        <th className="px-5 py-3 font-semibold">Cuenta</th>
                                        <th className="px-5 py-3 font-semibold">Plan</th>
                                        <th className="px-5 py-3 font-semibold">Promoción</th>
                                        <th className="px-5 py-3 font-semibold">Meses de retraso</th>
                                        <th className="px-5 py-3 text-right font-semibold">Total retrasado</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length ? rows.map((row) => (
                                        <tr key={row.client.id} onClick={() => setManageId(row.client.id)} className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5 font-medium text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <span>{row.client.name}</span>
                                                    <BillingTypeChip type={row.client.billingType} />
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">{row.client.id}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{row.client.plan ?? "—"}</td>
                                            <td className="px-5 py-3.5"><PromoBadge promotion={row.client.promotion} /></td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1">{overdueChips(row)}</div>
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-semibold ${row.overdueAmount > 0 ? "text-rose-600" : "text-slate-300"}`}>{row.overdueAmount > 0 ? formatMoney(row.overdueAmount) : "—"}</td>
                                            <td className="px-5 py-3.5 text-right"><span className="text-xs font-medium text-[#5B47E0]">Gestionar</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="py-16 text-center text-slate-400">Sin clientes en retraso. 🎉</td></tr>
                                    )}
                                </tbody>
                                {rows.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t border-slate-100 bg-slate-50/50 text-sm">
                                            <td className="px-5 py-3 font-medium text-slate-500" colSpan={5}>{totalItems} clientes en retraso · total retrasado</td>
                                            <td className="px-5 py-3 text-right font-bold text-slate-800">{formatMoney(totalOverdue)}</td>
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
                                            <p className="truncate font-medium text-slate-800">{row.client.name}</p>
                                            <BillingTypeChip type={row.client.billingType} />
                                        </div>
                                        <p className="text-xs text-slate-400">{row.client.id} · {row.client.plan ?? "—"}</p>
                                        {row.client.promotion && <div className="mt-1"><PromoBadge promotion={row.client.promotion} /></div>}
                                        <div className="mt-1.5 flex flex-wrap gap-1">{overdueChips(row)}</div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className={`font-semibold ${row.overdueAmount > 0 ? "text-rose-600" : "text-slate-300"}`}>{row.overdueAmount > 0 ? formatMoney(row.overdueAmount) : "—"}</p>
                                        <ChevronRightIcon className="ml-auto mt-1 h-4 w-4 text-slate-300" />
                                    </div>
                                </Panel>
                            </button>
                        )) : (
                            <Panel className="p-10 text-center text-slate-400">Sin clientes en retraso. 🎉</Panel>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <UIPagination page={page} totalPages={totalPages} perPage={perPage} showPerPage={false} onChangePage={setPage} />
                    )}
                </>
            )}

            {/* Payment management modal */}
            <Dialog open={!!manageId} onOpenChange={(o) => !o && closeManage()}>
                <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-slate-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Gestionar pago</DialogTitle>
                        <DialogDescription className="text-slate-400">{manageRow?.client.name ?? ""} · {manageRow?.client.id ?? ""}</DialogDescription>
                    </DialogHeader>
                    {manageRow ? (
                        <div className="space-y-4">
                            {/* Charge debt: card or transfer */}
                            <div className="rounded-xl bg-slate-50/70 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Cobrar adeudo</span>
                                    <span className="text-sm font-bold text-rose-600">{formatMoney(manageRow.overdueAmount)}</span>
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
                                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <BanknoteIcon className="h-4 w-4" /> Transferencia
                                    </button>
                                </div>

                                {showTransfer && methods?.transfer && (
                                    <div className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                                        <p><span className="text-slate-400">Banco:</span> <b>{methods.transfer.bank}</b></p>
                                        <p><span className="text-slate-400">Beneficiario:</span> <b>{methods.transfer.beneficiary}</b></p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="text-slate-400">CLABE:</span> <b>{methods.transfer.clabe}</b>
                                            <button onClick={() => { navigator.clipboard.writeText(methods.transfer.clabe.replace(/\s/g, "")); toast.success("CLABE copiada") }} className="text-slate-400 hover:text-[#5B47E0]"><CopyIcon className="h-3.5 w-3.5" /></button>
                                        </p>
                                        <p className="pt-1 text-slate-400">{methods.transfer.instructions}</p>
                                        <button onClick={() => registerTransfer(manageRow)} disabled={marking} className="mt-2 w-full rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                                            <CheckIcon className="mr-1 inline h-4 w-4" /> Marcar pagado por transferencia
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mark by month (manual) */}
                            <div className="space-y-2">
                                <p className="text-xs text-slate-400">Marca meses pagados manualmente:</p>
                                {manageRow.overduePeriods.length ? manageRow.overduePeriods.map((p) => (
                                    <div key={p} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                                        <span className="text-sm font-medium text-slate-700">{periodLabel(p)}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-500">{formatMoney(manageRow.client.payments[p]?.amount ?? manageRow.client.fixedPayment ?? 0)}</span>
                                            <button onClick={() => markMonthPaid(manageRow.client.id, p)} disabled={marking} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-50">
                                                <CheckIcon className="h-3.5 w-3.5" /> Pagado
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">Este cliente está al día.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="rounded-xl bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700">✓ Cliente al corriente.</p>
                    )}
                    <DialogFooter className="gap-2">
                        {manageRow && (
                            <>
                                <BtnGhost onClick={() => { onOpenDetail(manageRow.client.id); closeManage() }}>Ver historial</BtnGhost>
                                {manageRow.overduePeriods.length > 0 && (
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
