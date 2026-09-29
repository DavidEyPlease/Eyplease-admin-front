import { useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { ImagesIcon, PlusIcon, RotateCcwIcon, SearchIcon, XIcon } from "lucide-react"

import { countryInfo } from "@/constants/countries"
import { ITemplate } from "@/interfaces/templates"
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/auth"
import useCountryStore from "@/store/country"
import { MONTH_LABELS } from "@/utils/finance"
import TemplateDialogs from "../components/TemplateDialogs"
import { byName, countryOf, formatsOf, monthsInOrder, plain, PostFormat, POST_FORMATS, sectionCatalog, SectionInfo } from "./lib"
import NewTemplateDialog from "./NewTemplateDialog"
import TemplateTile from "./TemplateTile"
import usePostTemplates from "./usePostTemplates"
import "@/pages/Hoy/hoy.css"

type Status = 'all' | 'on' | 'off'

const STATUS: Array<{ key: Status, label: string }> = [
    { key: 'all', label: 'Todas' },
    { key: 'on', label: 'Encendidas' },
    { key: 'off', label: 'Apagadas' },
]

const chip = (on: boolean) => cn(
    'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors disabled:cursor-default disabled:opacity-40',
    on ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/60 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground',
)

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const TileSkeleton = () => (
    <div className="overflow-hidden rounded-[20px] border border-border/70 bg-card/60">
        <span className="block aspect-[9/16] animate-pulse bg-foreground/[.07]" />
        <span className="m-3 block h-3 w-3/4 animate-pulse rounded-full bg-foreground/[.07]" />
        <span className="mx-3 mb-3 block h-2.5 w-1/2 animate-pulse rounded-full bg-foreground/[.05]" />
    </div>
)

const TILES = "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3"

/**
 * Plantillas de publicaciones con la piel del rediseño: el arte que usa el motor en cada sección, mes por
 * mes. Todo llega de una vez (usePostTemplates), así que cambiar de mes, buscar o filtrar no espera a la
 * API. El mes, la búsqueda y los filtros viven en la URL: al volver de la ficha, la pantalla sigue igual.
 * Lo que la pantalla vieja permitía hacer sigue aquí: crear, abrir la ficha para ajustar, ver el arte,
 * editar datos, clonar, repartir a clientas, eliminar y encender/apagar.
 */
const PostsTemplatesPage = () => {
    const { templates, loading, failed, retry } = usePostTemplates()
    const newsletters = useAuthStore(state => state.utilData.newsletters)
    const country = useCountryStore(state => state.country)
    const [params, setParams] = useSearchParams()
    const [creating, setCreating] = useState(false)

    const current = new Date().getMonth() + 1
    const upcoming = current % 12 + 1
    const query = params.get('q') ?? ''
    const status = (['on', 'off'].includes(params.get('estado') ?? '') ? params.get('estado') : 'all') as Status
    const format = POST_FORMATS.some(item => item.key === params.get('formato')) ? params.get('formato') as PostFormat : null

    const setParam = (changes: Record<string, string | null>) => setParams(previous => {
        const next = new URLSearchParams(previous)
        Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
        return next
    }, { replace: true })

    const sectionOf = useMemo(() => sectionCatalog(newsletters ?? []), [newsletters])

    /* Sólo las del país que se mira arriba: las de Colombia llevan `metadata.country` */
    const mine = useMemo(() => templates.filter(template => countryOf(template) === country), [templates, country])

    /* Siempre están el mes en curso y el que viene, aunque aún no tengan plantillas: así se ve qué falta preparar */
    const months = useMemo(() => monthsInOrder([...mine.map(template => template.month), current, upcoming], current), [mine, current, upcoming])
    const perMonth = useMemo(() => {
        const counts = new Map<number, number>()
        mine.forEach(template => counts.set(template.month, (counts.get(template.month) ?? 0) + 1))
        return counts
    }, [mine])
    const asked = Number(params.get('mes'))
    const month = months.includes(asked) ? asked : perMonth.get(current) ? current : [...months].reverse().find(item => perMonth.get(item)) ?? current

    /* Buscar recorre TODOS los meses: casi siempre se busca una plantilla sin saber en qué mes vive */
    const searching = query.trim().length > 0
    const inScope = useMemo(() => {
        if (!searching) return mine.filter(template => template.month === month)
        const needle = plain(query.trim())
        return mine.filter(template => plain(`${template.name} ${sectionOf(template.template_group).name} ${template.template_subgroup ?? ''}`).includes(needle))
    }, [mine, month, searching, query, sectionOf])

    const counts = useMemo(() => ({
        all: inScope.length,
        on: inScope.filter(template => template.active).length,
        off: inScope.filter(template => !template.active).length,
        formats: Object.fromEntries(POST_FORMATS.map(item => [item.key, inScope.filter(template => formatsOf(template).includes(item.key)).length])) as Record<PostFormat, number>,
    }), [inScope])

    const groups = useMemo(() => {
        const shown = inScope.filter(template => (status === 'all' || (status === 'on') === template.active) && (!format || formatsOf(template).includes(format)))
        const bySection = new Map<string, { info: SectionInfo, items: ITemplate[] }>()
        shown.forEach(template => {
            const info = sectionOf(template.template_group)
            const group = bySection.get(info.key) ?? { info, items: [] }
            group.items.push(template)
            bySection.set(info.key, group)
        })
        /* Encendidas primero; dentro, por nombre con los números en orden («Mes 6» antes que «Mes 10») */
        return [...bySection.values()]
            .map(group => ({ ...group, items: [...group.items].sort((a, b) => Number(b.active) - Number(a.active) || byName(a, b)) }))
            .sort((a, b) => a.info.order - b.info.order || a.info.name.localeCompare(b.info.name, 'es'))
    }, [inScope, status, format, sectionOf])

    const shownCount = groups.reduce((sum, group) => sum + group.items.length, 0)
    const filtered = status !== 'all' || !!format
    const monthName = MONTH_LABELS[month - 1] ?? ''
    const lastWithTemplates = [...months].reverse().find(item => item !== month && perMonth.get(item))

    const verdict = searching
        ? `${plural(shownCount, 'resultado', 'resultados')}`
        : counts.all === 0 ? 'todavía ninguna' : `${counts.on} ${counts.on === 1 ? 'encendida' : 'encendidas'}`

    const newButton = (
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B47E0] to-[#6C47FF] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(91,71,224,.8)] transition-opacity hover:opacity-95">
            <PlusIcon className="size-4" /> Nueva plantilla
        </button>
    )

    return (
        <div className="grid w-full min-w-0 grid-cols-1 gap-[18px]">
            {isNewShell() ? (
                <PageHead
                    eyebrow={country === 'MEX' ? 'Contenido · Plantillas' : `Contenido · Plantillas · ${countryInfo(country).label}`}
                    title={searching ? <>Buscando «{query.trim()}». <em>{verdict}</em></> : <>Plantillas de {monthName.toLowerCase()}. <em>{verdict}</em></>}
                    sub="El arte que usa el motor en cada sección, con sus formatos y si está encendida. Para preparar otro mes, abre el menú de una plantilla y clónala."
                >
                    {newButton}
                </PageHead>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ backgroundImage: 'linear-gradient(180deg,#5B47E0,#5DD9D2)' }} />
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Plantillas de {monthName.toLowerCase()} · {verdict}</h1>
                    </div>
                    {newButton}
                </div>
            )}

            {/* Los meses, del más viejo al que viene. Buscar recorre todos: elegir un mes limpia la búsqueda */}
            <div className={cn('flex gap-1.5 overflow-x-auto pb-0.5', searching && 'opacity-60')}>
                {months.map(item => (
                    <button key={item} type="button" className={chip(!searching && item === month)} onClick={() => setParam({ mes: String(item), q: null })}>
                        {MONTH_LABELS[item - 1]}
                        <b className="text-[11px] font-extrabold opacity-70 tabular-nums">{perMonth.get(item) ?? 0}</b>
                        {item === current && <i className="size-1.5 rounded-full bg-emerald-500" title="Mes en curso" />}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] sm:max-w-[340px]">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <input value={query} onChange={event => setParam({ q: event.target.value || null })} placeholder="Buscar en todos los meses…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
                    {searching && <button type="button" onClick={() => setParam({ q: null })} aria-label="Limpiar la búsqueda" className="grid size-6 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><XIcon className="size-3.5" /></button>}
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {STATUS.map(item => (
                        <button key={item.key} type="button" className={chip(status === item.key)} onClick={() => setParam({ estado: item.key === 'all' ? null : item.key })} disabled={item.key !== 'all' && counts[item.key] === 0 && status !== item.key}>
                            {item.label} <b className="text-[11px] font-extrabold opacity-70 tabular-nums">{counts[item.key]}</b>
                        </button>
                    ))}
                    <span className="mx-1 hidden h-8 w-px bg-border sm:block" />
                    {POST_FORMATS.map(item => (
                        <button key={item.key} type="button" className={chip(format === item.key)} onClick={() => setParam({ formato: format === item.key ? null : item.key })} disabled={counts.formats[item.key] === 0 && format !== item.key}>
                            {item.label} <b className="text-[11px] font-extrabold opacity-70 tabular-nums">{counts.formats[item.key]}</b>
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <section className="shell-glass rounded-3xl p-4 sm:p-5">
                    <span className="mb-4 block h-4 w-40 animate-pulse rounded-full bg-foreground/[.07]" />
                    <div className={TILES}>{Array.from({ length: 6 }, (_, index) => <TileSkeleton key={index} />)}</div>
                </section>
            )}

            {!loading && failed && (
                <div className="shell-glass grid place-items-center gap-2 rounded-3xl px-6 py-12 text-center">
                    <b className="text-[15px]">No se pudieron cargar las plantillas</b>
                    <p className="text-[12.5px] text-muted-foreground">Revisa la conexión e inténtalo de nuevo.</p>
                    <button type="button" onClick={() => retry()} className="mt-1 inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border px-3.5 text-[13px] font-bold hover:bg-foreground/5"><RotateCcwIcon className="size-4" />Reintentar</button>
                </div>
            )}

            {!loading && !failed && shownCount === 0 && (
                <div className="shell-glass grid place-items-center gap-2 rounded-3xl px-6 py-12 text-center">
                    <ImagesIcon className="size-7 text-primary" />
                    {filtered ? (
                        <>
                            <b className="text-[15px]">Ninguna con ese filtro</b>
                            <button type="button" onClick={() => setParam({ estado: null, formato: null })} className="text-[12.5px] font-bold text-primary hover:underline">Quitar los filtros</button>
                        </>
                    ) : searching ? (
                        <>
                            <b className="text-[15px]">Ninguna plantilla se llama así</b>
                            <p className="text-[12.5px] text-muted-foreground">Busca por nombre, por sección («Círculo Rosa») o por subgrupo («gold»).</p>
                        </>
                    ) : (
                        <>
                            <b className="text-[15px]">Todavía no hay plantillas de {monthName.toLowerCase()}</b>
                            <p className="max-w-[52ch] text-[12.5px] text-muted-foreground">Para prepararlo, abre el menú de una plantilla de otro mes y elige «Clonar para otro mes», o crea una nueva.</p>
                            {lastWithTemplates && <button type="button" onClick={() => setParam({ mes: String(lastWithTemplates) })} className="text-[12.5px] font-bold text-primary hover:underline">Ver las de {MONTH_LABELS[lastWithTemplates - 1]?.toLowerCase()}</button>}
                        </>
                    )}
                </div>
            )}

            {!loading && groups.map(group => {
                const off = group.items.filter(template => !template.active).length
                const formats = POST_FORMATS
                    .map(item => ({ ...item, count: group.items.filter(template => formatsOf(template).includes(item.key)).length }))
                    .filter(item => item.count > 0)

                return (
                    <section key={group.info.key} className="shell-glass min-w-0 rounded-3xl p-4 sm:p-5">
                        <header className="mb-3.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                            <div className="min-w-0">
                                {group.info.newsletter && <small className="block text-[10.5px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">{group.info.newsletter}</small>}
                                <h2 className="text-[16px] font-extrabold tracking-tight">{group.info.name}</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="pulse-tag plain">{plural(group.items.length, 'plantilla', 'plantillas')}</span>
                                {off > 0 && <span className="pulse-tag warn">{plural(off, 'apagada', 'apagadas')}</span>}
                                {formats.length > 0 && <small className="text-[11.5px] text-muted-foreground">{formats.map(item => `${item.count} ${item.count === 1 ? item.label.toLowerCase() : item.plural}`).join(' · ')}</small>}
                            </div>
                        </header>
                        <div className={TILES}>
                            {group.items.map(template => <TemplateTile key={template.id} template={template} showMonth={searching} />)}
                        </div>
                    </section>
                )
            })}

            <TemplateDialogs />
            <NewTemplateDialog open={creating} onClose={() => setCreating(false)} />
        </div>
    )
}

export default PostsTemplatesPage
