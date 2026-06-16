import { useState } from "react"
import { RotateCcwIcon } from "lucide-react"

import useFinanzasStore from "@/store/finanzas"
import { currentMonthKey, MONTH_LABELS } from "@/utils/finanzas"
import { BtnGhost } from "./components/ui"
import ResumenTab from "./components/ResumenTab"
import CobranzaTab from "./components/CobranzaTab"
import GastosTab from "./components/GastosTab"
import BalanceTab from "./components/BalanceTab"
import ProyeccionTab from "./components/ProyeccionTab"
import ClientDrawer from "./components/ClientDrawer"

const TABS = [
    { key: "resumen", label: "Resumen" },
    { key: "cobranza", label: "Cobranza" },
    { key: "gastos", label: "Gastos" },
    { key: "balance", label: "Balance" },
    { key: "proyeccion", label: "Proyección" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const MONTHS_ORDER = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]
const YEARS = [2026, 2027]

const FinanzasPage = () => {
    const { summary, lastEditedAt, resetToSeed } = useFinanzasStore()
    const [tab, setTab] = useState<TabKey>("resumen")
    const [detailId, setDetailId] = useState<string | null>(null)
    const [period, setPeriod] = useState({ year: 2026, month: currentMonthKey(summary) })

    const lastEdited = lastEditedAt
        ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastEditedAt))
        : null

    const showPeriod = tab === "resumen" || tab === "gastos" || tab === "balance"
    const selectCls = "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 outline-none focus:border-[#5B47E0]"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }} />
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Finanzas y Cobranza</h1>
                    </div>
                    {lastEdited && <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">Editado {lastEdited}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {showPeriod && (
                        <>
                            <select value={period.month} onChange={(e) => setPeriod((p) => ({ ...p, month: e.target.value }))} className={selectCls}>
                                {MONTHS_ORDER.map((m) => (
                                    <option key={m} value={m}>{MONTH_LABELS[m]}</option>
                                ))}
                            </select>
                            <select value={period.year} onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))} className={selectCls}>
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </>
                    )}
                    <BtnGhost
                        onClick={() => {
                            if (confirm("¿Restaurar los datos originales del Excel? Se perderán las ediciones locales.")) resetToSeed()
                        }}
                    >
                        <RotateCcwIcon className="h-4 w-4" /> <span className="hidden sm:inline">Restaurar Excel</span>
                    </BtnGhost>
                </div>
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

            {tab === "resumen" && <ResumenTab summary={summary} period={period} />}
            {tab === "cobranza" && <CobranzaTab onOpenDetail={setDetailId} />}
            {tab === "gastos" && <GastosTab period={period} />}
            {tab === "balance" && <BalanceTab summary={summary} period={period} />}
            {tab === "proyeccion" && <ProyeccionTab summary={summary} />}

            <ClientDrawer clientId={detailId} onClose={() => setDetailId(null)} />
        </div>
    )
}

export default FinanzasPage
