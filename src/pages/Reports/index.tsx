import { useState } from "react"

import Dropdown from "@/components/common/Inputs/Dropdown"
import SummaryTab from "./components/SummaryTab"
import MatrixTab from "./components/MatrixTab"
import RejectionsTab from "./components/RejectionsTab"
import RunTab from "./components/RunTab"
import TodayTab from "./components/TodayTab"
import RobotCountryNotice from "./components/RobotCountryNotice"
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import "@/pages/Hoy/hoy.css"
import { buildPeriodOptions, COUNTRY_OPTIONS, DEFAULT_COUNTRY, defaultPeriod, type ReportsCountry } from "./reports.constants"

/* Con el marco nuevo el monitor abre en HOY (el robot y sus corridas); lo del mes sigue en sus pestañas */
const NEW_SHELL = isNewShell()

const TABS = [
    ...(NEW_SHELL ? [{ key: "today", label: "Hoy" }] as const : []),
    { key: "summary", label: NEW_SHELL ? "Resumen del mes" : "Resumen" },
    { key: "status-by-client", label: "Estado por cliente" },
    { key: "rejections", label: "Rechazos" },
    { key: "dispatch-imports", label: "Correr programas" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const PERIOD_OPTIONS = buildPeriodOptions()

const ReportsPage = () => {
    const [tab, setTab] = useState<TabKey>(NEW_SHELL ? "today" : "summary")
    const [period, setPeriod] = useState<string>(defaultPeriod())
    /* Cada país se mide aparte: sus cuentas, sus reportes y sus rechazos no se mezclan */
    const [country, setCountry] = useState<ReportsCountry>(DEFAULT_COUNTRY)

    const showPeriod = tab !== "dispatch-imports" && tab !== "today"

    return (
        <div className="grid min-w-0 grid-cols-1 gap-y-5 sm:gap-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                {NEW_SHELL ? (
                    <PageHead eyebrow="Operación" title={<>Reportes · <em>el robot y sus corridas</em></>} sub="Qué bajó, a qué hora y qué hubo que reintentar. Lo del mes (resumen, estado por clienta y rechazos) está en las pestañas." />
                ) : (
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }} />
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Reportes Mary Kay</h1>
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full border border-border bg-card/70 p-1 backdrop-blur" role="group" aria-label="País">
                        {COUNTRY_OPTIONS.map((option) => {
                            const active = country === option.value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setCountry(option.value)}
                                    className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>
                    {showPeriod && (
                        <div className="w-44">
                            <Dropdown placeholder="Periodo" value={period} items={PERIOD_OPTIONS} onChange={(v) => setPeriod(v)} />
                        </div>
                    )}
                </div>
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
                <div className="inline-flex w-max gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur">
                    {TABS.map((t) => {
                        const active = tab === t.key
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition sm:px-5 ${active ? "text-white shadow-[0_8px_18px_-8px_rgba(91,71,224,0.7)]" : "text-muted-foreground hover:text-foreground"}`}
                                style={active ? { backgroundImage: "linear-gradient(135deg,#5B47E0,#6B5BE8)" } : undefined}
                            >
                                {t.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {tab === "today" && <TodayTab country={country} onOpenOptions={() => setTab("dispatch-imports")} />}
            {tab === "summary" && <SummaryTab period={period} country={country} />}
            {tab === "status-by-client" && <MatrixTab period={period} country={country} />}
            {tab === "rejections" && <RejectionsTab period={period} country={country} />}
            {tab === "dispatch-imports" && (country === DEFAULT_COUNTRY ? <RunTab /> : <RobotCountryNotice country={country} />)}
        </div>
    )
}

export default ReportsPage
