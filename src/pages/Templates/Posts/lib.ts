import { INewsletter } from "@/interfaces/common"
import { ITemplate } from "@/interfaces/templates"
import { Country } from "@/constants/countries"
import { fillConfigOf, isVideoUrl } from "../page-utils"

/** Los tres formatos en que sale una publicación, con el nombre que les da el motor */
export type PostFormat = 'image' | 'image_square' | 'video'

export const POST_FORMATS: Array<{ key: PostFormat, label: string, plural: string }> = [
    { key: 'image', label: 'Vertical', plural: 'verticales' },
    { key: 'image_square', label: 'Cuadrada', plural: 'cuadradas' },
    { key: 'video', label: 'Video', plural: 'videos' },
]

/** Los formatos que tiene encendidos. Las más viejas no tienen variantes: sólo dicen su tipo en `template_asset_type` */
export const formatsOf = (template: ITemplate): PostFormat[] => {
    const enabled = (template.variants ?? []).filter(variant => variant.enabled)
    if (enabled.length) return POST_FORMATS.map(format => format.key).filter(key => enabled.some(variant => variant.kind === key))
    if (template.template_asset_type === 'video') return ['video']
    return template.template_asset_type === 'image' ? ['image'] : []
}

/** Alguna de sus variantes encendidas sale «con base»: el servidor llena la base con la foto y los nombres */
export const usesBase = (template: ITemplate) => (template.variants ?? []).some(variant => variant.enabled && fillConfigOf(variant))

/**
 * La imagen que la representa: la vertical, que es la pieza principal; si no tiene, la cuadrada; y si sólo
 * es video, el video (se ve su primer cuadro). El `template_file_url` suelto de la plantilla a veces apunta
 * a una carpeta y no a un archivo, así que sólo se usa en las viejas, que no tienen variantes. En las que
 * van con base, el archivo de la variante es la base: se ve el diseño sin persona.
 */
export const thumbOf = (template: ITemplate): { url: string | null, kind: 'image' | 'square' | 'video' | null } => {
    const withFile = (template.variants ?? []).filter(variant => variant.enabled && variant.template_file_url)
    const pick = (kind: string) => withFile.find(variant => variant.kind === kind)?.template_file_url ?? null

    const vertical = pick('image')
    if (vertical) return { url: vertical, kind: 'image' }
    const square = pick('image_square')
    if (square) return { url: square, kind: 'square' }
    const video = pick('video')
    if (video) return { url: video, kind: 'video' }

    const legacy = !template.variants?.length ? template.template_file_url : null
    if (!legacy) return { url: null, kind: null }
    return { url: legacy, kind: isVideoUrl(legacy) ? 'video' : 'image' }
}

/** De qué país es: las de México no llevan país; las demás lo dicen en `metadata.country` */
export const countryOf = (template: ITemplate): Country => (template.metadata?.country ?? 'MEX').toUpperCase() === 'COL' ? 'COL' : 'MEX'

export interface SectionInfo {
    key: string
    name: string
    /** El boletín al que pertenece («Boletín Unidad», «Boletín Nacional»); null si no es de un boletín */
    newsletter: string | null
    order: number
}

/** Para las que no vienen en util-data (Cumpleaños de clientas no es sección de boletín) o por si falta alguna */
const FALLBACK_NAMES: Record<string, string> = {
    'customers-birthdays': 'Cumpleaños de sus clientas',
    honor_roll: 'Cuadro de Honor',
    honor_roll_national: 'Cuadro de Honor Nacional',
    stars: 'Estrellas',
    pink_circle: 'Círculo Rosa',
    new_beginnings: 'Nuevos Inicios',
    road_to_success: 'Camino al Éxito',
    target_unit_club: 'Corte de Unit Club',
    early: 'Tempraneras',
    sales_cut: 'Corte de ventas',
    national_initiation_cut: 'Corte de iniciación',
    birthdays: 'Cumpleaños',
    anniversaries: 'Aniversarios',
    national_birthdays: 'Cumpleaños',
    national_anniversaries: 'Aniversarios',
}

const prettify = (key: string) => {
    const text = key.replace(/[_-]+/g, ' ').trim()
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Nombre, boletín y orden de cada sección, como los trae util-data (el mismo orden del boletín) */
export const sectionCatalog = (newsletters: INewsletter[]) => {
    const catalog = new Map<string, SectionInfo>()
    newsletters.forEach((newsletter, n) => (newsletter.sections ?? []).forEach((section, s) => {
        if (!catalog.has(section.sectionKey)) catalog.set(section.sectionKey, { key: section.sectionKey, name: section.name, newsletter: newsletter.name, order: n * 100 + s })
    }))

    return (key: string): SectionInfo => catalog.get(key) ?? {
        key,
        name: FALLBACK_NAMES[key] ?? prettify(key),
        newsletter: key === 'customers-birthdays' ? 'Mis clientas' : null,
        order: key === 'customers-birthdays' ? 1_000 : 2_000,
    }
}

/**
 * Los meses se leen en orden de calendario alrededor de hoy: las plantillas no llevan año, así que el mes
 * que viene es el más nuevo y todo lo demás cuenta como pasado (en septiembre: may, jun, jul, ago, sep, oct).
 */
export const monthsInOrder = (months: number[], current: number) => {
    const age = (month: number) => (current + 1 - month + 12) % 12
    return [...new Set(months)].sort((a, b) => age(b) - age(a))
}

/** Para buscar sin que importen acentos ni mayúsculas */
export const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('es-MX')

/** Por nombre, con los números en su orden natural: «Mes 6» antes que «Mes 10» */
export const byName = (a: ITemplate, b: ITemplate) => a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' })
