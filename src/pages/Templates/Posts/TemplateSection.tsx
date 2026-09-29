import { useMemo } from "react"

import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { INewsletterSectionItem } from "@/interfaces/common"
import { ITemplate } from "@/interfaces/templates"
import { queryKeys } from "@/utils/queryKeys"
import { TEMPLATE_GROUP_REPORTS } from "../page-utils"
import { formatsOf, POST_FORMATS, SectionInfo } from "./lib"
import TemplateTile from "./TemplateTile"

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Cumpleaños de clientas y las de boletín no tienen subgrupos que pedir */
const WITHOUT_ITEMS = ['customers-birthdays', ...TEMPLATE_GROUP_REPORTS]

/**
 * Una sección con sus plantillas. El subgrupo sale con el nombre que le da el boletín («En curso · Reina»,
 * «2da Herramienta») y no con su llave técnica; la lista es la misma que usa el formulario, así que se pide
 * una vez por sección y se comparte. Si un subgrupo no está en esa lista, se enseña su llave tal cual.
 *
 * La tarjeta mide lo que sus plantillas: las secciones chicas se acomodan una junto a otra y las grandes
 * ocupan todo el ancho. El encabezado no cuenta para ese ancho (`w-0 min-w-full`): se acomoda al de ellas.
 */
const TemplateSection = ({ info, items, showMonth }: { info: SectionInfo, items: ITemplate[], showMonth: boolean }) => {
    const { response } = useFetchQuery<INewsletterSectionItem[]>(
        API_ROUTES.GET_NEWSLETTER_SECTION_ITEMS.replace('{sectionKey}', info.key),
        {
            customQueryKey: queryKeys.list('newsletter_section_items', { section: info.key }),
            enabled: !WITHOUT_ITEMS.includes(info.key),
            staleTime: 10 * 60_000,
        },
    )
    const names = useMemo(() => new Map((Array.isArray(response) ? response : []).map(item => [item.item_key, item.name])), [response])

    const off = items.filter(template => !template.active).length
    const formats = POST_FORMATS
        .map(item => ({ ...item, count: items.filter(template => formatsOf(template).includes(item.key)).length }))
        .filter(item => item.count > 0)

    return (
        <section className="shell-glass max-w-full min-w-0 rounded-3xl p-4 sm:p-5">
            <header className="mb-3.5 flex w-0 min-w-full flex-wrap items-end justify-between gap-x-4 gap-y-1.5">
                <div className="min-w-0">
                    {info.newsletter && <small className="block text-[10.5px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">{info.newsletter}</small>}
                    <h2 className="text-[16px] leading-tight font-extrabold tracking-tight">{info.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="pulse-tag plain">{plural(items.length, 'plantilla', 'plantillas')}</span>
                    {off > 0 && <span className="pulse-tag warn">{plural(off, 'apagada', 'apagadas')}</span>}
                    {formats.length > 0 && <small className="text-[11.5px] text-muted-foreground">{formats.map(item => `${item.count} ${item.count === 1 ? item.label.toLowerCase() : item.plural}`).join(' · ')}</small>}
                </div>
            </header>
            <div className="flex flex-wrap gap-3">
                {items.map(template => (
                    <TemplateTile
                        key={template.id}
                        template={template}
                        showMonth={showMonth}
                        subgroup={template.template_subgroup ? names.get(template.template_subgroup) ?? template.template_subgroup : null}
                    />
                ))}
            </div>
        </section>
    )
}

export default TemplateSection
