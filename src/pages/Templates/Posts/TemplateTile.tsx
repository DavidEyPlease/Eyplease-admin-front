import { useState } from "react"
import { Link } from "react-router"
import { ImageOffIcon, PlayIcon, RectangleVerticalIcon, SquareIcon, type LucideIcon } from "lucide-react"

import { APP_ROUTES } from "@/constants/app"
import { ITemplate } from "@/interfaces/templates"
import { cn } from "@/lib/utils"
import { MONTH_LABELS } from "@/utils/finance"
import SwitchAction from "../components/SwitchAction"
import { countryOf, formatsOf, PostFormat, POST_FORMATS, thumbOf, usesBase } from "./lib"
import TemplateMenu from "./TemplateMenu"

const FORMAT_ICON: Record<PostFormat, LucideIcon> = { image: RectangleVerticalIcon, image_square: SquareIcon, video: PlayIcon }

/**
 * Una plantilla: su arte manda (la vertical, que es la pieza principal), encima los formatos en que sale y,
 * abajo, si está encendida y su menú. El arte y el nombre abren la ficha, donde se ajusta.
 */
const TemplateTile = ({ template, subgroup, showMonth = false }: { template: ITemplate, subgroup: string | null, showMonth?: boolean }) => {
    const [broken, setBroken] = useState(false)
    const thumb = thumbOf(template)
    const formats = formatsOf(template)
    const detail = APP_ROUTES.CONFIGURATIONS.TEMPLATE_DETAIL.replace(':id', template.id)
    const colombia = countryOf(template) === 'COL'
    const withBase = usesBase(template)

    return (
        <article className={cn(
            'group relative flex w-[150px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-border/70 bg-card/80 transition duration-200 hover:-translate-y-0.5 hover:border-[#6C47FF]/45 hover:shadow-[0_16px_34px_-20px_rgba(76,52,196,.6)]',
            !template.active && 'opacity-75 hover:opacity-100',
        )}>
            <Link to={detail} aria-label={`Abrir ${template.name}`} className="relative block aspect-[9/16] overflow-hidden bg-foreground/[.06]">
                {thumb.url && !broken && thumb.kind === 'video' && (
                    <video src={`${thumb.url}#t=0.5`} muted playsInline preload="metadata" className="size-full object-cover" onError={() => setBroken(true)} />
                )}
                {thumb.url && !broken && thumb.kind !== 'video' && (
                    <img
                        src={thumb.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={() => setBroken(true)}
                        className={cn('size-full transition-transform duration-500 group-hover:scale-[1.03]', thumb.kind === 'square' ? 'object-contain' : 'object-cover')}
                    />
                )}
                {(!thumb.url || broken) && (
                    <span className="absolute inset-0 grid place-content-center justify-items-center gap-1.5 text-muted-foreground/70">
                        <ImageOffIcon className="size-7" />
                        <small className="text-[11px] font-semibold">Sin arte</small>
                    </span>
                )}

                <span className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2">
                    <span className="flex flex-col items-start gap-1">
                        {!template.active && <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10.5px] font-extrabold text-amber-300 backdrop-blur-sm">Apagada</span>}
                        {withBase && <span className="rounded-full bg-[#4E31C0]/85 px-2 py-0.5 text-[10.5px] font-extrabold text-white backdrop-blur-sm" title="Sale de una base que el sistema llena con la foto y los nombres">Con base</span>}
                    </span>
                    {colombia && <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10.5px] font-extrabold text-white backdrop-blur-sm" title="Plantilla de Colombia">CO</span>}
                </span>

                {formats.length > 0 && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-white backdrop-blur-sm">
                        {POST_FORMATS.filter(format => formats.includes(format.key)).map(format => {
                            const Icon = FORMAT_ICON[format.key]
                            return <span key={format.key} title={format.label} aria-label={format.label}><Icon className="size-3.5" /></span>
                        })}
                    </span>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 pt-2.5 pb-2">
                <Link to={detail} className="line-clamp-2 text-[12.5px] leading-snug font-bold hover:underline" title={template.name}>{template.name}</Link>
                <small className="truncate text-[11px] text-muted-foreground">
                    {[showMonth && MONTH_LABELS[template.month - 1], subgroup].filter(Boolean).join(' · ') || '\u00a0'}
                </small>
                {!template.preset_slug && (
                    <small className="text-[10.5px] font-semibold text-amber-600 dark:text-amber-400" title="No tiene preset: el ajuste directo de la ficha no sabe qué capas lleva">Sin ajuste directo</small>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/70 py-1.5 pr-1.5 pl-3">
                <span className="flex items-center gap-2">
                    <SwitchAction id={`tpl-${template.id}-active`} templateId={template.id} actionField="active" checked={template.active} badge={false} />
                    <label htmlFor={`tpl-${template.id}-active`} className="cursor-pointer text-[11.5px] font-semibold text-muted-foreground">{template.active ? 'Encendida' : 'Apagada'}</label>
                </span>
                <TemplateMenu template={template} />
            </div>
        </article>
    )
}

export default TemplateTile
