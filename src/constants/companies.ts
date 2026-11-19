/**
 * Las empresas de venta directa con las que trabaja Eyplease+, y lo ÚNICO del panel que decide qué es de cada una.
 *
 * Hasta noviembre de 2026 todo era Mary Kay; desde el 18-nov también hay clientas de Zermat. Es el espejo de
 * `App\Support\Companies` en la API: las pantallas no preguntan «¿es Zermat?», preguntan si su empresa tiene un bloque
 * (`companyHas(company, 'portal')`). Una empresa nueva es una entrada más en `COMPANIES`, con sus bloques en «no»
 * hasta que alguien los encienda aquí a propósito.
 */
export type Company = 'mary_kay' | 'zermat'

export const DEFAULT_COMPANY: Company = 'mary_kay'

/**
 * Los bloques del panel que dependen de la empresa:
 * - `portal`: usuario y contraseña de su portal (InTouch); con ella el robot baja sus reportes del mes.
 * - `network_excel`: «Actualizar red» con el Excel de su unidad que sale de InTouch.
 * - `render`: «Generar lo suyo»: el motor arma sus piezas con las plantillas.
 * - `pink_circle`: Círculo Rosa (corazones, regalo), programa de Mary Kay.
 * - `manual`: «Su grupo y sus piezas»: su grupo se carga con un CSV y sus piezas se suben terminadas, a mano.
 */
export type CompanyBlock = 'portal' | 'network_excel' | 'render' | 'pink_circle' | 'manual'

export interface CompanyOption {
    key: string
    label: string
}

export interface CompanyInfo {
    value: Company
    label: string
    /** Para donde no cabe el nombre */
    short: string
    blocks: Record<CompanyBlock, boolean>
    /** El prefijo con que la API guarda el número de cuenta (Mary Kay, ninguno) */
    accountPrefix: string
    /** Sus rangos, de menor a mayor (`rank_key` de la API) */
    ranks: CompanyOption[]
    /** Las secciones de piezas que se suben a mano (`section_key` de la API) */
    pieceSections: CompanyOption[]
}

export const COMPANIES: CompanyInfo[] = [
    {
        value: 'mary_kay',
        label: 'Mary Kay',
        short: 'MK',
        blocks: { portal: true, network_excel: true, render: true, pink_circle: true, manual: false },
        accountPrefix: '',
        ranks: [],
        pieceSections: [],
    },
    {
        value: 'zermat',
        label: 'Zermat',
        short: 'ZM',
        blocks: { portal: false, network_excel: false, render: false, pink_circle: false, manual: true },
        accountPrefix: 'ZM-',
        ranks: [
            { key: 'zermat_emprendedor', label: 'Emprendedor' },
            { key: 'zermat_perla', label: 'Perla' },
            { key: 'zermat_amatista', label: 'Amatista' },
            { key: 'zermat_jade', label: 'Jade' },
            { key: 'zermat_turquesa', label: 'Turquesa' },
            { key: 'zermat_zafiro', label: 'Zafiro' },
            { key: 'zermat_rubi', label: 'Rubí' },
            { key: 'zermat_esmeralda', label: 'Esmeralda' },
            { key: 'zermat_diamante', label: 'Diamante' },
        ],
        pieceSections: [
            { key: 'zermat_welcome', label: 'Bienvenida' },
            { key: 'zermat_birthdays', label: 'Cumpleaños' },
            { key: 'zermat_comeback', label: 'Te extrañamos' },
            { key: 'zermat_rank_up', label: 'Ascenso' },
        ],
    },
]

export const COMPANY_KEYS = COMPANIES.map(item => item.value) as [Company, ...Company[]]

/** La empresa de lo que sea que la traiga (una clienta, un plan, una fila). Sin ella, o una que no conocemos: Mary Kay, que es lo que eran todas antes. */
export const companyOf = (value?: string | { company?: string | null } | null): Company => {
    const raw = typeof value === 'string' ? value : value?.company
    return COMPANIES.some(item => item.value === raw) ? raw as Company : DEFAULT_COMPANY
}

export const companyInfo = (company: Company): CompanyInfo =>
    COMPANIES.find(item => item.value === company) ?? COMPANIES[0]

/** ¿Este bloque del panel aplica a esa empresa? */
export const companyHas = (company: Company, block: CompanyBlock): boolean => companyInfo(company).blocks[block]

/** Lo de otra empresa se marca con su nombre; lo de Mary Kay no lleva etiqueta (no ensucia lo de siempre). */
export const isDefaultCompany = (company: Company) => company === DEFAULT_COMPANY

/**
 * El número como lo guardará la API: con el prefijo de su empresa aunque lo tecleen sin él («123» y «zm-123» → «ZM-123»).
 * Igual que `Companies::codeFor` en la API.
 */
export const accountFor = (company: Company, code: string): string => {
    const prefix = companyInfo(company).accountPrefix
    const trimmed = code.trim()
    if (!prefix) return trimmed
    return trimmed.toUpperCase().startsWith(prefix) ? prefix + trimmed.slice(prefix.length) : prefix + trimmed
}
