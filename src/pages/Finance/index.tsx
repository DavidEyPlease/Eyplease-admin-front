import { useState } from "react"

import Dropdown from "@/components/common/Inputs/Dropdown"
import { MONTH_LABELS } from "@/utils/finance"
import SummaryTab from "./components/SummaryTab"
import MonthTab from "./components/MonthTab"
import CollectionsTab from "./components/CollectionsTab"
import ExpensesTab from "./components/ExpensesTab"
import BalanceTab from "./components/BalanceTab"
import ProjectionTab from "./components/ProjectionTab"
import PaymentsTab from "./components/PaymentsTab"
import PromotionsTab from "./Promotions/PromotionsTab"
import PaymentMethodsTab from "./PaymentMethods/PaymentMethodsTab"
import ClientDrawer from "./components/ClientDrawer"
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"

/* Con el marco nuevo Finanzas abre en «La caja del mes» (lo que hay que hacer) y sus nueve
   pantallas se agrupan en CUATRO pestañas; dentro de cada una, un conmutador chico. No se quitó
   ninguna pantalla: sólo se juntaron por para qué sirven. El marco de siempre sigue con las suyas. */
const NEW_SHELL = isNewShell()

const TABS = [
    { key: "mes", label: "La caja del mes" },
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

/** Las pestañas del marco de siempre (sin «La caja del mes», que es del rediseño) */
const CLASSIC_TABS = TABS.filter((t) => t.key !== "mes")

/** Las cuatro del rediseño. Cada una abre en su primera pantalla. */
const GROUPS: Array<{ label: string; tabs: Array<{ key: TabKey; label: string }> }> = [
    { label: "La caja del mes", tabs: [{ key: "mes", label: "La caja del mes" }] },
    { label: "Cobranza", tabs: [{ key: "cobranza", label: "Por cobrar" }, { key: "pagos", label: "Pagos registrados" }] },
    { label: "El año", tabs: [{ key: "balance", label: "Balance" }, { key: "gastos", label: "Gastos" }, { key: "proyeccion", label: "Proyección" }] },
    { label: "Configurar", tabs: [{ key: "promociones", label: "Promociones" }, { key: "metodos-pago", label: "Métodos de pago" }] },
]

const YEARS = [2026, 2027]
const MONTH_OPTIONS = MONTH_LABELS.map((label, idx) => ({ label, value: String(idx + 1) }))
const YEAR_OPTIONS = YEARS.map((y) => ({ label: String(y), value: String(y) }))

const FinancePage = () => {
    const [tab, setTab] = useState<TabKey>(NEW_SHELL ? "mes" : "resumen")
    const [detailId, setDetailId] = useState<string | null>(null)
    const [period, setPeriod] = useState({ year: 2026, month: new Date().getMonth() + 1 })

    const showPeriod = tab === "mes" || tab === "resumen" || tab === "gastos" || tab === "balance"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                {isNewShell() ? (
                    <PageHead eyebrow="Finanzas" title={<>Cobranza · <em>el dinero del mes</em></>} sub="Lo cobrado, lo que falta y quién debe. Cobranza junta lo por cobrar y los pagos; El año, el balance, los gastos y la proyección." />
                ) : (
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }} />
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Finanzas y Cobranza</h1>
                    </div>
                )}
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

            {(() => {
                const pill = (active: boolean) => `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5 ${active ? "text-white shadow-[0_8px_18px_-8px_rgba(91,71,224,0.7)]" : "text-muted-foreground hover:text-foreground"}`
                const gradient = { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" }

                if (!NEW_SHELL) {
                    return (
                        <div className="-mx-1 overflow-x-auto px-1">
                            <div className="inline-flex w-max gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur">
                                {CLASSIC_TABS.map((t) => (
                                    <button key={t.key} onClick={() => setTab(t.key)} className={pill(tab === t.key)} style={tab === t.key ? gradient : undefined}>{t.label}</button>
                                ))}
                            </div>
                        </div>
                    )
                }

                const group = GROUPS.find((g) => g.tabs.some((t) => t.key === tab)) ?? GROUPS[0]
                return (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                        <div className="inline-flex w-max gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur">
                            {GROUPS.map((g) => (
                                <button key={g.label} onClick={() => setTab(g.tabs[0].key)} className={pill(g === group)} style={g === group ? gradient : undefined}>{g.label}</button>
                            ))}
                        </div>
                        {group.tabs.length > 1 && (
                            <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                                {group.tabs.map((t) => (
                                    <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`h-8 cursor-pointer rounded-[9px] px-3.5 text-[12.5px] font-bold transition-colors ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })()}

            {tab === "mes" && <MonthTab period={period} onOpenClient={setDetailId} onGoTo={setTab} />}
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
