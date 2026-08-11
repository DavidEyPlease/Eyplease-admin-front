import { useMemo, useState } from 'react'
import { InfoIcon, SendIcon } from 'lucide-react'

import Dropdown from '@/components/common/Inputs/Dropdown'
import { BtnPrimary, Panel } from '@/components/generics/brand-ui'
import { Checkbox } from '@/uishadcn/ui/checkbox'
import { Label } from '@/uishadcn/ui/label'
import { ISectionCoverage, PostArtifact } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatNumber } from '../../page-utils'

const ARTIFACT_OPTIONS: { value: PostArtifact, label: string }[] = [
    { value: 'image', label: 'Imagen' },
    { value: 'video', label: 'Video' },
]

interface Props {
    sections: ISectionCoverage[]
    publishing: boolean
    onPublish: (sectionKeys: string[], artifacts: PostArtifact[]) => void
}

const LaunchPanel = ({ sections, publishing, onPublish }: Props) => {
    const [sectionKey, setSectionKey] = useState(sections[0]?.section_key ?? '')
    const [artifacts, setArtifacts] = useState<PostArtifact[]>(['image', 'video'])

    const section = useMemo(
        () => sections.find(item => item.section_key === sectionKey),
        [sections, sectionKey],
    )

    const toggleArtifact = (artifact: PostArtifact) => {
        setArtifacts(current =>
            current.includes(artifact) ? current.filter(item => item !== artifact) : [...current, artifact],
        )
    }

    /* Un job por subsección y artefacto: es el fan-out real de buildSectionJobs() */
    const jobsToQueue = section ? Math.max(section.subsections.length, 1) * artifacts.length : 0
    const pendingPieces = section?.pending ?? null
    const canPublish = !!section && artifacts.length > 0 && !publishing

    return (
        <Panel className="overflow-hidden">
            <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <SendIcon className="size-4 text-muted-foreground" />
                <h3 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Lanzar publicación</h3>
            </header>

            <div className="flex flex-col gap-3.5 p-4">
                <Dropdown
                    label="Sección"
                    placeholder="Selecciona una sección"
                    value={sectionKey}
                    items={sections.map(item => ({ label: item.name, value: item.section_key }))}
                    onChange={setSectionKey}
                />

                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium">Archivos a generar</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {ARTIFACT_OPTIONS.map(option => {
                            const checked = artifacts.includes(option.value)
                            const disabled = !!section && !section.artifacts.includes(option.value)

                            return (
                                <Label
                                    key={option.value}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                                        checked ? 'border-brand-violet/30 bg-brand-violet-soft text-brand-violet' : 'border-border hover:bg-muted/40',
                                        disabled && 'pointer-events-none opacity-40',
                                    )}
                                >
                                    <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleArtifact(option.value)} />
                                    {option.label}
                                </Label>
                            )
                        })}
                    </div>
                </div>

                <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11.5px] leading-relaxed font-medium text-blue-900">
                    <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                        Se encolarán <b>{jobsToQueue} jobs</b>
                        {pendingPieces !== null && <> para <b>{formatNumber(pendingPieces)} piezas pendientes</b></>}.
                        Quien ya tenga ese archivo se omite: solo se renderiza lo que falta.
                    </span>
                </div>

                <BtnPrimary
                    className="justify-center py-2.5"
                    disabled={!canPublish}
                    onClick={() => section && onPublish([section.section_key], artifacts)}
                >
                    <SendIcon className="size-3.5" />
                    {publishing ? 'Encolando…' : 'Publicar sección'}
                </BtnPrimary>
            </div>
        </Panel>
    )
}

export default LaunchPanel
