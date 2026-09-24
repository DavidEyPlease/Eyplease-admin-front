import { useEffect, useState } from 'react'

import { DailySection } from '@/interfaces/overview'
import { PulseLane } from '@/interfaces/pulse'
import { cn } from '@/lib/utils'
import { clock } from '../lib'

interface Props {
    lanes: PulseLane[]
    daily: DailySection[]
    /** Llaves de carril que hoy ya dejaron una corrida (de publicación o del robot) */
    ranKeys: Set<string>
    partial: boolean
}

/**
 * El calendario de hoy: cada carril a su hora. Hecho / ahora / por venir sale del reloj, y donde
 * la API sabe más (una diaria que ya pasó su hora y no corrió) se marca en rojo en vez de darla
 * por hecha.
 */
const ScheduleCard = ({ lanes, daily, ranKeys, partial }: Props) => {
    const [now, setNow] = useState(() => clock(new Date()))
    useEffect(() => {
        const id = window.setInterval(() => setNow(clock(new Date())), 30_000)
        return () => window.clearInterval(id)
    }, [])

    const current = [...lanes].filter(lane => lane.time <= now).pop()

    return (
        <section className="shell-glass pulse-rise rounded-3xl p-[18px]" style={{ '--i': 1 } as React.CSSProperties}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
                <h2 className="text-[14.5px] font-extrabold tracking-tight">Calendario de hoy</h2>
                <span className="pulse-tag plain tabular-nums">{now}</span>
            </div>

            <div className="lanes">
                {lanes.map(lane => {
                    const section = daily.find(item => item.key === lane.key)
                    const missing = section?.today_status === 'missing'
                    const failed = section?.today_status === 'partial' ? section.failed_today ?? 0 : 0
                    const empty = section?.today_status === 'empty'
                    const past = lane.time <= now
                    const isNow = current?.key === lane.key && current.time === lane.time && !missing
                    const state = missing ? 'bad' : isNow ? 'now' : past || ranKeys.has(lane.key) ? 'done' : ''
                    return (
                        <div key={`${lane.time}-${lane.key}`} className={cn('lane', state)}>
                            <time>{lane.time}</time><i />
                            <span><b>{lane.label}</b><small>{missing ? 'Le tocaba y no ha salido' : failed ? `Salió, con ${failed} ${failed === 1 ? 'falla' : 'fallas'}` : empty ? 'Sin piezas hoy' : lane.hint}</small></span>
                        </div>
                    )
                })}
            </div>

            {!lanes.length && <p className="py-4 text-center text-[12px] text-muted-foreground">Sin calendario disponible.</p>}
            {partial && lanes.length > 0 && <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">Sólo las publicaciones diarias. El calendario completo (robot y carriles en vivo) llega con la actualización del servidor.</p>}
        </section>
    )
}

export default ScheduleCard
