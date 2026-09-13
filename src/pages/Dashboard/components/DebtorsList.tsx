import { Link } from "react-router"
import { ChevronRightIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { OverviewDebtor } from "@/interfaces/overview"
import { money, monthName } from "../overview.utils"

/**
 * Quién debe, de mayor a menor.
 *
 * Ordenado por monto, pero se marca a quien arrastra varios periodos: dos
 * clientas con la misma deuda no son el mismo problema si una lleva seis meses.
 */
interface Props {
    debtors: OverviewDebtor[]
    /** Deuda real del año: la lista muestra solo a los mayores. */
    total: { clients: number; amount: number }
}

const DebtorsList = ({ debtors, total }: Props) => {
    if (!debtors.length) {
        return (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">Quién debe</h2>
                <p className="mt-3 text-sm text-emerald-700">Nadie con pagos vencidos. Todo cobrado.</p>
            </div>
        )
    }

    // Se muestra la deuda COMPLETA, no la suma de los que caben en la lista:
    // sumar solo lo visible daba un tercio del total real.
    const hidden = total.clients - debtors.length

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="text-sm font-semibold text-slate-900">Quién debe</h2>
                <span className="text-xs text-slate-500">
                    <strong className="text-red-600">{money(total.amount)}</strong> en {total.clients}{" "}
                    {total.clients === 1 ? "clienta" : "clientas"}
                </span>
            </div>

            <ul className="mt-3 divide-y divide-slate-100">
                {debtors.map((d) => (
                    <li key={d.id}>
                        <Link
                            to={APP_ROUTES.CLIENTS.DETAIL.replace(":id", d.id)}
                            className="flex items-center gap-3 py-2.5 transition hover:bg-slate-50"
                        >
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-slate-900">{d.name}</span>
                                <span className="block truncate text-xs text-slate-500">
                                    {d.account && <>{d.account} · </>}
                                    {d.periods} {d.periods === 1 ? "periodo" : "periodos"} desde {monthName(d.since)}
                                </span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-red-600">{money(d.amount)}</span>
                            <ChevronRightIcon className="size-4 shrink-0 text-slate-300" />
                        </Link>
                    </li>
                ))}
            </ul>

            {hidden > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                    Se muestran las {debtors.length} mayores; hay {hidden} más con adeudo.
                </p>
            )}
        </div>
    )
}

export default DebtorsList
