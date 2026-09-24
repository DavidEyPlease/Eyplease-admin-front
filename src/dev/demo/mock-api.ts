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

/* Las diarias que la API vigila de verdad (PostCoverageService::DAILY_SCHEDULE) */
const daily = ([['early', 'Ordenantes del mes', '09:00'], ['birthdays', 'Cumpleaños', '20:00'], ['anniversaries', 'Aniversarios', '20:00']] as Array<[string, string, string]>).map(([key, name, scheduled_at], index) => {
    const [h, m] = scheduled_at.split(':').map(Number)
    const due = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
    return {
        key, name, scheduled_at, ran_today: due, today_status: due ? (key === 'birthdays' ? 'partial' : 'ok') : 'scheduled', failed_today: due && key === 'birthdays' ? 3 : 0,
        days_covered: due ? today : today - 1, days_expected: due ? today : today - 1, days_missing: index === 2 ? 1 : 0,
        covered_days: Array.from({ length: due ? today : today - 1 }, (_, d) => d + 1), failed_jobs: 0, last_run_at: due ? iso(30) : iso(60 * 17),
    }
})

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
/* A su hora de HOY, y sólo lo que ya pasó: la demo tiene que cuadrar con el reloj de quien la mira */
const at = (h: number, m: number) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d }
const passed = (h: number, m: number) => at(h, m).getTime() <= now.getTime()
const postRuns = ([
    ['early', 'Ordenantes del mes', 'image', 'completed', 340, 0, 9, 0], ['live_stars', 'Estrellas', 'image', 'completed', 4, 0, 9, 30], ['live_stars', 'Estrellas', 'video', 'completed', 4, 0, 9, 31],
    ['live_welcome', 'Nuevos inicios', 'image', 'completed', 3, 0, 9, 45], ['live_honor_roll', 'Cuadro de Honor', 'image', 'completed', 6, 0, 11, 30],
    ['live_pink_circle', 'Círculo Rosa', 'image', 'partial', 12, 3, 14, 30], ['birthdays', 'Cumpleaños', 'image', 'completed', 9, 0, 20, 0],
] as Array<[string, string, string, string, number, number, number, number]>).filter(([, , , , , , h, m]) => passed(h, m)).map(([section_key, section_name, artifact, status, total, failed, h, m], index) => ({
    id: `run-${index}`, section_key, section_name, sub_section: null, artifact, total_jobs: total, processed_jobs: total, succeeded_jobs: total - failed, failed_jobs: failed,
    status, trigger_source: 'cron', triggered_by: null, started_at: at(h, m).toISOString(), finished_at: at(h, m + 6).toISOString(), error_summary: failed ? 'Ejemplo: 3 piezas sin plantilla del mes' : null,
}))

/* El robot: la descarga de la mañana, la de corazones (deja 2 colgadas) y su reintento */
const downloadRuns = ([
    ['dr-1', ['early'], null, 29, 29, 0, 6, 0], ['dr-2', ['pink_circle_hearts', 'pink_circle_vip_plus'], null, 196, 194, 2, 11, 30], ['dr-3', ['pink_circle_hearts'], ['EJ-001', 'EJ-002'], 2, 2, 0, 12, 30],
] as Array<[string, string[], string[] | null, number, number, number, number, number]>).filter(([, , , , , , h, m]) => passed(h, m)).map(([run_id, sections, clients, total, uploaded, failed, h, m]) => ({
    run_id, process: 'daily', sections, clients, reset: false, status: 'completed', result: { total, uploaded, failed, skipped: 0 }, error: null, queued_at: at(h, m).toISOString(), finished_at: at(h, m + 4).toISOString(),
})).reverse()

/* Una pieza de mentira: un mosaico con su rótulo, sin imágenes de nadie */
const tile = (label: string, a: string, b: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="190" r="70" fill="rgba(255,255,255,.22)"/><rect x="90" y="300" width="220" height="18" rx="9" fill="rgba(255,255,255,.55)"/><rect x="130" y="332" width="140" height="12" rx="6" fill="rgba(255,255,255,.35)"/><text x="200" y="440" text-anchor="middle" font-family="system-ui" font-size="22" font-weight="800" fill="rgba(255,255,255,.85)">${label}</text></svg>`)}`
const tiles = (label: string, n: number, a: string, b: string) => Array.from({ length: n }, (_, index) => tile(`${label} ${index + 1}`, index % 2 ? b : a, index % 2 ? a : b))

const pulse = {
    date: ymd(),
    schedule: [
        ['06:00', 'robot_early', 'Robot: descarga de Ventas', 'Una entrada al portal por clienta', 'robot', []], ['08:00', 'import_early', 'Import de Tempraneras', 'Carga lo que bajó el robot', 'reports', []],
        ['09:00', 'early', 'Ordenantes del mes', 'Piezas de quien ordenó', 'publishing', ['early']], ['09:30', 'live_stars', 'Estrellas en vivo', 'Sólo quien cruzó un nivel hoy', 'live', ['stars']],
        ['09:45', 'live_welcome', 'Bienvenidas en vivo', 'Quien entró a una unidad', 'live', ['new_beginnings']], ['10:30', 'complete_formats', 'Repaso de formatos', 'Completa lo que quedó a medias', 'publishing', []],
        ['11:30', 'live_honor_roll', 'Cuadro de Honor en vivo', 'Sale donde el podio cambió de manos', 'live', ['honor_roll']], ['11:30', 'robot_hearts', 'Robot: descarga de Corazones', 'Mary Kay actualiza corazones a las 11:00', 'robot', []],
        ['12:30', 'retry_hearts', 'Reintento de Corazones', 'Uno a uno, cada 2 min, tope de 10', 'robot', []], ['13:30', 'import_hearts', 'Import de Corazones', 'Recoge también lo del reintento', 'reports', []],
        ['14:30', 'live_pink_circle', 'Círculo Rosa en vivo', 'Sale el día que ella mueve corazones', 'live', ['pink_circle']], ['20:00', 'birthdays', 'Cumpleaños y aniversarios', 'Las piezas de mañana', 'publishing', ['birthdays', 'anniversaries']],
    ].map(([time, key, label, hint, kind, sections]) => ({ time, key, label, hint, kind, sections })),
    pieces: [
        { section_key: 'early', section_name: 'Ordenantes del mes', live: false, posts: 340, clients: 29, last_at: at(9, 6).toISOString(), thumbs: tiles('Ordenante', 4, '#6C47FF', '#2CD4D9') },
        { section_key: 'stars', section_name: 'Estrellas', live: true, posts: 4, clients: 3, last_at: at(9, 36).toISOString(), thumbs: tiles('Estrella', 4, '#E5077D', '#6C47FF') },
        { section_key: 'new_beginnings', section_name: 'Nuevos inicios', live: true, posts: 3, clients: 3, last_at: at(9, 50).toISOString(), thumbs: tiles('Bienvenida', 3, '#F59E0B', '#E5077D') },
        { section_key: 'honor_roll', section_name: 'Cuadro de Honor', live: true, posts: 6, clients: 4, last_at: at(11, 36).toISOString(), thumbs: tiles('Podio', 4, '#4E31C0', '#E5077D') },
        { section_key: 'pink_circle', section_name: 'Círculo Rosa', live: true, posts: 9, clients: 7, last_at: at(14, 36).toISOString(), thumbs: tiles('Corazones', 4, '#DB2777', '#F472B6') },
    ],
}

const plans = ['A', 'B', 'C'].map((letter, index) => ({ id: `plan-${index}`, name: `Plan de ejemplo ${letter}`, price: [690, 990, 1490][index], active: true, free: false, is_default: index === 0, features: [], accesses: [], color: ['#6C47FF', '#2CD4D9', '#E5077D'][index], clients_count: [41, 33, 24][index], created_at: iso(60 * 24 * 200) }))

const demoDesigners = ['Ana Ejemplo', 'Beto Ejemplo', 'Carla Ejemplo'].map((name, index) => ({ id: `d-${index}`, name, email: `d${index}@ejemplo.com`, profile_picture: null, photo: null, username: `DIS${index}`, country: 'MEX', phone: '', active: true, on_notifications: true, on_biometric_auth: false, role: { id: 'r-des', name: 'Diseñador', role_key: 'designer', permissions: [] } }))

/* Los catálogos que el panel carga al entrar: sin ellos Tareas truena al pintar sus filtros */
const utilData = {
    plans, designers: demoDesigners, training_categories: [], newsletters: [],
    task_types: [{ id: 'tt-1', name: 'Solicitud de clienta', slug: 'user-service-request' }, { id: 'tt-2', name: 'Biblioteca', slug: 'tools' }, { id: 'tt-3', name: 'Entrenamientos', slug: 'trainings' }],
    task_statuses: [['Sin asignar', 'unassigned'], ['En proceso', 'in-progress'], ['Lista para revisión', 'ready-for-review'], ['Corrección', 'correction'], ['Completada', 'completed'], ['Lista para publicar', 'ready-for-publish'], ['Subir recursos AE', 'upload_ae_resources'], ['Publicada', 'published']].map(([name, slug], index) => ({ id: `ts-${index}`, name, slug })),
}

/* Tareas: el tablero espera una LISTA (no una página). Hay de todo: de clientas, de Biblioteca y de
   entrenamientos, en todas las etapas, con atrasadas y de hoy para que se vean los avisos. */
const dueIn = (days: number, hour = 22) => { const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString() }
const demoTasks = ([
    [581, 'Invitación · Junta de unidad · sáb 26 sep', 0, 0, 0, null, 2], [583, 'Reconocimiento · Reina de ventas de agosto', 0, 0, 1, null, 1], [590, 'Historia · Tip de skincare de la semana', 0, 1, 3, null, 0], [591, 'Deck · Cómo cerrar una clase de belleza', 0, 2, 5, null, 0],
    [580, 'Promoción · Skincare Week', 1, 0, 0, 0, 3], [577, 'Felicitación · Nueva Directora', 1, 0, -1, 1, 1], [586, 'Publicación · Frase del lunes', 1, 1, 2, 0, 0], [587, 'Carrusel · 5 pasos del cuidado de la piel', 1, 1, 4, 2, 0],
    [578, 'Invitación · Debut de Directora', 2, 0, 0, 1, 2], [585, 'Historia · Aspiracional del martes', 2, 1, 1, 2, 1],
    [572, 'Invitación · cambiar la hora', 3, 0, -2, 0, 4],
    [569, 'Portada de boletín de unidad', 4, 0, -3, 1, 2], [565, 'Reconocimiento · Cuadro de Honor', 4, 0, -5, 0, 1], [560, 'Publicación · Frase del lunes pasado', 7, 1, -6, 2, 1], [558, 'Deck · Entérate Ya de septiembre', 5, 2, -8, 1, 1],
] as Array<[number, string, number, number, number, number | null, number]>).map(([consecutive, title, status, type, days, designer, files]) => ({
    id: `task-${consecutive}`, consecutive, title, description: 'Pedido de EJEMPLO para revisar el tablero.',
    started_at: dueIn(days - 1, 9), expired_at: dueIn(days), task_status: utilData.task_statuses[status], task_type: utilData.task_types[type],
    created_by: type === 0 ? { id: `u-${consecutive % 10}`, name: `Clienta de ejemplo ${'ABCDEFGHIJ'[consecutive % 10]}` } : null,
    assigned_to: designer === null ? null : demoDesigners[designer], files: Array.from({ length: files }, (_, index) => ({ id: `f-${consecutive}-${index}` })), metadata: {},
    created_at: iso((5 - days) * 1440), updated_at: iso(30),
}))

/* ── Clientas, cobranza y matriz de reportes (gente inventada) ─────────────────────────────── */
const demoClients = ([
    ['A', 'Directora Ejecutiva', 2, true, true, 0], ['B', 'Directora', 1, true, true, 1], ['C', 'Directora Senior', 2, true, false, 3], ['D', 'Directora', 0, true, true, 9],
    ['E', 'Consultora', 0, true, true, 2], ['F', 'Directora', 1, false, true, 95], ['G', 'Directora Senior', 2, true, true, 0], ['H', 'Consultora', 0, true, true, 40],
    ['I', 'Directora', 1, true, true, 4], ['J', 'Directora Ejecutiva', 2, true, false, 0],
] as Array<[string, string, number, boolean, boolean, number]>).map(([letter, rank, planIndex, active, password, seenDays], index) => ({
    id: `c-${index}`, name: `Clienta de ejemplo ${letter}`, account: `EJ-00${index + 1}`, from_signup: 'admin', mk_status: 'A1', photo: null, logotype: null, country: 'MEX',
    created_at: iso(60 * 24 * (200 + index * 17)), last_sign_in_at: seenDays > 90 ? null : iso(60 * 24 * seenDays), platform_guest_account: `invitada${index + 1}`,
    external_company_pw: password ? 'ejemplo' : null, rank, start_date: '2019-03-01', last_order_date: ymd(), promotion: index === 4 ? { promotion_id: 'p1', name: 'Promo de ejemplo −20 %', discount_type: 'percentage', discount: 20, expires_at: ymd() } : null,
    /* A y G pagan con tarjeta automática: así se ve el aviso de Stripe al desactivarlas */
    card_subscription: index === 0 || index === 6,
    current_month_points: 1800 + ((index * 7919) % 5200), previous_month_points: 2400 + ((index * 3571) % 6100), client_current_month_points: 600, client_previous_month_points: 900,
    user: { id: `u-${index}`, name: `Clienta de ejemplo ${letter}`, email: `clienta${index + 1}@ejemplo.com`, profile_picture: null, username: `EJ-00${index + 1}`, country: 'MEX', phone: '0000000000', active, on_notifications: true, on_biometric_auth: false, role: { id: 'r-client', name: 'Cliente', role_key: 'client', permissions: [] }, plan: plans[planIndex] },
}))
/* Cobranza con la forma real: cada clienta trae sus pagos por periodo (YYYY-MM). «Aprobar» un
   comprobante lo pasa a pagado de verdad, para poder probar la cola. */
const cur = period(0), prev = period(1)
const financeLedger: Record<string, Record<string, { amount: number, paid: number | null, status: string, receipt_url?: string | null, reference_number?: string | null, receipt_uploaded_at?: string | null }>> = {
    'EJ-003': { [prev]: { amount: 1490, paid: 0, status: 'overdue' }, [cur]: { amount: 1490, paid: 0, status: 'overdue' } },
    'EJ-008': { [cur]: { amount: 690, paid: 0, status: 'overdue' } },
    'EJ-005': { [cur]: { amount: 552, paid: 0, status: 'in_review', receipt_url: 'https://example.com/comprobante-de-ejemplo', reference_number: 'EJEMPLO-4471', receipt_uploaded_at: iso(95) } },
    'EJ-001': { [cur]: { amount: 1490, paid: 0, status: 'in_review', receipt_url: 'https://example.com/comprobante-de-ejemplo', reference_number: 'EJEMPLO-9020', receipt_uploaded_at: iso(260) } },
    'EJ-002': { [cur]: { amount: 990, paid: 0, status: 'pending' } }, 'EJ-004': { [cur]: { amount: 690, paid: 0, status: 'pending' } }, 'EJ-009': { [cur]: { amount: 990, paid: 0, status: 'pending' } },
}
const STATUS_GROUP: Record<string, string[]> = { overdue: ['overdue', 'partial'], in_review: ['in_review'], pending: ['pending'], paid: ['paid'], collectable: ['overdue', 'partial', 'pending', 'in_review'] }
const financeClients = (status: string) => {
    const wanted = STATUS_GROUP[status] ?? STATUS_GROUP.collectable
    const items = Object.entries(financeLedger).filter(([, payments]) => Object.values(payments).some(payment => wanted.includes(payment.status))).map(([account, payments], index) => {
        const client = demoClients.find(item => item.account === account)
        return { id: account, user_id: client?.user.id, name: client?.name ?? account, plan: client?.user.plan.name ?? null, fixed_payment: client?.user.plan.price ?? null, billing_type: index % 3 === 0 ? 'stripe' : 'manual', app_status: 'active', payment_day: Math.min(28, today + 1 + index * 2), phone: null, balance: 0, promotion: null, next_charge_date: null, next_charge_amount: null, payments }
    })
    return { ...page(items), total_overdue: 3670, total_pending: 2670, total_in_review: 2042 }
}
const reportSections = [['early', 'Tempraneras'], ['pink_circle', 'Círculo Rosa'], ['stars', 'Estrellas'], ['honor_roll', 'Cuadro de Honor'], ['new_beginnings', 'Nuevos inicios'], ['birthdays', 'Cumpleaños']]
const clientsStatus = {
    sections: reportSections.map(([section_key, name]) => ({ section_key, name, group: 'unit', plans: plans.map(plan => plan.name) })),
    clients: demoClients.filter(client => client.user.active).map((client, index) => ({
        id: client.id, name: client.name, account: client.account, plan: client.user.plan.name,
        cells: Object.fromEntries(reportSections.slice(0, 4 + (index % 3)).map(([key], column) => [key, (index === 2 && column > 1) || (index === 7 && column === 0) ? 'missing' : 'completed'])),
    })),
}
const reportSummary = {
    period: period(1),
    kpis: { progress: 94, loaded: 512, expected: 545, clients_with_newsletter: 98, missing: 33, rejected: 2, empty: 1 },
    sections: reportSections.map(([section_key, name], index) => ({ section_key, name, group: 'unit', loaded: 98 - index * 3, expected: 98, missing: index * 3 })),
}

/* ── WhatsApp: una bandeja de ejemplo para recorrer la pantalla (nadie real, nada se envía) ─── */
const waConversation = (n: number, name: string, last: string, minutes: number, manual: boolean, client: boolean, channel = 'whatsapp') => ({
    wa_id: `52155000000${n}`, channel, stage: client ? 'soporte' : 'prospecto', human_took_over: manual, profile_name: name, display_name: name, last_message: last, notas_count: 0,
    identity: client ? { name, consultantCode: `EJ-00${n}`, networkPersonId: `c-${n - 1}`, role: 'Directora', photoUrl: null, active: true, isClient: true, found: true } : { found: false, isClient: false },
    name: client ? name : null, account: client ? `EJ-00${n}` : null, network_person_id: client ? `c-${n - 1}` : null, created_at: iso(60 * 24 * 12), updated_at: iso(minutes),
})
const waConversations = [
    waConversation(1, 'Clienta de ejemplo A', '¿Ya quedó mi invitación?', 12, false, true), waConversation(3, 'Clienta de ejemplo C', 'Ya hice la transferencia, te mando el comprobante', 47, true, true),
    waConversation(5, 'Clienta de ejemplo E', 'Gracias, quedó hermoso', 180, false, true), waConversation(9, 'Prospecto de ejemplo', '¿Cuánto cuesta el plan para una Directora?', 260, false, false, 'instagram'),
]
const waHistory = (name: string) => [
    { role: 'user', content: `Hola, soy ${name}. ¿Ya quedó mi invitación para la junta del sábado?`, at: iso(40) },
    { role: 'assistant', content: 'Hola. Tu invitación está en proceso con el equipo de diseño; la fecha compromiso es hoy a las 10 de la noche. En cuanto esté lista te aviso por aquí.', at: iso(39) },
    { role: 'user', content: 'Perfecto. ¿Le pueden poner la dirección del salón?', at: iso(14) },
    { role: 'assistant', content: 'Claro, ya se lo pasé al diseñador como nota del pedido.', at: iso(13) },
    { role: 'user', content: '¿Ya quedó mi invitación?', at: iso(12) },
]
const waTickets = [
    { id: 't-1', wa_id: '521550000003', client_name: 'Clienta de ejemplo C', client_role: 'Directora Senior', channel: 'whatsapp', problem: 'Subió comprobante y su pago sigue como vencido', severity: 'alta', status: 'abierto', created_at: iso(50), updated_at: iso(47) },
    { id: 't-2', wa_id: '521550000005', client_name: 'Clienta de ejemplo E', client_role: 'Consultora', channel: 'whatsapp', problem: 'No le aparece la foto en su pieza de cumpleaños', severity: 'media', status: 'en_proceso', created_at: iso(60 * 20), updated_at: iso(60 * 3) },
    { id: 't-3', wa_id: '521550000001', client_name: 'Clienta de ejemplo A', client_role: 'Directora Ejecutiva', channel: 'whatsapp', problem: 'Pidió cambiar el logotipo de su unidad', severity: 'baja', status: 'resuelto', created_at: iso(60 * 50), updated_at: iso(60 * 30) },
]
const waPage = <T,>(items: T[]) => ({ current_page: 1, items, per_page: 30, total_items: items.length, last_page: 1, is_last_page: true })

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
        else if (path === '/promotions' && method === 'GET') response = respond([])
        /* Ojo: son DOS rutas con formas distintas. Ésta la usa «Gestionar» de Cobranza; `/config`, la pestaña Métodos de pago */
        else if (path === '/finance/payment-methods' && method === 'GET') response = respond({ stripe: { enabled: true }, transfer: { enabled: true, accounts: [{ bank: 'Banco de ejemplo', beneficiary: 'Empresa de ejemplo', number: '0000 0000 0000 0000', numberType: 'clabe' }], instructions: 'Instrucciones de EJEMPLO.' } })
        else if (path === '/finance/payment-methods/config' && method === 'GET') response = respond({ accounts: [{ id: 'acc-1', bank: 'Banco de ejemplo', beneficiary: 'Empresa de ejemplo', number: '000000000000000000', number_type: 'clabe', is_active: true, sort_order: 1 }], settings: { stripe_enabled: true, transfer_enabled: true, transfer_instructions: 'Instrucciones de EJEMPLO.' } })
        else if (path === '/finance/payments' && method === 'GET') response = respond({ ...page([]), total_amount: 0, total_collected: 0 })
        /* La liga para mandarle a la clienta, con los mismos tres casos que la API real: con deuda
           (meses del libro de pagos), sin nada pendiente, o domiciliada (no necesita liga) */
        else if (path === '/finance/payments/card-link' && method === 'POST') {
            const account = String(JSON.parse(String(init?.body ?? '{}')).account ?? '')
            const client = demoClients.find(item => item.account === account)
            const periods = Object.entries(financeLedger[account] ?? {})
                .filter(([, payment]) => ['pending', 'overdue', 'partial'].includes(payment.status))
                .map(([period, payment]) => ({ period, amount: payment.amount - (payment.paid ?? 0) }))
                .sort((a, b) => a.period.localeCompare(b.period))
            await wait(700)
            const fail = (message: string) => new Response(JSON.stringify({ success: false, data: null, message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
            if (client?.card_subscription) response = fail('Ya paga con tarjeta automática: el cargo le llega solo, no necesita liga.')
            else if (!periods.length) response = fail('No tiene nada pendiente de pago.')
            else response = respond({
                checkout_url: `https://checkout.stripe.com/c/pay/cs_live_EJEMPLO_${account}`,
                amount: periods.reduce((sum, item) => sum + item.amount, 0),
                currency: 'MXN',
                periods,
                expires_at: new Date(Date.now() + (23 * 60 + 50) * 60_000).toISOString(),
            })
        }
        else if (path === '/posts/coverage') response = respond(postsCoverage)
        else if (path === '/posts/coverage/clients') response = respond(clientCoverage)
        else if (path === '/posts/runs') response = respond(postRuns)
        else if (path === '/pulse') response = respond(pulse)
        else if (path === '/reports/download-runs' && method === 'GET') response = respond(downloadRuns)
        // Ventas (fase 3/4): regalos y paquetes, quién quiere subir de plan, Directoras invitadas
        else if (path.startsWith('/plan-gifts') || path.startsWith('/plan-interests') || path.startsWith('/director-prospects')) {
            const demoUser = (name: string, code: string, plan: string) => ({ id: `u-${code}`, name, email: `${code.toLowerCase()}@ejemplo.com`, phone: '4611234567', username: code, network_person: { id: `np-${code}`, name, consultant_code: code }, plan: { id: 'p', name: plan } })
            const standard = { id: 'ps', name: 'Plan Standard', price: 399, color: '#6C47FF' }
            const ejecutivo = { id: 'pe', name: 'Plan Ejecutivo', price: 699, color: '#4E31C0' }
            const basico = { id: 'pb', name: 'Plan Básico', price: 299, color: '#2CD4D9' }
            if (method === 'PATCH') response = respond({ id: path.split('/')[2], contacted_at: path.endsWith('/contacted') ? iso(0) : null, fulfilled_at: path.endsWith('/fulfilled') ? iso(0) : null })
            else if (path === '/plan-gifts') response = respond(page([
                { id: 'g1', kind: 'gift', quantity: 1, user: demoUser('Blanca Silvia Novoa Macías', 'EJ-0001', 'Plan Ejecutivo'), person: { id: 'np-x', name: 'Ana Valadez Ángeles', consultant_code: 'EJ-0101' }, plan: standard, requested_at: iso(60), contacted_at: null, fulfilled_at: null, contacted_by: null },
                { id: 'g4', kind: 'unit_package', quantity: 6, user: demoUser('Martha Elena Lara', 'EJ-0005', 'Plan Élite'), person: null, plan: standard, requested_at: iso(9 * 1440), contacted_at: null, fulfilled_at: null, contacted_by: null },
                { id: 'g2', kind: 'unit_package', quantity: 12, user: demoUser('Julieta Ruiz Maldonado', 'EJ-0002', 'Plan Nacional'), person: null, plan: standard, requested_at: iso(1440), contacted_at: iso(120), fulfilled_at: null, contacted_by: { id: 'a', name: 'David' } },
                { id: 'g3', kind: 'gift', quantity: 1, user: demoUser('Ana María Tovar', 'EJ-0006', 'Plan Ejecutivo'), person: { id: 'np-y', name: 'Lucía Mendoza', consultant_code: 'EJ-0102' }, plan: ejecutivo, requested_at: iso(5 * 1440), contacted_at: iso(4 * 1440), fulfilled_at: iso(3 * 1440), contacted_by: { id: 'a', name: 'David' } },
            ]))
            else if (path === '/plan-interests') response = respond(page([
                { id: 'i1', user: demoUser('Carla Domínguez', 'EJ-0003', 'Plan Básico'), plan: ejecutivo, current_plan: basico, signals: { lock: 3, sheet: 1, request: 1 }, last_feature: 'unity:early', requested_at: iso(180), contacted_at: null, updated_at: iso(180) },
                { id: 'i2', user: demoUser('Rosa Luz Arteaga', 'EJ-0004', 'Plan Básico'), plan: ejecutivo, current_plan: basico, signals: { plan_card: 2 }, last_feature: null, requested_at: null, contacted_at: null, updated_at: iso(2880) },
                { id: 'i3', user: demoUser('Norma Angélica Pérez', 'EJ-0007', 'Plan Standard'), plan: ejecutivo, current_plan: standard, signals: { lock: 1, request: 1 }, last_feature: 'newsletter:annual', requested_at: iso(6 * 1440), contacted_at: iso(5 * 1440), updated_at: iso(5 * 1440) },
            ]))
            else response = respond(page([
                { id: 'd1', director_name: 'María Elvia Aguilar', director_email: 'maria@ejemplo.com', director_account: 'EJ-0500', director_phone: '4617654321', reward_months: 3, times_shared: 2, email_sent_at: iso(1440), joined_at: null, rewarded_at: null, created_at: iso(4 * 1440), invited_by: { id: 'c', name: 'Evangelina Caracheo', username: 'EJ-0201', phone: '4611112222' }, joined_user: null },
                { id: 'd3', director_name: 'Silvia Ramírez Cano', director_email: 'silvia@ejemplo.com', director_account: 'EJ-0501', director_phone: '4613334444', reward_months: 3, times_shared: 1, email_sent_at: iso(3 * 1440), joined_at: iso(600), rewarded_at: null, created_at: iso(3 * 1440), invited_by: { id: 'c3', name: 'Paty Zamora', username: 'EJ-0203', phone: '4615556666' }, joined_user: { id: 'u8', name: 'Silvia Ramírez Cano', username: 'EJ-0601' } },
                { id: 'd2', director_name: 'Guadalupe García', director_email: 'lupita@ejemplo.com', director_account: null, director_phone: null, reward_months: 3, times_shared: 1, email_sent_at: iso(7200), joined_at: iso(2880), rewarded_at: iso(2880), created_at: iso(8640), invited_by: { id: 'c2', name: 'Andrea Gorgonio', username: 'EJ-0202', phone: null }, joined_user: { id: 'u9', name: 'Guadalupe García', username: 'EJ-0600' } },
            ]))
        }
        else if (path === '/plans') response = respond(plans)
        else if (path === '/tasks' && method === 'GET') {
            const statuses = url.searchParams.getAll('statuses[]')
            const month = Number(url.searchParams.get('month'))
            response = respond(demoTasks.filter(task => (!statuses.length || statuses.includes(task.task_status.id)) && (!month || new Date(task.started_at).getMonth() + 1 === month || new Date(task.expired_at).getMonth() + 1 === month)))
        }
        else if (/^\/tasks\/task-\d+$/.test(path) && method === 'PATCH') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { status?: string, user?: string | null }
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            if (task && body.status) task.task_status = utilData.task_statuses.find(item => item.id === body.status) ?? task.task_status
            if (task && 'user' in body) task.assigned_to = demoDesigners.find(item => item.id === body.user) ?? null
            await wait(350)
            response = respond(task ?? null, task ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+$/.test(path) && method === 'GET') response = respond(demoTasks.find(item => item.id === path.split('/')[2]) ?? null)
        else if (/^\/tasks\/task-\d+\/activity$/.test(path)) response = respond([])
        else if (/^\/tasks\/task-\d+\/attachments$/.test(path)) response = respond([])
        else if (path === '/clients' && method === 'GET') {
            const search = (url.searchParams.get('search') ?? '').toLowerCase()
            response = respond(page(demoClients.filter(client => !search || `${client.name} ${client.account}`.toLowerCase().includes(search))))
        }
        else if (path === '/clients/metrics') response = respond({ active: 98, inactive: 7, pending_payment: 4, total_reports: 545, uploaded_reports: 512 })
        /* Activar / desactivar, como `change-status`: cambia `user.active` DE VERDAD, para que al recargar siga igual */
        else if (/^\/clients\/c-\d+\/change-status$/.test(path) && method === 'PATCH') {
            const client = demoClients.find(item => item.id === path.split('/')[2])
            if (client) client.user.active = !!JSON.parse(String(init?.body ?? '{}')).active
            await wait(400)
            response = respond(client ?? null, client ? 200 : 404)
        }
        else if (/^\/clients\/c-\d+$/.test(path) && method === 'GET') {
            /* La ficha espera `{ client, stats }`, no la clienta suelta */
            const found = demoClients.find(client => client.id === path.split('/')[2])
            response = respond(found ? { client: found, stats: { tools_download_percentage: 42, total_tools: 120, downloaded_tools: 50, monthly_posts: 64, shared_posts: 19, posts_shared_percentage: 30, month: period(0) } } : null, found ? 200 : 404)
        }
        else if (/^\/clients\/c-\d+\/network$/.test(path)) response = respond(page([]))
        else if (/^\/clients\/c-\d+\/accounts$/.test(path) && method === 'GET') {
            /* La clienta A trae dos cuentas (México y Colombia) para poder ver la tarjeta llena */
            const id = path.split('/')[2]
            response = respond(id === 'c-0' ? [
                { id: 'liga-mex', account: 'EJ-001', country: 'MEX', name: 'Clienta de ejemplo A', plan: 'Plan de ejemplo C', active: true, current: true },
                { id: 'liga-col', account: 'EJ-001MX', country: 'COL', name: 'Clienta de ejemplo A', plan: 'Plan de ejemplo B', active: true, current: false },
            ] : [])
        }
        else if (/^\/clients\/c-\d+\/accounts$/.test(path)) { await wait(300); response = respond(true) }
        else if (path === '/finance/clients') response = respond(financeClients(url.searchParams.get('collection_status') ?? 'collectable'))
        else if (path === '/finance/payments/review' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { account: string, period: string, decision: string }
            const payment = financeLedger[body.account]?.[body.period]
            if (payment) { payment.status = body.decision === 'approve' ? 'paid' : 'pending'; payment.paid = body.decision === 'approve' ? payment.amount : 0 }
            await wait(350)
            response = respond(true)
        }
        else if (/^\/finance\/clients\/[^/]+$/.test(path)) {
            const account = decodeURIComponent(path.split('/')[3])
            response = respond(financeClients('collectable').items.find(item => item.id === account) ?? financeClients('paid').items.find(item => item.id === account) ?? null)
        }
        else if (path === '/reports/clients-status') response = respond(clientsStatus)
        else if (path === '/reports/summary') response = respond(reportSummary)
        else if (path === '/whatsapp/stats') response = respond({ conversations: waConversations.length, manual: 1, bot: 3, open_tickets: 2, delivery_failures: 0 })
        else if (path === '/whatsapp/conversations') response = respond(waPage(waConversations))
        else if (/^\/whatsapp\/conversations\/\d+\/client$/.test(path)) {
            const found = waConversations.find(item => item.wa_id === path.split('/')[3])
            response = respond(found?.account ? { identified: true, last_client_message_at: iso(12), client: { id: found.network_person_id, account: found.account, name: found.name, email: 'clienta@ejemplo.com', active: true, photo: null, country_code: 'MX', rank: 'Directora', plan: 'Plan de ejemplo B', payments: { year: now.getFullYear(), status: found.account === 'EJ-003' ? 'retraso' : 'al_corriente', paid_periods: 8, overdue_periods: found.account === 'EJ-003' ? 1 : 0, in_review_periods: 0, pending_periods: 3, last_payment: { period: period(1), status: 'paid', amount: 990, paid_at: iso(60 * 24 * 18) } } } } : { identified: false, client: null, last_client_message_at: iso(260) })
        }
        else if (/^\/whatsapp\/conversations\/\d+$/.test(path)) {
            const found = waConversations.find(item => item.wa_id === path.split('/')[3])
            response = respond(found ? { ...found, history: waHistory(found.display_name ?? 'Clienta'), notas: [], qualification: null } : null, found ? 200 : 404)
        }
        else if (path === '/whatsapp/tickets') response = respond(waPage(waTickets))
        else if (path === '/whatsapp/templates') response = respond([{ name: 'recordatorio_pago', status: 'APPROVED', category: 'UTILITY', language: 'es_MX', body: 'Hola {{1}}, te recordamos tu pago de Eyplease+.', varCount: 1 }])
        else if (path.startsWith('/whatsapp/') && method === 'POST') response = respond(true)
        else if (path === '/logout') response = respond(null)
        else if (path === '/sign-in') response = respond(null, 401)
        /* Lo no previsto contesta vacío: la pantalla abre en su estado «sin datos», que también hay que ver */
        else { known = false; response = respond(method === 'GET' ? page([]) : null) }

        calls.push({ method, path: path + (url.search || ''), mocked: known })
        return response
    }
}
