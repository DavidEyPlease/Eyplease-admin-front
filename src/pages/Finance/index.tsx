import { useState } from "react"

import Dropdown from "@/components/common/Inputs/Dropdown"
import { MONTH_LABELS } from "@/utils/finance"
import SummaryTab from "./components/SummaryTab"
import CollectionsTab from "./components/CollectionsTab"
import ExpensesTab from "./components/ExpensesTab"
import BalanceTab from "./components/BalanceTab"
import ProjectionTab from "./components/ProjectionTab"
import PaymentsTab from "./components/PaymentsTab"
import PromotionsTab from "./Promotions/PromotionsTab"
import PaymentMethodsTab from "./PaymentMethods/PaymentMethodsTab"
import ClientDrawer from "./components/ClientDrawer"

const TABS = [
    { key: "resumen", label: "Resumen" },
    { key: "cobranza", label: "Cobranza" },
    { key: "pagos", label: "Pagos" },
    { key: "gastos", label: "Gastos" },
    { key: "balance", label: "Balance" },
    { key: "proyeccion", label: "Proyección" },
    { key: "promociones", label: "Promociones" },
    { key: "metodos-pago", label: "Métodos de pago" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const YEARS = [2026, 2027]
const MONTH_OPTIONS = MONTH_LABELS.map((label, idx) => ({ label, value: String(idx + 1) }))
const YEAR_OPTIONS = YEARS.map((y) => ({ label: String(y), value: String(y) }))

const FinancePage = () => {
    const [tab, setTab] = useState<TabKey>("resumen")
    const [detailId, setDetailId] = useState<string | null>(null)
    const [period, setPeriod] = useState({ year: 2026, month: new Date().getMonth() + 1 })

    const showPeriod = tab === "resumen" || tab === "gastos" || tab === "balance"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }} />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Finanzas y Cobranza</h1>
                </div>
                {showPeriod && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-36">
                            <Dropdown placeholder="Mes" value={String(period.month)} items={MONTH_OPTIONS} onChange={(v) => setPeriod((p) => ({ ...p, month: Number(v) }))} />
                        </div>
                        <div className="w-28">
                            <Dropdown placeholder="Año" value={String(period.year)} items={YEAR_OPTIONS} onChange={(v) => setPeriod((p) => ({ ...p, year: Number(v) }))} />
                        </div>
                    </div>
                )}
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
                <div className="inline-flex w-max gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 backdrop-blur">
                    {TABS.map((t) => {
                        const active = tab === t.key
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5 ${active ? "text-white shadow-[0_8px_18px_-8px_rgba(91,71,224,0.7)]" : "text-slate-500 hover:text-slate-800"
                                    }`}
                                style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {t.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {tab === "resumen" && <SummaryTab period={period} />}
            {tab === "cobranza" && <CollectionsTab year={period.year} onOpenDetail={setDetailId} />}
            {tab === "pagos" && <PaymentsTab year={period.year} />}
            {tab === "gastos" && <ExpensesTab period={period} />}
            {tab === "balance" && <BalanceTab period={period} />}
            {tab === "proyeccion" && <ProjectionTab period={period} />}
            {tab === "promociones" && <PromotionsTab />}
            {tab === "metodos-pago" && <PaymentMethodsTab />}

            <ClientDrawer clientId={detailId} year={period.year} onClose={() => setDetailId(null)} />
        </div>
    )
}

export default FinancePage
