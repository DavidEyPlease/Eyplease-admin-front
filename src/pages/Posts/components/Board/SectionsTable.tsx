import { NewsletterCode } from '@/interfaces/posts'
import { ARTIFACT_LABEL, ARTIFACT_ORDER, FormatView, STATE_UI, SectionView } from '../../board.utils'
import { formatNumber } from '../../page-utils'

const GROUPS: { code: NewsletterCode, label: string }[] = [
    { code: 'unit_newsletter', label: 'Boletín de unidad' },
    { code: 'national_newsletter', label: 'Boletín nacional' },
]

export const FormatCell = ({ format }: { format?: FormatView }) => {
    if (!format) return <span className="pub-fmt na">No lleva</span>
    if (!format.known) return <span className="pub-fmt na">Sin calcular</span>

    const complete = format.total > 0 && format.done >= format.total

    return (
        <span className="pub-fmt">
            <span><b>{formatNumber(format.done)}</b> / {formatNumber(format.total)}{format.liveOnly && ' en vivo'}</span>
            <span className={`pub-prog thin ${complete ? 'ok' : ''}`}><i style={{ width: `${format.total ? (format.done / format.total) * 100 : 0}%` }} /></span>
        </span>
    )
}

export const TemplatesCell = ({ view }: { view: SectionView }) => {
    const { ready, total } = view.templates
    if (total === 0) return <span className="pub-fmt na">—</span>

    return <span className={`pub-tpl ${ready === total ? 'ok' : 'no'}`}>{ready === total ? '✓' : '✕ Falta'} {ready} de {total}</span>
}

interface Props {
    views: SectionView[]
    onOpen: (sectionKey: string) => void
}

const SectionsTable = ({ views, onOpen }: Props) => (
    <section className="shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl">
        <header className="flex items-center gap-3 px-[18px] py-4">
            <h2 className="text-[15px] font-extrabold tracking-tight">Secciones</h2>
            <span className="ml-auto text-[12px] text-muted-foreground">Toca una sección para ver sus subsecciones</span>
        </header>

        {GROUPS.map(group => {
            const rows = views.filter(view => view.section.newsletter === group.code)
            if (!rows.length) return null

            return (
                <div key={group.code}>
                    <div className="pub-grp">{group.label}</div>
                    <div className="pub-row hd">
                        <span>Sección</span>
                        {ARTIFACT_ORDER.map(artifact => <span key={artifact}>{ARTIFACT_LABEL[artifact]}</span>)}
                        <span>Plantilla del mes</span>
                        <span>Estado</span>
                    </div>
                    {rows.map(view => (
                        <button key={view.section.section_key} type="button" className="pub-row" onClick={() => onOpen(view.section.section_key)}>
                            <span className="pub-name">
                                <b>{view.section.name}</b>
                                <small>{view.section.cadence === 'daily' ? `Diaria · ${view.section.scheduled_at}` : 'Cierre del mes'}{(view.section.live_posts ?? 0) > 0 && ` · ${formatNumber(view.section.live_posts ?? 0)} en vivo`}</small>
                            </span>
                            {ARTIFACT_ORDER.map(artifact => <FormatCell key={artifact} format={view.formats.find(format => format.artifact === artifact)} />)}
                            <TemplatesCell view={view} />
                            <span className={`pub-pill ${STATE_UI[view.state].tone}`}>{STATE_UI[view.state].label}</span>
                        </button>
                    ))}
                </div>
            )
        })}
    </section>
)

export default SectionsTable
