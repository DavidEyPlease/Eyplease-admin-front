import { ArrowUpRightIcon, EyeIcon, SproutIcon, TargetIcon } from "lucide-react"

import useFetchQuery from "@/hooks/useFetchQuery"
import { LiveNews, STAR_LABEL } from "@/interfaces/liveNews"

/**
 * Novedades del día de toda la cartera, en observación.
 *
 * El detector de saltos de estrella es nuevo: antes de dejar que genere
 * felicitaciones que salen hacia la clienta, aquí se ve lo que ESTARÍA
 * publicando. Si dice que alguien subió de nivel, tiene que ser cierto — el
 * error no lo paga el panel, lo paga la Directora frente a su consultora.
 *
 * Por eso el panel grita que no se está publicando nada: un tablero que se
 * parece a lo que ya salió, y no lo es, engaña más que informar.
 */

/** Se refresca solo, igual que el resto del Inicio. */
const REFRESH_MS = 2 * 60_000

const dayLabel = (iso: string): string => {
    const [y, m, d] = iso.split("-").map(Number)
    if (!y || !m || !d) return iso
    return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "long" })
}

/** Fila de una novedad. Mismo esqueleto en los tres grupos para que se lean igual de rápido. */
const Row = ({
    name,
    detail,
    sponsor,
    trailing,
}: {
    name: string | null
    detail: React.ReactNode
    sponsor: string | null
    trailing?: React.ReactNode
}) => (
    <li className="flex min-w-0 items-start justify-between gap-3 py-2">
        <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name ?? "Sin nombre"}</p>
            <p className="truncate text-xs text-muted-foreground">
                {detail}
                {sponsor && <> · red de {sponsor}</>}
            </p>
        </div>
        {trailing}
    </li>
)

/** Contenedor de grupo: se mantiene visible aunque esté vacío, porque el vacío también informa. */
const Group = ({
    icon: Icon,
    title,
    count,
    empty,
    children,
    accent,
}: {
    icon: typeof TargetIcon
    title: string
    count: number
    empty: string
    children: React.ReactNode
    accent: string
}) => (
    <div className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
            <Icon className={"size-4 shrink-0 " + accent} />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">{count}</span>
        </div>

        {count === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">{empty}</p>
        ) : (
            <ul className="mt-1 divide-y divide-border">{children}</ul>
        )}
    </div>
)

const LiveNewsPanel = () => {
    const { response, loading } = useFetchQuery<LiveNews>("/live-news", {
        customQueryKey: ["admin", "live-news"],
        staleTime: 60_000,
        refetchInterval: REFRESH_MS,
    })

    if (loading && !response) return null
    if (!response) return null

    const { totals } = response

    return (
        <section className="grid min-w-0 gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="text-sm font-semibold text-foreground">
                    Novedades del día
                    <span className="ml-2 font-normal text-muted-foreground">
                        {dayLabel(response.date)}
                    </span>
                </h2>

                {/* No es decoración: sin esto el panel se lee como "esto ya salió". */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                    <EyeIcon className="size-3" />
                    En observación · todavía no se publica nada
                </span>
            </div>

            <div className="grid min-w-0 gap-3 lg:grid-cols-3">
                <Group
                    icon={ArrowUpRightIcon}
                    title="Subió de estrella"
                    count={totals.star_level_up}
                    accent="text-emerald-600 dark:text-emerald-400"
                    empty="Nadie cruzó un nivel hoy."
                >
                    {response.star_level_up.map((item) => (
                        <Row
                            key={item.sponsored_id}
                            name={item.name}
                            sponsor={item.sponsor_name}
                            detail={
                                <>
                                    {item.previous_star
                                        ? `de ${STAR_LABEL[item.previous_star]} a ${STAR_LABEL[item.star]}`
                                        : `logró ${STAR_LABEL[item.star]}`}
                                    {" · "}
                                    {item.points.toLocaleString("es-MX")} pts
                                </>
                            }
                            trailing={
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                    +{item.gained.toLocaleString("es-MX")}
                                </span>
                            }
                        />
                    ))}
                </Group>

                <Group
                    icon={TargetIcon}
                    title="A tiro del siguiente"
                    count={totals.star_close}
                    accent="text-violet-600 dark:text-violet-400"
                    empty="Nadie está cerca de cruzar."
                >
                    {response.star_close.map((item) => (
                        <Row
                            key={item.sponsored_id}
                            name={item.name}
                            sponsor={item.sponsor_name}
                            detail={
                                <>
                                    {item.points.toLocaleString("es-MX")} pts · va por{" "}
                                    {STAR_LABEL[item.star]}
                                </>
                            }
                            trailing={
                                <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium tabular-nums text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                                    faltan {item.points_needed.toLocaleString("es-MX")}
                                </span>
                            }
                        />
                    ))}
                </Group>

                <Group
                    icon={SproutIcon}
                    title="Inicios nuevos"
                    count={totals.new_beginning}
                    accent="text-teal-600 dark:text-teal-400"
                    empty="Nadie entró en los últimos días."
                >
                    {response.new_beginning.map((item) => (
                        <Row
                            key={item.sponsored_id}
                            name={item.name}
                            sponsor={item.sponsor_name}
                            detail={
                                <>
                                    inició el {dayLabel(item.start_date)}
                                    {item.consultant_code && <> · {item.consultant_code}</>}
                                </>
                            }
                        />
                    ))}
                </Group>
            </div>
        </section>
    )
}

export default LiveNewsPanel
