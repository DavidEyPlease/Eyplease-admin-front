import { accountFor, Company, companyInfo } from "@/constants/companies";

/** Una persona de su grupo como la recibe `POST clients/{id}/company-roster` */
export interface RosterPerson {
    code: string
    name: string
    dob?: string
    start_date?: string
    last_order_date?: string
    status?: string
    rank_key?: string
    phone?: string
    gender?: 'female' | 'male'
}

export interface RosterPayload {
    leader_rank_key?: string
    deactivate_missing?: boolean
    people: RosterPerson[]
}

export interface RosterResult {
    created: number
    updated: number
    deactivated: number
    rank_ups: Array<{ code: string, name: string, from: string | null, to: string | null }>
}

/** Las columnas del CSV, en el orden en que se piden. `rank` va con el nombre visible («Perla») o la llave (`zermat_perla`). */
export const ROSTER_COLUMNS = ['code', 'name', 'dob', 'start_date', 'last_order_date', 'status', 'rank', 'phone', 'gender'] as const
type Column = typeof ROSTER_COLUMNS[number]

/** Lo que la API acepta de una vez */
export const ROSTER_MAX_PEOPLE = 2000

export interface RosterParse {
    people: RosterPerson[]
    /** Renglón del archivo (contando el encabezado como el 1) y qué tiene mal */
    errors: Array<{ line: number, message: string }>
    /** Faltan `code` o `name` en el encabezado: no se puede leer nada */
    missingColumns: Column[]
}

/** «Rubí», «rubi», «RUBÍ» y «zermat_rubi» son lo mismo */
const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/** Coma, punto y coma o tabulador: el que más aparezca en el encabezado (Excel en español guarda con «;») */
const delimiterOf = (header: string) => {
    const counts = [',', ';', '\t'].map(char => [char, header.split(char).length - 1] as const)
    return counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ','
}

/** CSV con comillas («"Pérez, Ana"») y comillas dobladas adentro. Regresa los renglones con su número en el archivo. */
const parseCsv = (text: string): Array<{ line: number, cells: string[] }> => {
    const source = text.replace(/^\uFEFF/, '')
    const delimiter = delimiterOf(source.split(/\r?\n/, 1)[0] ?? '')
    const rows: Array<{ line: number, cells: string[] }> = []
    let cells: string[] = []
    let cell = ''
    let quoted = false
    let line = 1
    let rowLine = 1

    const endRow = () => {
        cells.push(cell)
        if (cells.some(value => value.trim() !== '')) rows.push({ line: rowLine, cells })
        cells = []
        cell = ''
    }

    for (let index = 0; index < source.length; index++) {
        const char = source[index]
        if (quoted) {
            if (char === '"' && source[index + 1] === '"') { cell += '"'; index++ }
            else if (char === '"') quoted = false
            else { if (char === '\n') line++; cell += char }
            continue
        }
        if (char === '"' && cell.trim() === '') { cell = ''; quoted = true }
        else if (char === delimiter) { cells.push(cell); cell = '' }
        else if (char === '\n' || char === '\r') {
            if (char === '\r' && source[index + 1] === '\n') index++
            endRow()
            line++
            rowLine = line
        }
        else cell += char
    }
    endRow()
    return rows
}

/** «2026-02-27» o «27/02/2026» (como lo guarda Excel en México) → «2026-02-27»; null si no es una fecha de verdad */
const toDate = (value: string): string | null => {
    let year: number, month: number, day: number
    const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    const local = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (iso) [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    else if (local) [year, month, day] = [Number(local[3]), Number(local[2]), Number(local[1])]
    else return null
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const GENDERS: Record<string, 'female' | 'male'> = { female: 'female', f: 'female', male: 'male', m: 'male' }

/**
 * Lee el grupo pegado o subido: encabezado con las columnas de `ROSTER_COLUMNS` (`code` y `name` obligatorias; las
 * demás, opcionales y en cualquier orden) y una persona por renglón. Revisa lo básico antes de mandarlo: código y
 * nombre, fechas, rango de su empresa, género y códigos repetidos. Lo demás lo decide la API.
 */
export const parseRoster = (text: string, company: Company): RosterParse => {
    const rows = parseCsv(text)
    if (!rows.length) return { people: [], errors: [], missingColumns: [] }

    const header = rows[0].cells.map(cell => plain(cell).replace(/\s+/g, '_'))
    const at = (column: Column) => header.indexOf(column === 'rank' && !header.includes('rank') ? 'rank_key' : column)
    const missingColumns = (['code', 'name'] as Column[]).filter(column => at(column) === -1)
    if (missingColumns.length) return { people: [], errors: [], missingColumns }

    const ranks = companyInfo(company).ranks
    const rankKey = (value: string) => ranks.find(rank => plain(rank.key) === plain(value) || plain(rank.label) === plain(value))?.key

    const people: RosterPerson[] = []
    const errors: RosterParse['errors'] = []
    const seen = new Map<string, number>()

    rows.slice(1).forEach(({ line, cells }) => {
        const get = (column: Column) => {
            const index = at(column)
            return index === -1 ? '' : (cells[index] ?? '').trim()
        }
        const problems: string[] = []
        const person: RosterPerson = { code: get('code'), name: get('name') }

        if (!person.code) problems.push('sin código')
        if (!person.name) problems.push('sin nombre')
        if (person.code) {
            /* «777» y «ZM-777» son la misma persona: la API les pone el prefijo a las dos */
            const code = plain(accountFor(company, person.code))
            const first = seen.get(code)
            if (first) problems.push(`código repetido (ya viene en el renglón ${first})`)
            else seen.set(code, line)
        }

        for (const column of ['dob', 'start_date', 'last_order_date'] as const) {
            const value = get(column)
            if (!value) continue
            const date = toDate(value)
            if (date) person[column] = date
            else problems.push(`${column}: «${value}» no es una fecha (AAAA-MM-DD o DD/MM/AAAA)`)
        }

        const rank = get('rank')
        if (rank) {
            const key = rankKey(rank)
            if (key) person.rank_key = key
            else problems.push(`rango «${rank}» no es de ${companyInfo(company).label}`)
        }

        const gender = get('gender')
        if (gender) {
            const value = GENDERS[plain(gender)]
            if (value) person.gender = value
            else problems.push(`gender «${gender}»: usa female o male`)
        }

        const status = get('status')
        if (status) person.status = status
        const phone = get('phone')
        if (phone) person.phone = phone

        if (problems.length) errors.push({ line, message: problems.join(' · ') })
        else people.push(person)
    })

    if (people.length + errors.length > ROSTER_MAX_PEOPLE) {
        errors.unshift({ line: 1, message: `Son ${people.length + errors.length} personas: la API acepta hasta ${ROSTER_MAX_PEOPLE} de una vez` })
    }

    return { people, errors, missingColumns: [] }
}
