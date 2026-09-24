import { useMemo, useState } from 'react'

import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import { Switch } from '@/uishadcn/ui/switch'

import QueueRow from './components/QueueRow'
import SalesRail, { SalesFilter, Tally } from './components/SalesRail'
import { SalesRow, SalesStage, useSalesActions, useSalesQueue } from './useSales'
import '@/pages/Hoy/hoy.css'
import './ventas.css'

const GROUPS: Array<{ stage: SalesStage, title: string, hint: string }> = [
    { stage: 'waiting', title: 'Te esperan', hint: 'Arriba, quien lleva más tiempo esperando respuesta' },
    { stage: 'closing', title: 'Por cerrar', hint: 'Ya las contactaste: falta activar el plan o dar el premio' },
    { stage: 'warm', title: 'Andan mirando', hint: 'Tocaron un candado o miraron un plan, pero no lo han pedido' },
    { stage: 'done', title: 'Ya cerradas', hint: 'Los regalos y los planes, de los últimos 60 días' },
]

const tallyOf = (rows: SalesRow[]): Tally => {
    const open = rows.filter(row => row.stage === 'waiting' || row.stage === 'closing')
    return {
        pending: open.length,
        closing: rows.filter(row => row.stage === 'closing').length,
        warm: rows.filter(row => row.stage === 'warm').length,
        done: rows.filter(row => row.stage === 'done').length,
        monthly: open.reduce((sum, row) => sum + row.monthly, 0),
    }
}

/**
 * Ventas: quién está a un WhatsApp de comprar. Las tres listas de la app (regalos y paquetes de
 * unidad, quién quiere subir de plan y las Directoras invitadas) NO son tres pestañas: son una
 * sola fila de trabajo, ordenada por quién lleva más tiempo esperando, porque la pregunta que se
 * hace aquí es siempre la misma — ¿a quién le escribo ahora? La app no cobra: esto se cierra
 * afuera y aquí se marca.
 */
const SalesPage = () => {
    const { rows, total, missing, loadMore, loading, loadingMore } = useSalesQueue()
    const actions = useSalesActions()
    const [filter, setFilter] = useState<SalesFilter>('all')
    const [pendingOnly, setPendingOnly] = useState(true)

    const tally = useMemo(() => ({
        all: tallyOf(rows),
        gift: tallyOf(rows.filter(row => row.kind === 'gift')),
        interest: tallyOf(rows.filter(row => row.kind === 'interest')),
        prospect: tallyOf(rows.filter(row => row.kind === 'prospect')),
    }), [rows])

    const shown = useMemo(() => rows.filter(row => {
        if (filter !== 'all' && row.kind !== filter) return false
        if (pendingOnly && row.stage !== 'waiting' && row.stage !== 'closing') return false
        return true
    }), [rows, filter, pendingOnly])

    const waiting = tally.all.pending - tally.all.closing
    const verdict = waiting > 0
        ? `${waiting} ${waiting === 1 ? 'te espera' : 'te esperan'}.`
        : tally.all.closing > 0 ? `${tally.all.closing} por cerrar.` : 'Nadie en la fila.'

    return (
        <div className="grid min-w-0 grid-cols-1 items-start gap-[18px] xl:grid-cols-[290px_minmax(0,1fr)]">
            {/* En pantalla chica el contexto va DEBAJO: primero la fila, que es el trabajo */}
            <aside className="pulse-rail order-2 grid gap-3.5 xl:order-1 xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-106px)] xl:overflow-y-auto xl:pr-0.5">
                <SalesRail tally={tally} filter={filter} onFilter={setFilter} />
            </aside>

            <div className="order-1 mx-auto grid w-full max-w-[780px] min-w-0 gap-[18px] xl:order-2">
                {isNewShell() ? (
                    <PageHead
                        eyebrow="Clientas · Ventas"
                        title={<>Ventas. <em className={cn(waiting === 0 && tally.all.closing === 0 && '!bg-none !text-emerald-600 dark:!text-emerald-400')}>{verdict}</em></>}
                        sub="Quién quiere subir de plan, quién quiere regalar Eyplease+ a su unidad y las Directoras que llegan invitadas. La app las anota; el trato se cierra aquí."
                    />
                ) : (
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: 'linear-gradient(180deg,#5B47E0,#5DD9D2)' }} />
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Ventas · {verdict}</h1>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <p className="text-[12px] font-semibold text-muted-foreground tabular-nums">
                        {shown.length} en pantalla · {total} anotadas
                    </p>
                    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
                        <Switch checked={pendingOnly} onCheckedChange={setPendingOnly} />
                        Sólo pendientes
                    </label>
                </div>

                {loading && (
                    <div className="grid gap-3">
                        {Array.from({ length: 4 }, (_, index) => <span key={index} className="h-[150px] animate-pulse rounded-[22px] bg-foreground/[.06]" />)}
                    </div>
                )}

                {!loading && !shown.length && (
                    <p className="rounded-[22px] border border-dashed border-border px-5 py-12 text-center text-[13px] text-muted-foreground">
                        {rows.length
                            ? 'Nadie con ese filtro. Apaga «Sólo pendientes» para ver lo tibio y lo ya cerrado.'
                            : 'Nadie ha pedido nada todavía. Cuando una Directora quiera regalar Eyplease+, subir de plan o invitar a su Directora desde la app, cae aquí.'}
                    </p>
                )}

                {GROUPS.map(group => {
                    const groupRows = shown.filter(row => row.stage === group.stage)
                    if (!groupRows.length) return null

                    return (
                        <section key={group.stage} className="grid gap-3">
                            <div className="flex flex-wrap items-baseline gap-x-2.5">
                                <h2 className="text-[15px] font-extrabold tracking-tight">{group.title}</h2>
                                <span className="text-[11.5px] font-bold text-muted-foreground tabular-nums">{groupRows.length}</span>
                                <span className="text-[11.5px] text-muted-foreground">· {group.hint}</span>
                            </div>
                            {groupRows.map((row, index) => <QueueRow key={row.key} row={row} index={index} actions={actions} />)}
                        </section>
                    )
                })}

                {/* La API manda lo pendiente primero: lo que falta por traer es historia, no trabajo */}
                {!loading && missing > 0 && !pendingOnly && (
                    <button type="button" disabled={loadingMore} onClick={loadMore} className="vta-btn mx-auto">
                        {loadingMore ? 'Trayendo…' : `Ver ${missing} más`}
                    </button>
                )}
            </div>
        </div>
    )
}

export default SalesPage
