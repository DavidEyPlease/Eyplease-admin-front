import { useState } from "react"

import Dropdown from "@/components/common/Inputs/Dropdown"
import SummaryTab from "./components/SummaryTab"
import MatrixTab from "./components/MatrixTab"
import RejectionsTab from "./components/RejectionsTab"
import RunTab from "./components/RunTab"
import { buildPeriodOptions, defaultPeriod } from "./reports.constants"

const TABS = [
    { key: "resumen", label: "Resumen" },
    { key: "estado", label: "Estado por cliente" },
    { key: "rechazos", label: "Rechazos" },
    { key: "correr", label: "Correr programas" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const PERIOD_OPTIONS = buildPeriodOptions()

const ReportsPage = () => {
    const [tab, setTab] = useState<TabKey>("resumen")
    const [period, setPeriod] = useState<string>(defaultPeriod())

    const showPeriod = tab !== "correr"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }} />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Reportes Mary Kay</h1>
                </div>
                {showPeriod && (
                    <div className="w-44">
                        <Dropdown placeholder="Periodo" value={period} items={PERIOD_OPTIONS} onChange={(v) => setPeriod(v)} />
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
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5 ${active ? "text-white shadow-[0_8px_18px_-8px_rgba(91,71,224,0.7)]" : "text-slate-500 hover:text-slate-800"}`}
                                style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {t.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {tab === "resumen" && <SummaryTab period={period} />}
            {tab === "estado" && <MatrixTab period={period} />}
            {tab === "rechazos" && <RejectionsTab period={period} />}
            {tab === "correr" && <RunTab />}
        </div>
    )
}

export default ReportsPage
