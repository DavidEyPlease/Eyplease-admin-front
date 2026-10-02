import { useState } from 'react'
import { PauseIcon, PlayIcon, PowerIcon } from 'lucide-react'

import { ICoverageSubsection } from '@/interfaces/posts'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/uishadcn/ui/sheet'
import { ARTIFACT_LABEL, ARTIFACT_ORDER, FormatView, STATE_UI, SectionView } from '../../board.utils'
import { formatNumber } from '../../page-utils'
import { FormatCell } from './SectionsTable'

interface Props {
    view: SectionView | null
    publishing: boolean
    saving: boolean
    onClose: () => void
    onGenerate: (view: SectionView) => void
    onPause: (sectionKey: string, subSection: string | null, reason: string) => Promise<boolean>
    onResume: (sectionKey: string, subSection: string | null) => Promise<boolean>
}

/** Los formatos de una subsección, con el mismo criterio que la fila de la sección. */
const subFormats = (sub: ICoverageSubsection, view: SectionView): FormatView[] =>
    view.formats.map(sectionFormat => {
        const format = sub.formats?.[sectionFormat.artifact]
        if (!format) return { ...sectionFormat, done: 0, total: 0, liveOnly: false, known: false }

        const total = format.done + (format.pending ?? 0)
        // Una subsección del carril en vivo no tiene cierre: se enseña lo que hizo.
        const liveOnly = (sub.is_live ?? false) || (total === 0 && format.live > 0)

        return {
            ...sectionFormat,
            done: liveOnly ? format.live : format.done,
            total: liveOnly ? format.live : total,
            liveOnly,
            known: liveOnly || format.pending !== null || format.done > 0,
        }
    })

const subNote = (sub: ICoverageSubsection) => {
    if (sub.paused) return <span>Apagada: {sub.paused}</span>
    if (sub.is_live) return <span>Carril en vivo</span>

    const formats = Object.values(sub.formats ?? {})
    const pending = formats.reduce((total, format) => total + (format?.pending ?? 0), 0)
    const noTemplate = formats.some(format => format && (format.pending ?? 0) > 0 && format.has_template === false)

    if (noTemplate) return <span className="text-pink-600 dark:text-pink-400">Falta arte del mes</span>
    return <span>{pending > 0 ? `${formatNumber(pending)} archivos por crear` : 'Completa'}</span>
}

/** El detalle de una sección: sus subsecciones por formato, generar y apagar a propósito. */
const SectionSheet = ({ view, publishing, saving, onClose, onGenerate, onPause, onResume }: Props) => {
    const [pausing, setPausing] = useState<string | null>(null)
    const [reason, setReason] = useState('')

    const startPause = (key: string) => { setPausing(key); setReason('') }

    const confirmPause = async (subSection: string | null) => {
        if (!view || !reason.trim()) return
        if (await onPause(view.section.section_key, subSection, reason.trim())) setPausing(null)
    }

    // Función y no componente: como componente se re-montaba con cada letra y perdía el foco.
    const pauseForm = (subSection: string | null) => (
        <div className="col-span-full grid gap-2 rounded-xl border border-border p-3">
            <label className="text-[12px] font-semibold text-muted-foreground" htmlFor="pub-reason">¿Por qué se apaga? Lo verá el equipo.</label>
            <input
                id="pub-reason"
                autoFocus
                value={reason}
                onChange={event => setReason(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && confirmPause(subSection)}
                placeholder="Ej. lo cubre el cierre en vivo"
                className="h-9 rounded-lg border border-border bg-transparent px-3 text-[13px] outline-none focus:border-[#6C47FF]"
            />
            <div className="flex justify-end gap-2">
                <button type="button" className="vta-btn ghost" onClick={() => setPausing(null)}>Cancelar</button>
                <button type="button" className="vta-btn" disabled={saving || !reason.trim()} onClick={() => confirmPause(subSection)}><PauseIcon className="size-3.5" /> Apagar</button>
            </div>
        </div>
    )

    const section = view?.section
    const canGenerate = !!view && view.state !== 'paused' && (view.buckets.ready > 0 || view.buckets.scheduled > 0 || view.stalledRuns.length > 0)

    return (
        <Sheet open={!!view} onOpenChange={open => !open && onClose()}>
            <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
                {view && section && (
                    <>
                        <SheetHeader className="border-b border-border px-5 py-4">
                            <SheetTitle className="flex items-center gap-2 pr-8 text-[18px] font-extrabold tracking-tight">
                                {section.name}
                                <span className={`pub-pill ${STATE_UI[view.state].tone}`}>{STATE_UI[view.state].label}</span>
                            </SheetTitle>
                            <SheetDescription className="text-[12.5px]">
                                {section.cadence === 'daily' ? `Diaria: su corrida de las ${section.scheduled_at} la hace sola.` : 'Cierre del mes: se publica a inicios de mes con los datos del anterior.'}
                                {section.paused && <> Apagada a propósito: {section.paused}</>}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="grid gap-2.5 px-5 py-4">
                            <div className="pub-sub hd">
                                <span>Subsección</span>
                                {view.formats.map(format => <span key={format.artifact}>{format.label}</span>)}
                            </div>

                            {section.subsections.length === 0 && (
                                <div className="pub-sub">
                                    <span className="pub-name"><b>{section.name}</b><small>Sin subsecciones</small></span>
                                    {view.formats.map(format => <FormatCell key={format.artifact} format={format} />)}
                                </div>
                            )}

                            {section.subsections.map(sub => (
                                <div key={sub.item_key} className={`pub-sub ${sub.paused ? 'off' : ''}`}>
                                    <span className="pub-name min-w-0">
                                        <b className="truncate">{sub.name}</b>
                                        <small className="flex flex-wrap items-center gap-x-2">
                                            {subNote(sub)}
                                            {!sub.is_live && !section.paused && (sub.paused
                                                ? <button type="button" className="font-bold text-[#6C47FF] dark:text-[#A894FF]" disabled={saving} onClick={() => onResume(section.section_key, sub.item_key)}>Encender</button>
                                                : <button type="button" className="font-bold text-muted-foreground hover:text-foreground" onClick={() => startPause(sub.item_key)}>Apagar</button>)}
                                        </small>
                                    </span>
                                    {subFormats(sub, view).map(format => <FormatCell key={format.artifact} format={format} />)}
                                    {pausing === sub.item_key && pauseForm(sub.item_key)}
                                </div>
                            ))}

                            {ARTIFACT_ORDER.some(artifact => !section.artifacts.includes(artifact)) && (
                                <p className="pub-empty mt-1">
                                    No lleva {ARTIFACT_ORDER.filter(artifact => !section.artifacts.includes(artifact)).map(artifact => ARTIFACT_LABEL[artifact].toLowerCase()).join(' ni ')}: ninguna de sus plantillas activas tiene ese formato.
                                </p>
                            )}

                            {pausing === '__section' && pauseForm(null)}
                        </div>

                        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/90 px-5 py-3 backdrop-blur">
                            {section.paused
                                ? <button type="button" className="vta-btn" disabled={saving} onClick={() => onResume(section.section_key, null)}><PowerIcon className="size-3.5" /> Encender la sección</button>
                                : <button type="button" className="vta-btn ghost" onClick={() => startPause('__section')}><PauseIcon className="size-3.5" /> Apagar toda la sección</button>}
                            {canGenerate && (
                                <button type="button" className="vta-btn gro-primary" disabled={publishing} onClick={() => onGenerate(view)}>
                                    <PlayIcon className="size-3.5" /> Generar lo que falta
                                </button>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default SectionSheet
