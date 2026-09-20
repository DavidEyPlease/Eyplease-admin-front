// SÓLO DEV: una API de mentira para recorrer el PANEL sin sesión ni contraseñas, igual que el
// simulador de la web de clientas. Todo lo que se ve aquí es de EJEMPLO (gente y cifras inventadas):
// sirve para revisar el marco y las pantallas, no para leer el negocio. No entra en el build.

const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d = now) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const iso = (minutesAgo = 0) => new Date(now.getTime() - minutesAgo * 60000).toISOString()
const period = (back = 0) => { const d = new Date(now.getFullYear(), now.getMonth() - back, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const today = now.getDate()

const me = {
    id: 'demo-admin', name: 'Administración Demo', email: 'demo@ejemplo.com', profile_picture: null, username: 'DEMOADMIN',
    country: 'MEX', phone: '0000000000', on_notifications: true, on_biometric_auth: false,
    role: { id: 'role-demo', name: 'Super administrador', role_key: 'super_admin', permissions: [] },
}

const revenue = (back: number, collected: number, outstanding: number) => ({
    period: period(back), collected, outstanding, paid_count: 61, overdue_count: back ? 0 : 4, in_review_count: back ? 0 : 3, pending_count: back ? 0 : 12, total_count: 80,
})

const daily = [
    ['birthdays', 'Cumpleaños', '06:30', 'ok'], ['early', 'Ordenantes del mes', '07:00', 'ok'], ['new_beginnings', 'Nuevos inicios', '07:30', 'ok'],
    ['pink_circle', 'Círculo Rosa en vivo', '11:30', now.getHours() >= 12 ? 'missing' : 'scheduled'], ['honor_roll', 'Cuadro de Honor en vivo', '11:30', now.getHours() >= 12 ? 'ok' : 'scheduled'],
].map(([key, name, scheduled_at, status], index) => ({
    key, name, scheduled_at, ran_today: status === 'ok', today_status: status,
    days_covered: today - (index === 3 ? 2 : 0), days_expected: today, days_missing: index === 3 ? 2 : 0,
    covered_days: Array.from({ length: today }, (_, d) => d + 1).filter(d => !(index === 3 && (d === today || d === today - 3))),
    failed_jobs: index === 3 ? 1 : 0, last_run_at: status === 'ok' ? iso(180 - index * 20) : iso(60 * 26),
}))

const request = (n: number, title: string, client: string, days: number) => ({ id: `task-${n}`, consecutive: n, title, client, account: `EJ-00${n % 9 + 1}`, created_at: iso(days * 1440 + 90), days })

const overview = {
    period: period(0),
    revenue: { current: revenue(0, 48210, 14380), previous: revenue(1, 59870, 0) },
    publishing: { today: ymd(), days_elapsed: today, days_in_month: daysInMonth, daily, monthly: { covered: 9, total: 11, missing: [{ key: 'diq', name: "DIQ's", posts: 0, data_period: period(1) }, { key: 'sales_cut', name: 'Corte de ventas', posts: 0, data_period: period(1) }] } },
    service_requests: { new: 3, in_review: 5, latest: [request(581, 'Invitación · Junta de unidad', 'Clienta de ejemplo A', 0), request(580, 'Reconocimiento · Reina de ventas', 'Clienta de ejemplo B', 1), request(578, 'Promoción · Skincare', 'Clienta de ejemplo C', 2)] },
    corrections: { count: 1, latest: [request(572, 'Invitación · cambiar la hora', 'Clienta de ejemplo D', 1)] },
    clients: { active: 98, inactive: 7, new_this_month: 4 },
}

const notifications = {
    unread: { whatsapp: 6, service_requests: 3, corrections: 1, delivery_failures: 0 }, unread_total: 10,
    seen_at: { whatsapp: null, service_requests: null, corrections: null, delivery_failures: null },
    items: [
        { id: 'n1', channel: 'whatsapp', title: 'Clienta de ejemplo A', detail: '¿Ya quedó mi invitación?', at: iso(12), count: 2, ref: null },
        { id: 'n2', channel: 'service_requests', title: '#581 Invitación · Junta de unidad', detail: 'Sin asignar', at: iso(40), count: 1, ref: 'task-581' },
        { id: 'n3', channel: 'corrections', title: '#572 Invitación · cambiar la hora', detail: 'Pidió corrección', at: iso(95), count: 1, ref: 'task-572' },
    ],
}

const person = (n: number, name: string, sponsor: string) => ({ sponsored_id: `p-${n}`, sponsor_id: `s-${n}`, client_id: `c-${n}`, name, consultant_code: `EJ${n}0${n}`, photo: null, sponsor_name: sponsor, client_name: sponsor })
const liveNews = {
    date: ymd(),
    star_level_up: [{ ...person(1, 'Consultora de ejemplo Uno', 'Directora de ejemplo A'), star: 'ruby', previous_star: 'sapphire', points: 2410, gained: 640 }],
    star_close: [{ ...person(2, 'Consultora de ejemplo Dos', 'Directora de ejemplo B'), star: 'sapphire', points: 1620, points_needed: 180 }],
    new_beginning: [{ ...person(3, 'Consultora de ejemplo Tres', 'Directora de ejemplo A'), start_date: ymd() }],
    totals: { star_level_up: 1, star_close: 1, new_beginning: 1 },
}

const dailyReports = [['early', 'Ventas Mensuales Personales', 98, 98], ['pink_circle_hearts', 'Corazones · VIP Gold', 98, 97], ['pink_circle_vip_plus', 'Corazones · VIP Plus', 29, 29]]
    .map(([section_key, name, usual, loaded]) => ({ section_key, name, usual, loaded, rejected: 0, date: ymd(), last_at: iso(200) }))

/* Finanzas: resumen y balance con la forma real (las listas de pagos y clientas abren vacías) */
const monthsSoFar = Array.from({ length: now.getMonth() + 1 }, (_, index) => index + 1)
const incomeOf = (month: number) => month === now.getMonth() + 1 ? 48210 : 52000 + ((month * 7919) % 9000)
const summaryMonth = (month: number) => ({
    month, income: incomeOf(month), overdue_total: month === now.getMonth() + 1 ? 5480 : 0, pending_total: month === now.getMonth() + 1 ? 8900 : 0,
    overdue_clients: month === now.getMonth() + 1 ? 4 : 0, avg_ticket: 790, total_clients: 80,
})
const financeSummary = (month: number) => ({
    year: now.getFullYear(), month, active_clients: 98, churn_rate: 0.021,
    plan_distribution: [{ plan: 'Plan de ejemplo A', count: 41, revenue: 28290 }, { plan: 'Plan de ejemplo B', count: 33, revenue: 32670 }, { plan: 'Plan de ejemplo C', count: 24, revenue: 35760 }],
    month_summary: summaryMonth(month), months: monthsSoFar.map(summaryMonth),
})
const financeBalance = () => {
    const months = monthsSoFar.map(month => { const income = incomeOf(month); const expense = 21000 + ((month * 3571) % 6000); return { month, income, expense, balance: income - expense } })
    const sum = (key: 'income' | 'expense' | 'balance') => months.reduce((acc, item) => acc + item[key], 0)
    return { year: now.getFullYear(), year_income: sum('income'), year_expense: sum('expense'), year_balance: sum('balance'), months }
}

/* Publicaciones: cobertura por sección y por clienta, y las últimas corridas */
const coverageSection = (section_key: string, name: string, cadence: 'daily' | 'monthly', scheduled_at: string | null, expected: number, posts: number, artifacts: Array<'image' | 'video'> = ['image', 'video']) => ({
    section_key, name, newsletter: 'unit_newsletter', cadence, scheduled_at, artifacts, last_activity_at: iso(200), expected, pending: Math.max(expected - posts, 0),
    posts, with_image: posts, with_video: artifacts.includes('video') ? Math.max(posts - 3, 0) : 0, notified: posts, subsections: [],
})
const coverageSections = [
    coverageSection('birthdays', 'Cumpleaños', 'daily', '06:30', 212, 212), coverageSection('early', 'Ordenantes del mes', 'daily', '07:00', 340, 340, ['image']),
    coverageSection('pink_circle', 'Círculo Rosa', 'monthly', null, 98, 91), coverageSection('honor_roll', 'Cuadro de Honor', 'monthly', null, 98, 98),
    coverageSection('diq', "DIQ's", 'monthly', null, 40, 0), coverageSection('sales_cut', 'Corte de ventas', 'monthly', null, 98, 0),
]
const postsCoverage = { period: period(1), snapshot_at: iso(300), current_target_period: period(1), sections: coverageSections }
const clientCoverage = {
    period: period(1), columns: coverageSections.map(section => ({ section_key: section.section_key, name: section.name, newsletter: 'unit_newsletter', requires_video: section.artifacts.includes('video') })),
    items: ['A', 'B', 'C', 'D', 'E', 'F'].map((letter, index) => {
        const cells = Object.fromEntries(coverageSections.map((section, column) => [section.section_key, section.posts === 0 ? 'empty' : (index + column) % 7 === 0 ? 'partial' : 'full']))
        return { client_id: `c-${index}`, client_name: `Clienta de ejemplo ${letter}`, client_account: `EJ-00${index + 1}`, plan_name: `Plan de ejemplo ${'ABC'[index % 3]}`, cells, gaps: Object.values(cells).filter(state => state !== 'full').length }
    }),
    total_items: 6, per_page: 15, current_page: 1, last_page: 1,
}
const postRuns = [['birthdays', 'Cumpleaños', 'completed', 212, 0], ['early', 'Ordenantes del mes', 'completed', 340, 0], ['pink_circle', 'Círculo Rosa', 'partial', 98, 7]].map(([section_key, section_name, status, total, failed], index) => ({
    id: `run-${index}`, section_key, section_name, sub_section: null, artifact: 'image', total_jobs: total, processed_jobs: total, succeeded_jobs: Number(total) - Number(failed), failed_jobs: failed,
    status, trigger_source: 'cron', triggered_by: null, started_at: iso(240 - index * 30), finished_at: iso(225 - index * 30), error_summary: failed ? 'Ejemplo: 7 piezas sin plantilla del mes' : null,
}))
const plans = ['A', 'B', 'C'].map((letter, index) => ({ id: `plan-${index}`, name: `Plan de ejemplo ${letter}`, price: [690, 990, 1490][index], active: true, free: false, is_default: index === 0, features: [], accesses: [], color: ['#6C47FF', '#2CD4D9', '#E5077D'][index], clients_count: [41, 33, 24][index], created_at: iso(60 * 24 * 200) }))

/* Los catálogos que el panel carga al entrar: sin ellos Tareas truena al pintar sus filtros */
const utilData = {
    plans, designers: [], training_categories: [], newsletters: [],
    task_types: [{ id: 'tt-1', name: 'Solicitud de clienta', slug: 'user-service-request' }, { id: 'tt-2', name: 'Biblioteca', slug: 'tools' }, { id: 'tt-3', name: 'Entrenamientos', slug: 'trainings' }],
    task_statuses: [['Sin asignar', 'unassigned'], ['En proceso', 'in-progress'], ['Lista para revisión', 'ready-for-review'], ['Corrección', 'correction'], ['Completada', 'completed']].map(([name, slug], index) => ({ id: `ts-${index}`, name, slug })),
}

/* Tareas: el tablero espera una LISTA (no una página) */
const demoTasks = [
    [581, 'Invitación · Junta de unidad', 0, 0, 1], [580, 'Reconocimiento · Reina de ventas', 1, 1, 2], [578, 'Promoción · Skincare', 1, 2, 3],
    [572, 'Invitación · cambiar la hora', 3, 1, 1], [569, 'Felicitación · Nueva Directora', 2, 3, 2], [565, 'Portada de boletín', 4, 6, 0],
].map(([consecutive, title, status, daysAgo, dueIn]) => ({
    id: `task-${consecutive}`, consecutive, title, description: 'Pedido de EJEMPLO para revisar el tablero.',
    started_at: iso(Number(daysAgo) * 1440), expired_at: new Date(now.getTime() + Number(dueIn) * 86400000).toISOString(),
    task_status: utilData.task_statuses[Number(status)], task_type: utilData.task_types[0], assigned_to: null, files: [], metadata: {},
    created_at: iso(Number(daysAgo) * 1440), updated_at: iso(30),
}))

/* ── Copiloto de mentira ─────────────────────────────────────────────────────────────────────
   En la demo NO hay IA: contesta con un guion armado con las MISMAS cifras de ejemplo de arriba,
   para revisar cómo se ve y se siente el panel. El de verdad es Claude con herramientas de sólo
   lectura (`/admin/copilot`), y necesita la API desplegada. */
const money = (n: number) => `$${n.toLocaleString('es-MX')}`
const copilotThreads: Record<string, { id: string, title: string, last_message_at: string, created_at: string, messages: Array<{ id: string, role: 'user' | 'assistant', text: string, created_at: string }> }> = {}

const copilotAnswer = (question: string) => {
    const q = question.toLowerCase()
    const cur = overview.revenue.current
    const missingDaily = daily.filter(item => item.days_missing > 0 || item.failed_jobs > 0)
    const reportsShort = dailyReports.filter(report => report.loaded < report.usual)

    if (/report|robot|baj/.test(q)) {
        return [
            reportsShort.length ? `Casi: ${dailyReports.length - reportsShort.length} de ${dailyReports.length} reportes bajaron completos.` : 'Sí, los reportes de hoy bajaron completos.',
            ...dailyReports.map(report => `- ${report.name}: ${report.loaded} de ${report.usual}${report.loaded < report.usual ? ' (falta ' + (Number(report.usual) - Number(report.loaded)) + ')' : ''}`),
            reportsShort.length ? 'La que falta la vuelve a intentar el robot a las 12:30. Si sigue sin subir, se ve en Monitor de reportes.' : '',
        ].filter(Boolean).join('\n')
    }
    if (/cobr|pag|venc|deb|dinero|ingres/.test(q)) {
        return [
            `Van ${money(cur.collected)} cobrados este mes y quedan ${money(cur.outstanding)} por cobrar.`,
            `- Vencidos: ${cur.overdue_count} (lo primero que hay que atender)`,
            `- En revisión: ${cur.in_review_count} comprobantes por validar`,
            `- Pendientes sin vencer: ${cur.pending_count}`,
            `- Pagados: ${cur.paid_count} de ${cur.total_count}`,
            `El mes pasado cerró en ${money(overview.revenue.previous.collected)}. El detalle por clienta está en Finanzas.`,
        ].join('\n')
    }
    if (/public|falta|secci|sali/.test(q)) {
        const monthly = overview.publishing.monthly
        return [
            missingDaily.length ? `Hay ${missingDaily.length} sección diaria con huecos y ${monthly.missing.length} mensuales sin publicar.` : `Las diarias van al corriente; faltan ${monthly.missing.length} mensuales.`,
            ...missingDaily.map(item => `- ${item.name}: ${item.days_missing} días sin salir este mes y ${item.failed_jobs} trabajo fallido`),
            ...monthly.missing.map(item => `- ${item.name}: sin publicar (datos de ${item.data_period})`),
            'Relanzar una sección se hace desde Publicaciones; yo sólo consulto.',
        ].join('\n')
    }
    if (/client|busca|cuenta/.test(q)) {
        return `Tienes ${overview.clients.active} clientas activas, ${overview.clients.inactive} inactivas y ${overview.clients.new_this_month} nuevas este mes. Dime el nombre o la cuenta Mary Kay de una y te digo su plan y si está activa (en esta demo la gente es inventada).`
    }
    return [
        'Tres cosas por atender hoy, en este orden:',
        `- Cobranza: ${cur.overdue_count} pagos vencidos y ${cur.in_review_count} comprobantes por validar (${money(cur.outstanding)} por cobrar)`,
        ...missingDaily.map(item => `- Publicaciones: ${item.name} lleva ${item.days_missing} días sin salir y tiene ${item.failed_jobs} trabajo fallido`),
        `- Diseño: ${overview.service_requests.new} solicitudes nuevas sin asignar y ${overview.corrections.count} corrección pendiente`,
        reportsShort.length ? `Los reportes bajaron casi completos: falta ${reportsShort.map(report => report.name).join(', ')}.` : 'Los reportes de hoy bajaron completos.',
    ].join('\n')
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Lo que se pidió y a qué se contestó: `window.__demo.calls` dice qué no estaba previsto. */
export const calls: Array<{ method: string, path: string, mocked: boolean }> = []

const respond = (data: unknown, status = 200) => new Response(JSON.stringify({ success: status < 400, data, message: status < 400 ? 'OK' : 'Simulado' }), { status, headers: { 'Content-Type': 'application/json' } })
const page = <T,>(items: T[]) => ({ items, current_page: 1, last_page: 1, per_page: 15, total_items: items.length, next_cursor: null })

export const installMockApi = () => {
    const base = import.meta.env.VITE_API_URL as string
    const realFetch = window.fetch.bind(window)

    window.fetch = async (input, init) => {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        if (!raw.startsWith(base)) return realFetch(input, init)

        const url = new URL(raw)
        const path = url.pathname.replace(new URL(base).pathname.replace(/\/$/, ''), '') || '/'
        const method = (init?.method ?? 'GET').toUpperCase()
        let known = true
        let response: Response

        if (path === '/me') response = respond(me)
        else if (path === '/util-data') response = respond(utilData)
        else if (path === '/overview') response = respond(overview)
        else if (path === '/notifications/center') response = respond(notifications)
        else if (path === '/notifications/center/seen') response = respond(true)
        else if (path === '/live-news') response = respond(liveNews)
        else if (path === '/reports/daily-reports') response = respond(dailyReports)
        else if (path === '/copilot' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { message: string, conversation_id: string | null }
            const id = body.conversation_id ?? crypto.randomUUID()
            const thread = copilotThreads[id] ??= { id, title: body.message.slice(0, 60), last_message_at: iso(), created_at: new Date().toISOString(), messages: [] }
            const answer = copilotAnswer(body.message)
            thread.messages.push({ id: crypto.randomUUID(), role: 'user', text: body.message, created_at: new Date().toISOString() }, { id: crypto.randomUUID(), role: 'assistant', text: answer, created_at: new Date().toISOString() })
            thread.last_message_at = new Date().toISOString()
            await wait(1400)
            response = respond({ conversation_id: id, message: answer })
        }
        else if (path === '/copilot/conversations') response = respond({ items: Object.values(copilotThreads).sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)).map(({ id, title, last_message_at, created_at }) => ({ id, title, last_message_at, created_at })), pagination_token: null, previous_pagination_token: null, per_page: 20, last_page: true })
        else if (/^\/copilot\/conversations\/[^/]+\/messages$/.test(path)) response = respond(copilotThreads[path.split('/')[3]]?.messages ?? [])
        else if (/^\/copilot\/conversations\/[^/]+$/.test(path) && method === 'DELETE') { delete copilotThreads[path.split('/')[3]]; response = respond(true) }
        else if (path === '/finance/summary') response = respond(financeSummary(Number(url.searchParams.get('month')) || now.getMonth() + 1))
        else if (path === '/finance/balance') response = respond(financeBalance())
        else if (path === '/finance/expenses') response = respond([])
        else if (path === '/posts/coverage') response = respond(postsCoverage)
        else if (path === '/posts/coverage/clients') response = respond(clientCoverage)
        else if (path === '/posts/runs') response = respond(postRuns)
        else if (path === '/plans') response = respond(plans)
        else if (path === '/tasks' && method === 'GET') response = respond(demoTasks)
        else if (path === '/logout') response = respond(null)
        else if (path === '/sign-in') response = respond(null, 401)
        /* Lo no previsto contesta vacío: la pantalla abre en su estado «sin datos», que también hay que ver */
        else { known = false; response = respond(method === 'GET' ? page([]) : null) }

        calls.push({ method, path: path + (url.search || ''), mocked: known })
        return response
    }
}
