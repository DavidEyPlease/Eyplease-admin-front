import { APP_ROUTES } from '@/constants/app'
import { DownloadRun } from '@/pages/Reports/useReports'
import { dailyDone, dailyMissing } from '@/utils/dailyReports'
import { clock, dayKey, isToday } from './lib'

/**
 * La torre por CAUSAS, no por corridas (David, 4-nov-2026: «es una imagen saturada que nada me dice: reintento,
 * reintento, descarga… no tengo idea qué pasó»). Ese día una sola contraseña cambiada (035197) salía como 13 renglones:
 * cada descarga, cada reintento y cada reporte con «falta 1». Aquí se juntan las fallas del robot por clienta y por
 * motivo, se dice en palabras qué pasó, qué reportes no bajaron y qué hacer; lo que se arregló solo va aparte.
 */

export type ProblemTone = 'bad' | 'warn'

export interface PulseProblem {
    id: string
    tone: ProblemTone
    tag: string
    title: string
    /** Qué pasó, en palabras */
    what: string
    /** Qué hacer (si hay algo que hacer) */
    todo?: string
    actions?: Array<{ label: string, to: string }>
}

/** Lo que falló hoy y ya no pide nada (se arregló solo, ya entra, no es un reporte): aparte, sin contar como pendiente. */
export interface PulseResolved {
    id: string
    text: string
}

/** Una persona del robot: su nombre y el id de su ficha (si ya se sabe). */
export interface RobotPerson {
    name: string
    clientId?: string
}

/** Una cuenta que hoy no tiene su reporte (lo manda la API; `rejected`: bajó pero el import lo rechazó). */
export interface MissingAccount {
    account: string
    name: string
    rejected?: boolean
}

interface DailyReportLike {
    section_key: string
    name: string
    usual: number
    loaded: number
    empty?: number
    last_at: string | null
    /** Quién falta hoy. Si no viene (API vieja u otro día), la torre sólo cuenta. */
    missing?: MissingAccount[] | null
}

/** Por qué le falta a cada quien su reporte del día */
export interface Explanation {
    account: string
    name: string
    label: string
}

type Failure = { account: string, reportKey?: string, error?: string, category?: string }

/* El robot nombra cada archivo por su `reportKey`; la sección del robot (`run.sections`) y la del reporte diario de la
   API no siempre se llaman igual (ver `src/daily/daily-section.registry.ts` del robot). */
const ROBOT_SECTION_OF: Record<string, string> = { daily_sales: 'sales', initiators: 'initiators_live', national_monthly_personal_sales: 'national_sales_live' }
const DAILY_SECTION_OF: Record<string, string> = { daily_sales: 'early', sales: 'early', initiators: 'initiators_live', national_monthly_personal_sales: 'national_sales_live' }

/** Nombre de cada reporte o sección del robot, como lo dice David. */
export const REPORT_NAME: Record<string, string> = {
    early: 'Tempraneras', sales: 'Tempraneras', daily_sales: 'Tempraneras',
    pink_circle_hearts: 'Corazones de Círculo Rosa', pink_circle_vip_plus: 'Círculo Rosa VIP Plus',
    initiators: 'Iniciadoras al día', initiators_live: 'Iniciadoras al día',
    national_monthly_personal_sales: 'Ventas del Área al día', national_sales_live: 'Ventas del Área al día',
    area_recognition_live: 'Producción del Área al día', area_recognition: 'Reconocimiento de Área',
    consultant_orders: 'Órdenes de consultoras', consultant_orders_self: 'Órdenes propias de consultoras',
    career_levels: 'Nivel de carrera', production_goal: 'Metas del reto de producción',
    birthdays: 'Cumpleaños', anniversaries: 'Aniversarios', national_birthdays: 'Cumpleaños del Área', national_anniversaries: 'Aniversarios del Área',
}

const reportName = (key: string, reports: DailyReportLike[]) =>
    reports.find(report => report.section_key === (DAILY_SECTION_OF[key] ?? key))?.name ?? REPORT_NAME[key] ?? key

/** El robot entra con su login de Mary Kay («014174_david»); la clienta es la cuenta de antes del guion bajo. */
export const baseAccount = (login: string) => login.split('_')[0]

type Cause = 'password' | 'portal' | 'view' | 'missing' | 'other'

const causeOf = (failure: Failure): Cause => {
    const text = `${failure.category ?? ''} ${failure.error ?? ''}`
    if (/credenciales|contraseñ/i.test(text)) return 'password'
    if (/vista_equivocada/i.test(text)) return 'view'
    if (/reporte_no_encontrado/i.test(text)) return 'missing'
    if (/timeout|waitFor|ETIMEDOUT|net::|navigation|Target closed/i.test(text)) return 'portal'
    return 'other'
}

const firstLine = (text?: string | null) => (text ?? '').split('\n')[0].trim().slice(0, 160)

/** «las 11:30», «ayer a las 23:00» o «el 3 nov a las 23:00» */
const whenText = (iso: string) => {
    const date = new Date(iso)
    if (isToday(iso)) return `las ${clock(iso)}`
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (dayKey(date) === dayKey(yesterday)) return `ayer a las ${clock(iso)}`
    return `el ${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} a las ${clock(iso)}`
}

const listText = (items: string[]) => items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
const times = (n: number) => n === 1 ? '1 vez' : `${n} veces`

const runTime = (run: DownloadRun) => run.finished_at ?? run.queued_at ?? ''
const runDone = (run: DownloadRun) => run.status !== 'queued' && run.status !== 'running'
/** La API da las corridas de la más nueva a la más vieja: «la que sí salió» es la PRIMERA después de la falla. */
const earliest = (runs: DownloadRun[]) => [...runs].sort((a, b) => runTime(a).localeCompare(runTime(b)))[0] ?? null

const failuresOf = (run: DownloadRun): Failure[] => {
    const listed = (run.result?.failures ?? []) as Failure[]
    if (listed.length) return listed
    /* Corridas viejas sin detalle: si fallaron todas las que pidió, se sabe quiénes */
    if (run.clients?.length && (run.result?.failed ?? 0) >= run.clients.length) {
        return run.clients.flatMap(account => (run.sections ?? []).map(section => ({ account, reportKey: section })))
    }
    return []
}

/** ¿Una corrida POSTERIOR y terminada pidió ese reporte de esa cuenta y no lo volvió a fallar? */
const fetchedAfter = (failure: Failure, run: DownloadRun, runs: DownloadRun[]) => {
    const since = new Date(runTime(run)).getTime()
    const key = failure.reportKey ?? ''
    const section = ROBOT_SECTION_OF[key] ?? key
    const account = baseAccount(failure.account)
    return earliest(runs.filter(other => {
        if (other.run_id === run.run_id || other.status !== 'completed' || !other.finished_at) return false
        if (new Date(other.finished_at).getTime() <= since) return false
        const sections = other.sections ?? []
        if (key ? !sections.includes(section) && !sections.includes(key) : !(run.sections ?? []).every(item => sections.includes(item))) return false
        if (other.clients?.length && !other.clients.some(login => baseAccount(login) === account)) return false
        return !failuresOf(other).some(item => baseAccount(item.account) === account && (!key || !item.reportKey || item.reportKey === key))
    }))
}

interface Input {
    /** Todas las corridas que da la API (las de hoy y alguna de ayer, para saber desde cuándo) */
    runs: DownloadRun[]
    reports: DailyReportLike[]
    people: Record<string, RobotPerson>
}

export interface Diagnosis {
    problems: PulseProblem[]
    resolved: PulseResolved[]
    /** Por sección del reporte diario: quién falta y por qué (para que la tarjeta del reporte lo diga) */
    explained: Record<string, Explanation[]>
    /** Cuentas con fallas de hoy: a éstas se les busca el nombre */
    accounts: string[]
}

/** Lee las corridas del robot de hoy y dice qué pasó, por clienta y por motivo. */
export const diagnoseRobot = ({ runs, reports, people }: Input): Diagnosis => {
    const today = runs.filter(run => isToday(run.queued_at ?? run.finished_at))
    const done = today.filter(runDone)
    const reportOf = new Map(reports.map(report => [report.section_key, report]))
    /* El nombre: de su ficha o, si no, de la lista de quién falta que manda la API */
    const missingName = new Map(reports.flatMap(report => report.missing ?? []).map(item => [baseAccount(item.account), item.name]))
    const personName = (account: string) => people[account]?.name ?? missingName.get(account)
    const nameOf = (account: string) => personName(account) ?? `la cuenta ${account}`
    const who = (account: string) => personName(account) ? `${personName(account)} (${account})` : `La cuenta ${account}`

    const problems: PulseProblem[] = []
    const resolved: PulseResolved[] = []
    const explained: Record<string, Explanation[]> = {}
    const accounts = new Set<string>()

    /* 1. Corridas que se cayeron enteras (sin resultado). Si después salió otra de lo mismo, ya no es pendiente. */
    done.filter(run => run.status === 'failed' || run.status === 'rejected').forEach(run => {
        const names = listText((run.sections ?? []).map(key => reportName(key, reports))) || 'reportes'
        const later = earliest(done.filter(other => other.status === 'completed' && new Date(runTime(other)) > new Date(runTime(run))
            && (run.sections ?? []).every(key => (other.sections ?? []).includes(key))))
        if (later) {
            resolved.push({ id: `run-${run.run_id}`, text: `La descarga de ${names} de ${whenText(run.queued_at ?? runTime(run))} se cayó; la de ${whenText(runTime(later))} sí terminó.` })
            return
        }
        problems.push({
            id: `run-${run.run_id}`,
            tone: 'bad',
            tag: 'Robot',
            title: `La descarga de ${names} se cayó`,
            what: `Empezó a ${whenText(run.queued_at ?? runTime(run))} y no terminó${run.error ? `: «${firstLine(run.error)}»` : '.'}`,
            todo: 'Vuelve a lanzarla desde Reportes.',
            actions: [{ label: 'Ver corridas', to: APP_ROUTES.REPORTS.DASHBOARD }],
        })
    })

    /* 2. Cuentas que no bajaron: se juntan por clienta y motivo. Lo que una corrida posterior bajó, o lo que ya está
       completo en su reporte del día, se arregló solo. */
    type Open = { account: string, cause: Cause, keys: Set<string>, attempts: number, first: string, last: string, error?: string }
    const open = new Map<string, Open>()
    done.filter(run => run.status === 'completed').forEach(run => {
        failuresOf(run).forEach(failure => {
            const account = baseAccount(failure.account)
            const key = failure.reportKey ?? (run.sections ?? [])[0] ?? ''
            accounts.add(account)
            const later = fetchedAfter(failure, run, done)
            const report = reportOf.get(DAILY_SECTION_OF[key] ?? key)
            /* Si la API dice quién falta hoy en ese reporte y ella no está, ya lo tiene o ya no se le pide (el 4-nov, Rocío
               con «Producción del Área», que sólo tienen las Nacionales): no es aviso. */
            if (!later && report?.missing && !report.missing.some(item => baseAccount(item.account) === account)) return
            if (later || (report && dailyDone(report))) {
                const id = `ok-${account}-${key}`
                if (!resolved.some(item => item.id === id)) {
                    resolved.push({ id, text: `${nameOf(account)}: ${reportName(key, reports)} no bajó a ${whenText(runTime(run))}${later ? `; a ${whenText(runTime(later))} ya bajó` : '; el reporte ya está completo'}.` })
                }
                return
            }
            const cause = causeOf(failure)
            /* El nivel de carrera no es un reporte: si el portal no lo dice (a algunas Nacionales sólo les llega el código)
               o tarda, se queda el que ya tenía. Se cuenta, pero no es pendiente. La contraseña sí se queda abajo. */
            if (key === 'career_levels' && cause !== 'password') {
                const id = `lvl-${account}`
                if (!resolved.some(item => item.id === id)) {
                    resolved.push({ id, text: `${nameOf(account)}: no se pudo leer su nivel de carrera («${firstLine(failure.error) || 'sin detalle'}»); se queda con el que ya tenía.` })
                }
                return
            }
            const id = `${account}|${cause}`
            const item = open.get(id) ?? { account, cause, keys: new Set<string>(), attempts: 0, first: runTime(run), last: runTime(run), error: failure.error }
            item.keys.add(key)
            item.attempts += 1
            if (runTime(run) < item.first) item.first = runTime(run)
            if (runTime(run) > item.last) item.last = runTime(run)
            open.set(id, item)
        })
    })

    /* «Desde cuándo»: la falla más vieja del mismo motivo en las corridas que hay (incluye las de ayer) */
    const sinceOf = (account: string, cause: Cause, fallback: string) => runs
        .filter(run => runDone(run))
        .filter(run => failuresOf(run).some(failure => baseAccount(failure.account) === account && causeOf(failure) === cause))
        .map(runTime).filter(Boolean).sort()[0] ?? fallback

    /* ¿Una corrida POSTERIOR a la falla volvió a entrar a su InTouch? La pidió y no falló por contraseña (si falló por
       otra cosa, igual ya pasó del login). El 4-nov David capturó la contraseña nueva de 035197 a las 19:25 y la torre
       siguió diciendo «ya no funciona» hasta el día siguiente. */
    const loggedInAfter = (account: string, keys: Set<string>, since: string) => earliest(done.filter(run => {
        if (run.status !== 'completed' || runTime(run) <= since) return false
        const own = failuresOf(run).filter(failure => baseAccount(failure.account) === account)
        if (own.some(failure => causeOf(failure) === 'password')) return false
        if (run.clients?.length) return run.clients.some(login => baseAccount(login) === account)
        /* Sin lista de cuentas fue a todas las que tienen ese reporte: cuenta si es de lo que a ella le faltaba */
        return own.length > 0 || [...keys].some(key => (run.sections ?? []).includes(ROBOT_SECTION_OF[key] ?? key))
    }))

    const CAUSE_SHORT: Record<Cause, string> = { password: 'contraseña', portal: 'el portal no respondió', view: 'vista equivocada', missing: 'su portal no lo tiene', other: 'error del robot' }

    open.forEach(item => {
        const names = [...item.keys].map(key => reportName(key, reports))
        const uniqueNames = [...new Set(names)]
        const ficha = people[item.account]?.clientId
        const loginBack = item.cause === 'password' ? loggedInAfter(item.account, item.keys, item.last) : null
        ;[...item.keys].forEach(key => {
            const section = DAILY_SECTION_OF[key] ?? key
            const label = loginBack ? 'contraseña ya corregida, baja en la siguiente corrida' : CAUSE_SHORT[item.cause]
            if (!(explained[section] ?? []).some(entry => entry.account === item.account)) {
                explained[section] = [...(explained[section] ?? []), { account: item.account, name: nameOf(item.account), label }]
            }
        })

        if (loginBack) {
            resolved.push({
                id: `pw-${item.account}`,
                text: `${nameOf(item.account)}: su contraseña ya funciona; a ${whenText(runTime(loginBack))} el robot volvió a entrar a su InTouch. Lo que hoy no bajó (${listText(uniqueNames)}) se baja en la siguiente corrida.`,
            })
            return
        }

        if (item.cause === 'password') {
            problems.push({
                id: `pw-${item.account}`,
                tone: 'warn',
                tag: 'Contraseña',
                title: `${who(item.account)}: su contraseña de Mary Kay ya no funciona`,
                what: `Desde ${whenText(sinceOf(item.account, 'password', item.first))} el robot no puede entrar a su InTouch («credenciales incorrectas»); casi siempre es que la cambió. Hoy no bajaron: ${listText(uniqueNames)}.`,
                todo: 'Pídele su contraseña nueva de InTouch y captúrala en su ficha. En la siguiente corrida el robot baja lo que falta.',
                actions: [{ label: 'Abrir su ficha', to: ficha ? APP_ROUTES.CLIENTS.DETAIL.replace(':id', ficha) : APP_ROUTES.CLIENTS.LIST }],
            })
            return
        }
        if (item.cause === 'portal' || item.cause === 'view') {
            /* Si ya venía fallando de antes de hoy, se dice: es la pista de que su portal no tiene ese reporte */
            const since = sinceOf(item.account, item.cause, item.first)
            const before = !isToday(since) ? ` También falló ${whenText(since)}.` : ''
            problems.push({
                id: `portal-${item.account}`,
                tone: 'warn',
                tag: 'Portal de Mary Kay',
                title: item.cause === 'view'
                    ? `${who(item.account)}: el portal le dio otra vista de ${listText(uniqueNames)}`
                    : `${who(item.account)}: el portal de Mary Kay no cargó ${listText(uniqueNames)}`,
                what: (item.cause === 'view'
                    ? `Se pidió la vista de la pestaña correcta y el portal insistió en otra (${times(item.attempts)} hoy, la última a ${whenText(item.last)}).`
                    : `Lo intentó ${times(item.attempts)} hoy (la última a ${whenText(item.last)}) y la página no respondió a tiempo.`) + before,
                todo: 'Suele ser lentitud del portal y la siguiente corrida lo baja sola. Si mañana sigue igual, puede que su InTouch no tenga ese reporte.',
                actions: [{ label: 'Ver corridas', to: APP_ROUTES.REPORTS.DASHBOARD }],
            })
            return
        }
        problems.push({
            id: `other-${item.account}-${item.cause}`,
            tone: 'warn',
            tag: 'Robot',
            title: item.cause === 'missing'
                ? `${who(item.account)}: su portal no tiene ${listText(uniqueNames)}`
                : `${who(item.account)}: no bajó ${listText(uniqueNames)}`,
            what: item.cause === 'missing'
                ? `El robot entró a su InTouch y el portal no lo trae (${times(item.attempts)}): «${firstLine(item.error) || 'no aparece'}».`
                : `El robot lo intentó ${times(item.attempts)} y dijo: «${firstLine(item.error) || 'sin detalle'}».`,
            todo: item.cause === 'missing'
                ? 'Su cuenta entra bien: es el portal el que no trae ese dato. Si no le corresponde, se le deja de pedir.'
                : 'Revisa la corrida en Reportes.',
            actions: [{ label: 'Ver corridas', to: APP_ROUTES.REPORTS.DASHBOARD }],
        })
    })

    /* 3. Reportes del día con faltantes que ninguna falla del robot explica (p. ej. el import no corrió) */
    const running = today.filter(run => !runDone(run)).flatMap(run => run.sections ?? []).map(key => DAILY_SECTION_OF[key] ?? key)
    reports.filter(report => isToday(report.last_at) && !dailyDone(report) && !running.includes(report.section_key)).forEach(report => {
        const known = explained[report.section_key] ?? []
        /* Con la lista de la API se dice quién: las que faltan y ninguna falla del robot explica */
        if (report.missing) {
            const unknown = report.missing.filter(item => !known.some(entry => entry.account === baseAccount(item.account)))
            if (!unknown.length) return
            const rejected = unknown.filter(item => item.rejected)
            unknown.forEach(item => {
                explained[report.section_key] = [...(explained[report.section_key] ?? []), { account: baseAccount(item.account), name: item.name, label: item.rejected ? 'el import rechazó su archivo' : 'sin motivo registrado' }]
            })
            problems.push({
                id: `report-${report.section_key}`,
                tone: 'warn',
                tag: 'Reportes',
                title: `${report.name}: ${unknown.length === 1 ? `le falta a ${unknown[0].name}` : `faltan ${unknown.length} cuentas`}`,
                what: rejected.length === unknown.length
                    ? `Su archivo sí bajó, pero el import lo rechazó (${listText(unknown.map(item => item.name))}).`
                    : `El robot no reportó ninguna falla de ${unknown.length === 1 ? 'ella' : `ellas (${listText(unknown.map(item => item.name))})`} hoy: puede que no se le haya pedido o que el archivo no se haya cargado.`,
                todo: 'Ábrelo en Reportes para ver qué pasó.',
                actions: [{ label: 'Ver las que faltan', to: APP_ROUTES.REPORTS.DASHBOARD }],
            })
            return
        }
        const missing = dailyMissing(report)
        if (missing <= known.length) return
        const rest = missing - known.length
        problems.push({
            id: `report-${report.section_key}`,
            tone: 'warn',
            tag: 'Reportes',
            title: `${report.name}: ${rest === 1 ? 'falta 1 cuenta' : `faltan ${rest} cuentas`} sin motivo registrado`,
            what: `Hay ${report.loaded + (report.empty ?? 0)} de ${report.usual} y el robot no reportó ninguna falla de ${rest === 1 ? 'esa cuenta' : 'esas cuentas'}: puede que no se le haya pedido o que el archivo no se haya cargado.`,
            todo: 'Ábrelo en Reportes para ver cuáles faltan.',
            actions: [{ label: 'Ver las que faltan', to: APP_ROUTES.REPORTS.DASHBOARD }],
        })
    })

    const order: Record<ProblemTone, number> = { bad: 0, warn: 1 }
    return {
        problems: problems.sort((a, b) => order[a.tone] - order[b.tone]),
        resolved,
        explained,
        accounts: [...accounts],
    }
}
