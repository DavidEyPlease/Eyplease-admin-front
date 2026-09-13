import { Link } from "react-router"
import { ArrowRightIcon, CircleCheckIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { OverviewPublishing } from "@/interfaces/overview"
import { monthName } from "../overview.utils"

/**
 * Secciones del boletín del mes y cuáles siguen sin piezas.
 *
 * El mes que aparece es el de los DATOS, no el del calendario: una sección de
 * septiembre se arma con los números de agosto, y decir "agosto" evita que
 * parezca un retraso cuando no lo es.
 */
const MonthlyCoverage = ({ monthly }: { monthly: OverviewPublishing["monthly"] }) => {
    const pct = monthly.total ? Math.round((monthly.covered / monthly.total) * 100) : 100
    const complete = !monthly.missing.length

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Secciones del mes</h3>
                <span className="text-xs tabular-nums text-slate-500">
                    <strong className="text-slate-900">{monthly.covered}</strong> de {monthly.total} con piezas
                </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundImage: complete
                            ? "linear-gradient(90deg,#10b981,#5DD9D2)"
                            : "linear-gradient(90deg,#5B47E0,#5DD9D2)",
                    }}
                />
            </div>

            {complete ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
                    <CircleCheckIcon className="size-4" />
                    Todas las secciones tienen piezas.
                </p>
            ) : (
                <>
                    <p className="mt-3 text-xs font-medium text-slate-500">Sin piezas todavía</p>
                    <ul className="mt-1.5 grid gap-1">
                        {monthly.missing.map((section) => (
                            <li
                                key={section.key}
                                className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/60 px-2.5 py-1.5"
                            >
                                <span className="truncate text-sm text-slate-900">{section.name}</span>
                                <span className="shrink-0 text-[11px] text-amber-700">
                                    datos de {monthName(section.data_period)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <Link
                to={APP_ROUTES.POSTS.DASHBOARD}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 transition hover:gap-2 hover:underline"
            >
                Ir a Publicaciones
                <ArrowRightIcon className="size-3.5" />
            </Link>
        </div>
    )
}

export default MonthlyCoverage
