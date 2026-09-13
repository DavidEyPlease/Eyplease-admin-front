import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import useFetchQuery from "@/hooks/useFetchQuery"
import Spinner from "@/components/common/Spinner"
import { AdminOverview } from "@/interfaces/overview"

import MoneyBlock from "./MoneyBlock"
import DebtorsList from "./DebtorsList"
import StuckBlock from "./StuckBlock"
import AdminDashboard from "./AdminDashboard"

/**
 * Inicio del panel.
 *
 * Primero el dinero del mes, luego quién debe y qué está frenado. La actividad
 * de siempre (logins, reportes, solicitudes) sigue disponible abajo, plegada:
 * es contexto, no es lo que hay que decidir al abrir el panel.
 */
const Overview = () => {
    const [showActivity, setShowActivity] = useState(false)

    const { response, loading } = useFetchQuery<AdminOverview>("/overview", {
        customQueryKey: ["admin", "overview"],
        staleTime: 60_000,
    })

    if (loading && !response) {
        return (
            <div className="flex justify-center py-16">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="grid min-w-0 gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span
                        className="h-7 w-1.5 rounded-full"
                        style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }}
                    />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Inicio</h1>
                </div>

                {response && (
                    <p className="text-xs text-slate-500">
                        <strong className="text-slate-900">{response.clients.active}</strong> clientas activas
                        {response.clients.inactive > 0 && <> · {response.clients.inactive} inactivas</>}
                        {response.clients.new_this_month > 0 && (
                            <> · {response.clients.new_this_month} nuevas este mes</>
                        )}
                    </p>
                )}
            </div>

            {response && (
                <>
                    <MoneyBlock current={response.revenue.current} previous={response.revenue.previous} />

                    <div className="grid gap-4 lg:grid-cols-2">
                        <DebtorsList debtors={response.debtors} total={response.debtors_total} />
                        <StuckBlock stuck={response.stuck} />
                    </div>
                </>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => setShowActivity((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800"
                >
                    <ChevronDownIcon className={"size-4 transition " + (showActivity ? "rotate-180" : "")} />
                    {showActivity ? "Ocultar actividad" : "Ver actividad (accesos, reportes, solicitudes)"}
                </button>

                {showActivity && (
                    <div className="mt-4">
                        <AdminDashboard />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Overview
