import { ReactNode } from "react";
import { ActivityIcon, FileChartColumnIcon, ImagesIcon, StarIcon, WalletIcon } from "lucide-react";

import { API_ROUTES } from "@/constants/api";
import { Country, moneyIn } from "@/constants/countries";
import useFetchQuery from "@/hooks/useFetchQuery";
import { IClientListItem, IClientStats } from "@/interfaces/clients";
import { cn } from "@/lib/utils";
import { defaultPeriod, STATUS_LOADED } from "@/pages/Reports/reports.constants";
import { ClientStatus } from "@/pages/Reports/useReports";
import { periodLabel } from "@/utils/finance";
import { queryKeys } from "@/utils/queryKeys";
import useClientDebt from "../../List/useClientDebt";
import { ago, appDevices, ClientInsights } from "./useClientInsights";

type Tone = 'ok' | 'warn' | 'bad' | 'plain'

const TONE_TEXT: Record<Tone, string> = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-rose-600 dark:text-rose-400',
    plain: 'text-foreground',
}

const Tile = ({ icon, label, value, sub, tone = 'plain', bar, loading }: { icon: ReactNode, label: string, value: ReactNode, sub?: ReactNode, tone?: Tone, bar?: number, loading?: boolean }) => (
    <div className="shell-glass flex min-w-0 flex-col rounded-2xl p-4">
        <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">
            <span className="text-[#6C47FF] dark:text-[#A894FF]">{icon}</span>{label}
        </p>
        {loading ? (
            <>
                <span className="mt-2.5 h-7 w-24 animate-pulse rounded-lg bg-foreground/[.07]" />
                <span className="mt-2 h-3.5 w-32 animate-pulse rounded bg-foreground/[.05]" />
            </>
        ) : (
            <>
                <p className={cn('mt-1.5 truncate text-[20px] leading-tight font-extrabold tracking-tight tabular-nums sm:text-[24px]', TONE_TEXT[tone])}>{value}</p>
                {sub && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{sub}</p>}
                {bar !== undefined && (
                    <span className="mt-auto block pt-3">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-foreground/[.07]">
                            <span className="shell-grad block h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
                        </span>
                    </span>
                )}
            </>
        )}
    </div>
)

interface Props {
    client: IClientListItem
    stats: IClientStats | null
    country: Country
    /** Mientras llegan sus puntos (vienen del padrón, no de la ficha) */
    pointsLoading: boolean
    insights?: ClientInsights
    insightsLoading: boolean
}

/**
 * Cómo va este mes, en cinco cifras: si está al corriente, sus puntos, si ya tiene sus reportes,
 * cuánto de lo que le publicamos compartió y cuándo usó la plataforma por última vez. Cada cifra
 * sale de lo que ya decide el servidor (cobranza, matriz de reportes, estadísticas e insights).
 */
const MonthPulse = ({ client, stats, country, pointsLoading, insights, insightsLoading }: Props) => {
    const active = client.user?.active !== false
    const { debt, loading: debtLoading, failed: debtFailed } = useClientDebt(client.id)

    /* La misma matriz y la misma llave que Reportes y el padrón: si ya se vio, sale del caché */
    const period = defaultPeriod()
    const matrix = useFetchQuery<{ clients: ClientStatus[] }>(API_ROUTES.REPORTS.CLIENTS_STATUS, {
        queryParams: { year_month: period, country },
        customQueryKey: queryKeys.generic('report-clients-status', { period, country }),
        staleTime: 60_000,
    })
    const cells = Object.values(matrix.response?.clients.find(item => item.account === client.account)?.cells ?? {})
    const loaded = cells.filter(cell => cell === STATUS_LOADED).length

    const owes = (debt?.total ?? 0) > 0
    const months = debt?.periods.length ?? 0
    const points = Number(client.current_month_points ?? 0)
    const previous = Number(client.previous_month_points ?? 0)

    return (
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-5">
            <Tile
                icon={<WalletIcon className="size-3.5" />}
                label="Pago"
                loading={debtLoading}
                tone={debtFailed ? 'plain' : owes ? 'bad' : 'ok'}
                value={debtFailed ? '—' : owes ? `Debe ${moneyIn(debt!.total, debt!.currency)}` : 'Al corriente'}
                sub={debtFailed
                    ? 'No se pudo leer su cobranza'
                    : owes
                        ? `${months === 1 ? '1 mes' : `${months} meses`}${debt!.days_overdue > 0 ? ` · ${debt!.days_overdue} días de atraso` : ''}`
                        : active ? 'No debe nada' : 'Dada de baja sin adeudo'}
            />
            <Tile
                icon={<StarIcon className="size-3.5" />}
                label="Puntos del mes"
                loading={pointsLoading}
                value={points.toLocaleString(country === 'COL' ? 'es-CO' : 'es-MX')}
                sub={`${previous.toLocaleString(country === 'COL' ? 'es-CO' : 'es-MX')} el mes pasado`}
            />
            <Tile
                icon={<FileChartColumnIcon className="size-3.5" />}
                label="Reportes del mes"
                loading={matrix.loading && !matrix.response}
                tone={!cells.length ? 'plain' : loaded >= cells.length ? 'ok' : 'warn'}
                value={cells.length ? `${loaded} de ${cells.length}` : '—'}
                sub={cells.length ? `Cargados de ${periodLabel(period).toLowerCase()}` : active ? `No aparece en los reportes de ${periodLabel(period).toLowerCase()}` : 'Dada de baja: no se le bajan'}
                bar={cells.length ? (loaded / cells.length) * 100 : undefined}
            />
            <Tile
                icon={<ImagesIcon className="size-3.5" />}
                label="Publicaciones"
                loading={!stats}
                value={stats?.monthly_posts ?? 0}
                sub={stats ? `${stats.shared_posts} compartidas · ${stats.posts_shared_percentage}%` : undefined}
                bar={stats?.posts_shared_percentage}
            />
            <Tile
                icon={<ActivityIcon className="size-3.5" />}
                label="Última actividad"
                loading={insightsLoading}
                value={(() => {
                    const when = ago(insights?.activity.last_active_at ?? insights?.activity.last_sign_in_at)
                    return when ? when.charAt(0).toUpperCase() + when.slice(1) : 'Sin registro'
                })()}
                sub={insights ? (appDevices(insights.activity.devices) ? `Tiene ${appDevices(insights.activity.devices)}` : 'Sin la app: sólo web') : undefined}
            />
        </div>
    )
}

export default MonthPulse;
