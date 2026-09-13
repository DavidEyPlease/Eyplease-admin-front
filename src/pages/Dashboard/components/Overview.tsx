import useFetchQuery from "@/hooks/useFetchQuery"
import Spinner from "@/components/common/Spinner"
import { AdminOverview } from "@/interfaces/overview"

import MoneyBlock from "./MoneyBlock"
import DailyRail from "./DailyRail"
import MonthlyCoverage from "./MonthlyCoverage"
import ServiceRequests from "./ServiceRequests"
import { monthName } from "../overview.utils"

/** Se refresca solo: es una torre de control, no un reporte que se abre y cierra. */
const REFRESH_MS = 2 * 60_000

/**
 * Inicio del panel — la torre de control.
 *
 * Dos preguntas, en este orden: cómo va el dinero del mes, y si lo que tiene
 * que salir publicado está saliendo.
 */
const Overview = () => {
    const { response, loading } = useFetchQuery<AdminOverview>("/overview", {
        customQueryKey: ["admin", "overview"],
        staleTime: 60_000,
        refetchInterval: REFRESH_MS,
    })

    if (loading && !response) {
        return (
            <div className="flex justify-center py-16">
                <Spinner />
            </div>
        )
    }

    if (!response) return null

    const { publishing } = response

    // El resumen no puede mirar solo hoy: una sección que corrió hoy pero lleva
    // 9 días sin cubrir NO es "todo al día", y pintarlo en verde tranquiliza
    // justo cuando hay que actuar.
    const missingToday = publishing.daily.filter((s) => s.today_status === "missing").length
    const backlog = publishing.daily.reduce((sum, s) => sum + s.days_missing, 0)

    const health =
        missingToday > 0 ? "alert" : backlog > 0 ? "warn" : "ok"

    return (
        <div className="grid min-w-0 gap-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-2.5">
                    <span
                        className="h-7 w-1.5 rounded-full"
                        style={{ backgroundImage: "linear-gradient(180deg,#5B47E0,#5DD9D2)" }}
                    />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Inicio</h1>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {response.service_requests.new > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-medium text-white">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                            </span>
                            {response.service_requests.new}{" "}
                            {response.service_requests.new === 1
                                ? "solicitud nueva"
                                : "solicitudes nuevas"}
                        </span>
                    )}
                    <p className="text-xs text-slate-500">
                        <strong className="text-slate-900">{response.clients.active}</strong> clientas activas
                        {response.clients.inactive > 0 && <> · {response.clients.inactive} inactivas</>}
                    </p>
                </div>
            </div>

            <MoneyBlock current={response.revenue.current} previous={response.revenue.previous} />

            <section className="grid gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h2 className="text-sm font-semibold text-slate-900">
                        Publicaciones · {monthName(response.period)}
                        <span className="ml-2 font-normal text-slate-400">
                            día {publishing.days_elapsed} de {publishing.days_in_month}
                        </span>
                    </h2>

                    {health === "alert" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            {missingToday}{" "}
                            {missingToday === 1 ? "sección no corrió hoy" : "secciones no corrieron hoy"}
                            {backlog > 0 && <> · {backlog} días sin cubrir</>}
                        </span>
                    )}
                    {health === "warn" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Hoy va bien · {backlog} {backlog === 1 ? "día" : "días"} sin cubrir este mes
                        </span>
                    )}
                    {health === "ok" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Todo al día
                        </span>
                    )}
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                    <DailyRail
                        sections={publishing.daily}
                        daysInMonth={publishing.days_in_month}
                        daysElapsed={publishing.days_elapsed}
                    />
                    <div className="grid content-start gap-3">
                        <ServiceRequests data={response.service_requests} />
                        <MonthlyCoverage monthly={publishing.monthly} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Overview
