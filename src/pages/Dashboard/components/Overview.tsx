import { InboxIcon, PencilRulerIcon, SparklesIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import useFetchQuery from "@/hooks/useFetchQuery"
import Spinner from "@/components/common/Spinner"
import { AdminOverview } from "@/interfaces/overview"

import MoneyBlock from "./MoneyBlock"
import DailyReportsCard from "./DailyReportsCard"
import DailyRail from "./DailyRail"
import MonthlyCoverage from "./MonthlyCoverage"
import TaskAlertCard from "./TaskAlertCard"
import LiveNewsPanel from "./LiveNewsPanel"
import { monthName } from "../overview.utils"

/** Aviso de cabecera: para enterarse sin bajar la vista. */
const HeaderPill = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span
        className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white " +
            className
        }
    >
        <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-card opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-card" />
        </span>
        {children}
    </span>
)

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
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Inicio</h1>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {response.service_requests.new > 0 && (
                        <HeaderPill className="bg-violet-600">
                            {response.service_requests.new}{" "}
                            {response.service_requests.new === 1
                                ? "solicitud nueva"
                                : "solicitudes nuevas"}
                        </HeaderPill>
                    )}
                    {response.corrections.count > 0 && (
                        <HeaderPill className="bg-amber-500">
                            {response.corrections.count}{" "}
                            {response.corrections.count === 1 ? "corrección" : "correcciones"}
                        </HeaderPill>
                    )}
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{response.clients.active}</strong> clientas activas
                        {response.clients.inactive > 0 && <> · {response.clients.inactive} inactivas</>}
                    </p>
                </div>
            </div>

            <MoneyBlock current={response.revenue.current} previous={response.revenue.previous} />

            {/* Los reportes ANTES de las publicaciones: son la materia prima. Si uno no
                bajó, las piezas de ese día salen con datos viejos o no salen, y verlo
                después obliga a deducir la causa desde el efecto. */}
            <DailyReportsCard />

            <section className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h2 className="text-sm font-semibold text-foreground">
                        Publicaciones · {monthName(response.period)}
                        <span className="ml-2 font-normal text-muted-foreground">
                            día {publishing.days_elapsed} de {publishing.days_in_month}
                        </span>
                    </h2>

                    {health === "alert" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-400/10 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-300">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            {missingToday}{" "}
                            {missingToday === 1 ? "sección no corrió hoy" : "secciones no corrieron hoy"}
                            {backlog > 0 && <> · {backlog} días sin cubrir</>}
                        </span>
                    )}
                    {health === "warn" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Hoy va bien · {backlog} {backlog === 1 ? "día" : "días"} sin cubrir este mes
                        </span>
                    )}
                    {health === "ok" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Todo al día
                        </span>
                    )}
                </div>

                <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                    <DailyRail
                        sections={publishing.daily}
                        daysInMonth={publishing.days_in_month}
                        daysElapsed={publishing.days_elapsed}
                    />
                    <div className="grid min-w-0 content-start gap-3">
                        <TaskAlertCard
                            count={response.service_requests.new}
                            items={response.service_requests.latest}
                            tone="violet"
                            icon={SparklesIcon}
                            idleIcon={InboxIcon}
                            title={(n) => `${n} ${n === 1 ? "solicitud nueva" : "solicitudes nuevas"}`}
                            idleTitle="Solicitudes de clientas"
                            subtitle={
                                response.service_requests.in_review > 0
                                    ? `Sin asignar · ${response.service_requests.in_review} en revisión`
                                    : "Sin asignar"
                            }
                            idleSubtitle={
                                response.service_requests.in_review > 0
                                    ? `Ninguna sin asignar · ${response.service_requests.in_review} en revisión`
                                    : "Ninguna sin asignar"
                            }
                            to={APP_ROUTES.TASKS.LIST}
                            linkLabel="Atender solicitudes"
                            idleLinkLabel="Ver solicitudes"
                        />

                        <TaskAlertCard
                            count={response.corrections.count}
                            items={response.corrections.latest}
                            tone="amber"
                            icon={PencilRulerIcon}
                            idleIcon={PencilRulerIcon}
                            title={(n) => `${n} ${n === 1 ? "corrección" : "correcciones"}`}
                            idleTitle="Correcciones"
                            subtitle="Devueltas para rehacer"
                            idleSubtitle="Nada devuelto a corrección"
                            to={APP_ROUTES.TASKS.LIST}
                            linkLabel="Ver correcciones"
                            idleLinkLabel="Ver tareas"
                        />

                        <MonthlyCoverage monthly={publishing.monthly} />
                    </div>
                </div>
            </section>

            <LiveNewsPanel />
        </div>
    )
}

export default Overview
