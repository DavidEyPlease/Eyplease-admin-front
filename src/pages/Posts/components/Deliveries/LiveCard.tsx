import { LaneCell, LiveLane } from '@/interfaces/deliveries'
import { cn } from '@/lib/utils'
import { dayOf, shortDate } from '../../deliveries.utils'
import { formatNumber } from '../../page-utils'

const cellTitle = (lane: LiveLane, date: string, cell: LaneCell) => {
    const day = `${lane.name} · ${shortDate(date)}`
    switch (cell.state) {
        case 'ran': return `${day}: ${formatNumber(cell.pieces ?? 0)} piezas${cell.at ? ` (${cell.at})` : ''}${cell.failed ? ` · ${cell.failed} fallaron` : ''}`
        case 'missing': return `${day}: no corrió`
        case 'unknown': return `${day}: sin dato`
        case 'later': return `${day}: le toca a las ${lane.time}`
        default: return `${day}: no le toca`
    }
}

const Cell = ({ lane, date, cell }: { lane: LiveLane, date: string, cell: LaneCell }) => {
    const pieces = cell.pieces ?? 0
    const label = cell.state === 'ran' ? (pieces > 999 ? `${Math.round(pieces / 100) / 10}k` : String(pieces))
        : cell.state === 'missing' ? '✕' : cell.state === 'unknown' ? '·' : ''

    return (
        <span className={cn('ent-cell', cell.state, cell.state === 'ran' && pieces === 0 && 'zero', (cell.failed ?? 0) > 0 && 'failed')} title={cellTitle(lane, date, cell)}>
            {label}
        </span>
    )
}

const LiveCard = ({ lanes, days }: { lanes: LiveLane[], days: string[] }) => (
    <section className="shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-[18px] py-4">
            <h2 className="text-[15px] font-extrabold tracking-tight">En vivo, día por día</h2>
            <span className="ent-legend ml-auto">
                <span><span className="ent-cell ran">4</span> piezas</span>
                <span><span className="ent-cell ran zero">0</span> nadie</span>
                <span><span className="ent-cell missing">✕</span> no corrió</span>
                <span><span className="ent-cell unknown">·</span> sin dato</span>
            </span>
        </header>

        <div className="overflow-x-auto">
            <table className="ent-live">
                <thead>
                    <tr>
                        <th>Carril</th>
                        {days.map(date => <th key={date}>{dayOf(date)}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {lanes.map(lane => (
                        <tr key={lane.key}>
                            <td>
                                <b>{lane.name}</b>
                                <small>{lane.time} · {lane.note}</small>
                            </td>
                            {days.map(date => (
                                <td key={date}><Cell lane={lane} date={date} cell={lane.cells[date] ?? { state: 'off' }} /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
)

export default LiveCard
