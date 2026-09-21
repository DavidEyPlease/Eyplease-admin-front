import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CreditCardIcon, MoreHorizontalIcon, PowerIcon, PowerOffIcon, SearchIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'
import { replaceRecordIdInPath } from '@/utils'
import PaymentLinkDialog from '@/components/generics/PaymentLinkDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/uishadcn/ui/dropdown-menu'
import { initials, titleCase } from './names'
import StatusDialog from './StatusDialog'
import useClientsBoard, { BoardClient, PaymentState } from './useClientsBoard'
import '@/pages/Hoy/hoy.css'

const PAYMENT: Record<PaymentState, { label: string, tone: string }> = {
    ok: { label: 'Al corriente', tone: 'ok' },
    pending: { label: 'Por vencer', tone: 'plain' },
    in_review: { label: 'Por validar', tone: 'plain' },
    overdue: { label: 'Vencida', tone: 'bad' },
    unknown: { label: '…', tone: 'plain' },
}

const lastSeen = (value: Date | string | null) => {
    if (!value) return 'nunca ha entrado'
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
    return days <= 0 ? 'entró hoy' : days === 1 ? 'entró ayer' : days < 60 ? `entró hace ${days} días` : `entró hace ${Math.round(days / 30)} meses`
}

type Quick = 'all' | 'overdue' | 'no_password' | 'reports' | 'inactive'

const Row = ({ row, onChangeStatus, onPaymentLink }: { row: BoardClient, onChangeStatus: (row: BoardClient) => void, onPaymentLink: (row: BoardClient) => void }) => {
    const navigate = useNavigate()
    const { client, payment, reports } = row
    const active = client.user?.active !== false
    const plan = client.user?.plan
    const pay = PAYMENT[payment]
    const reportsDone = !!reports && reports.loaded >= reports.entitled
    const open = () => navigate(replaceRecordIdInPath(APP_ROUTES.CLIENTS.DETAIL, client.id))

    return (
        <tr onClick={open} className={cn('cursor-pointer transition-colors hover:bg-foreground/[.035]', !active && 'opacity-60')}>
            <td className="py-3 pr-3 pl-5">
                <div className="flex items-center gap-3">
                    {client.photo?.url
                        ? <img src={client.photo.url} alt="" loading="lazy" className="size-10 shrink-0 rounded-[13px] object-cover" />
                        : <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-primary/10 text-[12px] font-extrabold text-primary">{initials(client.name)}</span>}
                    <span className="min-w-0">
                        <b className="block truncate text-[13.5px] font-bold">{titleCase(client.name)}</b>
                        <small className="block truncate text-[11.5px] text-muted-foreground">{client.account}{client.rank ? ` · ${client.rank}` : ''}</small>
                    </span>
                </div>
            </td>
            <td className="px-3 py-3 whitespace-nowrap">
                {plan ? <><span className="pulse-tag plain">{plan.name}</span> <small className="ml-1 text-[11.5px] text-muted-foreground">${Number(plan.price).toLocaleString('es-MX')}/mes</small></> : <span className="text-[12px] text-muted-foreground">Sin plan</span>}
                {client.promotion && <small className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">{client.promotion.name ?? 'Con promoción'}</small>}
            </td>
            <td className="px-3 py-3 whitespace-nowrap">{active ? <span className={cn('pulse-tag', pay.tone)}>{pay.label}</span> : <span className="pulse-tag warn">Inactiva</span>}</td>
            <td className="px-3 py-3 whitespace-nowrap">
                {reports ? <span className={cn('pulse-tag', reportsDone ? 'ok' : 'warn')}>{reports.loaded} de {reports.entitled}</span> : <span className="text-[12px] text-muted-foreground">—</span>}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">
                <b className="text-[13.5px] font-extrabold">{Number(client.current_month_points ?? 0).toLocaleString('es-MX')}</b>
                <small className="block text-[11px] text-muted-foreground">{Number(client.previous_month_points ?? 0).toLocaleString('es-MX')} el mes pasado</small>
            </td>
            <td className="px-3 py-3 whitespace-nowrap">
                {row.hasPortalPassword ? <small className="text-[11.5px] text-muted-foreground">{lastSeen(client.last_sign_in_at)}</small> : <span className="pulse-tag warn">Sin contraseña del portal</span>}
            </td>
            {/* Todo lo de esta celda se queda en la celda: el menú va en un portal, pero los eventos de
                React suben por el árbol de componentes, y sin esto elegir «Desactivar» abría su ficha */}
            <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap" onClick={event => event.stopPropagation()}>
                <button type="button" onClick={open} className="h-8 cursor-pointer rounded-xl px-3 text-[12.5px] font-bold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">Abrir</button>
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label={`Más acciones para ${titleCase(client.name)}`} className="ml-0.5 inline-grid size-8 cursor-pointer place-items-center rounded-xl align-middle text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5">
                        <MoreHorizontalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-60 rounded-2xl p-1.5">
                        {/* Quien paga domiciliada no necesita liga: el cargo le llega solo */}
                        {!client.card_subscription && <>
                            <DropdownMenuItem onSelect={() => onPaymentLink(row)} className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold">
                                <CreditCardIcon className="size-4" /> Liga de pago con tarjeta
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>}
                        <DropdownMenuItem
                            onSelect={() => onChangeStatus(row)}
                            className={cn('cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold', active && 'text-destructive focus:text-destructive')}
                        >
                            {active ? <PowerOffIcon className="size-4" /> : <PowerIcon className="size-4" />}
                            {active ? 'Desactivar clienta' : 'Activar clienta'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    )
}

/**
 * El padrón del rediseño: una fila, todo su estado — plan y precio, pago, reportes del mes, puntos y
 * acceso — sin salir de la lista. Para editar en la propia tabla (login, contraseña, logotipo,
 * promoción) sigue estando la «Tabla de trabajo» de siempre, a un clic.
 */
const StatusBoard = () => {
    const { rows, loading } = useClientsBoard()
    const [search, setSearch] = useState('')
    const [plan, setPlan] = useState<string>('all')
    const [quick, setQuick] = useState<Quick>('all')
    /* El diálogo vive AQUÍ y no dentro de la fila, por la misma razón que la celda del menú corta
       los clics: dentro de un <tr> clicable, cada clic del diálogo abriría la ficha */
    const [changing, setChanging] = useState<BoardClient | null>(null)
    const [paying, setPaying] = useState<BoardClient | null>(null)

    const plans = useMemo(() => {
        const counts = new Map<string, number>()
        rows.forEach(row => { const name = row.client.user?.plan?.name; if (name) counts.set(name, (counts.get(name) ?? 0) + 1) })
        return [...counts.entries()].sort((a, b) => b[1] - a[1])
    }, [rows])

    const counts = useMemo(() => ({
        overdue: rows.filter(row => row.payment === 'overdue').length,
        no_password: rows.filter(row => !row.hasPortalPassword).length,
        reports: rows.filter(row => row.reports && row.reports.loaded < row.reports.entitled).length,
        inactive: rows.filter(row => row.client.user?.active === false).length,
    }), [rows])

    const shown = useMemo(() => {
        const text = search.trim().toLocaleLowerCase('es-MX')
        return rows.filter(row => {
            if (plan !== 'all' && row.client.user?.plan?.name !== plan) return false
            if (quick === 'overdue' && row.payment !== 'overdue') return false
            if (quick === 'no_password' && row.hasPortalPassword) return false
            if (quick === 'reports' && !(row.reports && row.reports.loaded < row.reports.entitled)) return false
            if (quick === 'inactive' && row.client.user?.active !== false) return false
            if (text && !`${row.client.name} ${row.client.account}`.toLocaleLowerCase('es-MX').includes(text)) return false
            return true
        })
    }, [rows, search, plan, quick])

    const chip = (activeChip: boolean) => cn('inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', activeChip ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground')

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3.5">
            <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[340px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre o número de cuenta…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                </label>
                <span className="text-[12px] font-semibold text-muted-foreground tabular-nums">{shown.length} de {rows.length}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <button type="button" className={chip(plan === 'all' && quick === 'all')} onClick={() => { setPlan('all'); setQuick('all') }}>Todas <b className="text-[11px] font-extrabold opacity-70">{rows.length}</b></button>
                {plans.map(([name, count]) => <button key={name} type="button" className={chip(plan === name)} onClick={() => setPlan(plan === name ? 'all' : name)}>{name} <b className="text-[11px] font-extrabold opacity-70">{count}</b></button>)}
                <span className="mx-1 hidden h-8 w-px bg-border sm:block" />
                {([['overdue', 'Con pago vencido'], ['reports', 'Les faltan reportes'], ['no_password', 'Sin contraseña del portal'], ['inactive', 'Inactivas']] as Array<[Exclude<Quick, 'all'>, string]>).filter(([key]) => counts[key] > 0).map(([key, label]) => (
                    <button key={key} type="button" className={chip(quick === key)} onClick={() => setQuick(quick === key ? 'all' : key)}>{label} <b className="text-[11px] font-extrabold opacity-70">{counts[key]}</b></button>
                ))}
            </div>

            <section className="shell-glass overflow-hidden rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left">
                        <thead>
                            <tr className="border-b border-border text-[10.5px] font-bold tracking-[.08em] text-muted-foreground uppercase">
                                <th className="py-3 pr-3 pl-5 font-bold">Clienta</th><th className="px-3 py-3 font-bold">Plan</th><th className="px-3 py-3 font-bold">Pago</th><th className="px-3 py-3 font-bold">Reportes del mes</th><th className="px-3 py-3 text-right font-bold">Puntos del mes</th><th className="px-3 py-3 font-bold">Acceso</th><th />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {shown.map(row => <Row key={row.client.id} row={row} onChangeStatus={setChanging} onPaymentLink={setPaying} />)}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="grid gap-2 p-4">{Array.from({ length: 6 }, (_, index) => <span key={index} className="h-12 animate-pulse rounded-xl bg-foreground/[.06]" />)}</div>}
                {!loading && !shown.length && <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">{rows.length ? 'Ninguna clienta con ese filtro.' : 'Todavía no hay clientas.'}</p>}
            </section>

            <StatusDialog client={changing} onClose={() => setChanging(null)} />
            <PaymentLinkDialog account={paying?.client.account ?? null} name={paying ? titleCase(paying.client.name) : ''} onClose={() => setPaying(null)} />
        </div>
    )
}

export default StatusBoard
