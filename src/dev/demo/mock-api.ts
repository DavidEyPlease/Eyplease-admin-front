// SÓLO DEV: una API de mentira para recorrer el PANEL sin sesión ni contraseñas, igual que el
// simulador de la web de clientas. Todo lo que se ve aquí es de EJEMPLO (gente y cifras inventadas):
// sirve para revisar el marco y las pantallas, no para leer el negocio. No entra en el build.

import demoBaseImg from './retos/base-ejemplo.jpg'
import demoPieceImg from './retos/pieza-ejemplo.jpg'
import demoCumpleBaseImg from './plantillas-base/cumple-base.jpg'
import demoCumplePieceImg from './plantillas-base/cumple-pieza.jpg'

const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d = now) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const iso = (minutesAgo = 0) => new Date(now.getTime() - minutesAgo * 60000).toISOString()
const period = (back = 0) => { const d = new Date(now.getFullYear(), now.getMonth() - back, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

/* El cierre de mes de EJEMPLO: quien ya pasó su día de pago va tarde y el resto sigue en tiempo (a principios de mes,
   casi todas); una se salva por su promesa de pago y una paga en pesos colombianos */
const demoMonthClose = { enabled: false }
const monthClosePreview = () => {
    const closing = period(0)
    const next = (() => { const d = new Date(now.getFullYear(), now.getMonth() + 1, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` })()
    const row = (n: number, name: string, total: number, payDay: number, nextAmount: number, extra: Record<string, unknown> = {}) => ({
        user_id: `u-mc-${n}`, account: `EJ-0${String(n).padStart(2, '0')}`, name, email: `ejemplo${n}@ejemplo.com`,
        owed: [{ period: closing, amount: total, status: now.getDate() > payDay ? 'overdue' : 'pending' }], total, currency: 'MXN',
        days_late: Math.max(0, now.getDate() - payDay), next_period: next, next_amount: nextAmount, ...extra,
    })
    return {
        period: closing, next_period: next, enabled: demoMonthClose.enabled,
        pause: [
            row(1, 'Clienta de ejemplo Uno', 349, 1, 349),
            row(2, 'Clienta de ejemplo Dos', 377, 2, 659, { owed: [{ period: closing, amount: 377, status: 'partial' }] }),
            row(3, 'Clienta de ejemplo Tres', 969, 5, 969),
            row(4, 'Clienta de ejemplo Cuatro', 349, 10, 349, { email: null }),
            row(6, 'Clienta de ejemplo Seis', 99, 15, 99),
            row(7, 'Clienta de ejemplo Siete', 659, 15, 659),
            row(8, 'Clienta de ejemplo Ocho', 349, 20, 349),
            row(9, 'Clienta de ejemplo Nueve', 179900, 20, 179900, { currency: 'COP' }),
            row(10, 'Clienta de ejemplo Diez', 349, 25, 349, { days_late: null }),
        ],
        spared: [row(5, 'Clienta de ejemplo Cinco', 659, 1, 659, { reason: 'promesa de pago hasta el 5 de octubre' })],
    }
}
const monthCloseMail = (row: { name: string, total: number, next_amount: number }) => `<!doctype html><html lang="es"><body style="margin:0;padding:32px;background:#f4f4f5;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:40px"><h1 style="font-size:22px;color:#18181b">¡Hola, ${row.name.split(' ')[0]}!</h1><p style="color:#52525b;font-size:15px;line-height:1.6">Correo de EJEMPLO (el real lo arma la API): su cuenta quedó en pausa. Para volver: $${row.total} pendientes + $${row.next_amount} del mes en curso.</p></div></body></html>`

const today = now.getDate()

/* Crecimiento de EJEMPLO: gente inventada. La bitácora vive en memoria mientras la pestaña esté abierta */
const growthContacts: Array<{ id: string, target: string, action: string, at: string, plan_interest?: boolean }> = []
const growthPlans = { standard: { id: 'ps', name: 'Standard', price: 99 }, basico: { id: 'pb', name: 'Básico', price: 349 }, ejecutivo: { id: 'pe', name: 'Ejecutivo', price: 659 } }
const gp = (n: number, group: string, name: string, extra: Record<string, unknown>) => ({
    key: `user:u-g${n}`, kind: 'account', id: `u-g${n}`, group, name, account: `EJ-09${String(n).padStart(2, '0')}`, profile: 'Directora', rank: 'Directora de Ventas',
    phone: `44231${String(80000 + n * 137).slice(0, 5)}`, country_code: 'MEX', email: `prospecto${n}@ejemplo.com`, plan: { name: 'Plan Gratis', free: true, price: 0 }, on_trial: false,
    source: 'instagram', registered_at: iso(9 * 1440), last_activity_at: iso(120), uses_app: true, signals: [], suggested_plan: growthPlans.basico, contact: null, ...extra,
})
const growthProspects = () => {
    const items = [
        gp(1, 'lista', 'Laura Méndez Ortiz', { signals: ['Llegó al tope: 10 de 10 clientas', 'Compartió 14 piezas', 'Subió 2 reportes'] }),
        gp(2, 'lista', 'Karina Ríos Salazar', { rank: 'Directora Ejecutiva', source: 'invitacion', registered_at: iso(4 * 1440), signals: ['La invitó Ana Luisa Pérez (EJ-0231)', 'Pidió el Plan Ejecutivo', 'Subió 1 reporte'], suggested_plan: growthPlans.ejecutivo }),
        gp(3, 'lista', 'Patricia Solís Vega', { profile: 'Consultora', rank: 'Consultora de Belleza', source: 'facebook', registered_at: iso(12 * 1440), plan: { name: 'Plan Gratis Consultora', free: true, price: 0 }, signals: ['Llegó al tope: 5 de 5 clientas', 'Compartió 6 piezas'], suggested_plan: growthPlans.standard }),
        { key: 'wa:5214772210000', kind: 'whatsapp', id: '5214772210000', group: 'lista', name: 'Guadalupe Herrera', account: null, profile: 'Consultora', rank: null, phone: '5214772210000', country_code: null, email: null, plan: null, on_trial: false, source: 'whatsapp', registered_at: iso(6 * 1440), last_activity_at: iso(300), uses_app: false, signals: ['Escribió al WhatsApp', 'El bot la marcó como interesada', 'Le interesa: felicitar a sus clientas'], suggested_plan: null, contact: null, bot_stage: 'calificado' },
        gp(5, 'nueva', 'Mónica Salgado', { source: 'invitacion', registered_at: iso(180), last_activity_at: iso(170), uses_app: false, signals: ['La invitó Karla Núñez (EJ-0412)', 'Sin reporte cargado'] }),
        gp(6, 'nueva', 'Irma Fuentes', { profile: 'Consultora', rank: 'Consultora de Belleza', registered_at: iso(1300), uses_app: false, phone: null, plan: { name: 'Plan Gratis Consultora', free: true, price: 0 }, signals: [], suggested_plan: growthPlans.standard }),
        gp(7, 'fria', 'Adriana Villegas', { registered_at: iso(11 * 1440), last_activity_at: iso(11 * 1440 - 30), uses_app: false, signals: ['Sin reporte cargado'] }),
        gp(8, 'fria', 'Claudia Ibarra', { profile: 'Consultora', rank: 'Consultora de Belleza', source: 'directo', registered_at: iso(8 * 1440), last_activity_at: null, uses_app: false, plan: { name: 'Plan Gratis Consultora', free: true, price: 0 }, signals: [], suggested_plan: growthPlans.standard }),
        gp(9, 'fria', 'Norma Ledesma', { source: 'facebook', registered_at: iso(6 * 1440), last_activity_at: iso(6 * 1440 - 20), uses_app: false, signals: ['Sin reporte cargado'] }),
        gp(10, 'calentando', 'Rosa María Treviño', { registered_at: iso(7 * 1440), signals: ['Revisó los planes 2 veces', 'Compartió 3 piezas', 'Subió 1 reporte'] }),
        gp(11, 'calentando', 'Verónica Almaraz', { source: 'facebook', registered_at: iso(10 * 1440), signals: ['Registró 2 clientas', 'Sin reporte cargado'] }),
        gp(12, 'calentando', 'Elena Castañeda', { profile: 'Consultora', rank: 'Consultora de Belleza', source: 'invitacion', registered_at: iso(5 * 1440), plan: { name: 'Plan Gratis Consultora', free: true, price: 0 }, signals: ['Registró 3 clientas'], suggested_plan: growthPlans.standard }),
    ].map(item => {
        const last = [...growthContacts].reverse().find(contact => contact.target === item.key)
        return last ? { ...item, contact: { id: last.id, action: last.action, note: null, at: last.at, by: 'Administración Demo' } } : item
    }).filter(item => !item.contact || item.contact.action === 'written')
    const summary = Object.fromEntries(['lista', 'nueva', 'fria', 'calentando'].map(group => [group, items.filter(item => item.group === group).length]))
    return { items, summary, bot: { allowed: true, available: true }, days: 60, generated_at: iso(0) }
}

/* Redes de EJEMPLO: el calendario vive en memoria; publicar no toca Meta */
const socialDay = (offset: number, hour: number) => { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, 0, 0); return d.toISOString() }
const socialPosts: Array<Record<string, unknown>> = [
    { id: 'sp-1', title: 'Tu asistente, a distancia', pillar: 'app', format: 'carousel', channels: ['ig', 'fb'], caption: 'Le escribes «¿quién de mi unidad cumple años esta semana?» y te contesta con nombres y su pieza lista.\nDescárgala gratis → liga en la bio', media: [{ url: demoPieceImg, type: 'image' }, { url: demoBaseImg, type: 'image' }], scheduled_at: socialDay(-1, 19), status: 'published', change_note: null, approved_at: iso(3000), approved_by: 'Administración Demo', created_by: 'Claude', published_at: socialDay(-1, 19), results: { ig: { id: '1', permalink: 'https://www.instagram.com/' }, fb: { id: '2', permalink: 'https://www.facebook.com/' } }, last_error: null, attempts: 1, metrics: { ig: { reach: 4210, likes: 212, comments: 9, saved: 96, shares: 14 }, fb: { reach: 1880, likes: 64, comments: 3, shares: 5 } }, metrics_at: iso(40) },
    { id: 'sp-2', title: 'El mes pasado perdiste horas', pillar: 'dolor', format: 'post', channels: ['ig', 'fb'], caption: 'El mes pasado perdiste horas diseñando. Ese tiempo no vuelve.\nEste mes que lo haga tu asistente → liga en la bio.', media: [{ url: demoPieceImg, type: 'image' }], scheduled_at: socialDay(1, 19), status: 'review', change_note: null, approved_at: null, approved_by: null, created_by: 'Claude', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null },
    { id: 'sp-3', title: 'Rocío: «mi asistente a distancia»', pillar: 'prueba', format: 'story', channels: ['ig'], caption: '', media: [{ url: demoBaseImg, type: 'image' }], scheduled_at: socialDay(2, 13), status: 'review', change_note: null, approved_at: null, approved_by: null, created_by: 'Claude', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null },
    { id: 'sp-4', title: 'Ejemplos reales de septiembre', pillar: 'app', format: 'carousel', channels: ['ig', 'fb'], caption: 'Seis piezas que salieron de la app este mes.', media: [{ url: demoPieceImg, type: 'image' }, { url: demoBaseImg, type: 'image' }], scheduled_at: socialDay(4, 12), status: 'scheduled', change_note: null, approved_at: iso(60), approved_by: 'Administración Demo', created_by: 'Claude', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null },
    { id: 'sp-5', title: '5 cosas que tu unidad agradece', pillar: 'tip', format: 'carousel', channels: ['ig', 'fb'], caption: null, media: [], scheduled_at: socialDay(6, 11), status: 'production', change_note: 'La portada más cálida', approved_at: null, approved_by: null, created_by: 'Claude', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null },
    { id: 'sp-6', title: 'Círculo Rosa: el lugar al que llegas', pillar: 'reconocimiento', format: 'post', channels: ['ig', 'fb'], caption: null, media: [], scheduled_at: null, status: 'idea', change_note: null, approved_at: null, approved_by: null, created_by: 'Claude', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null },
]
const socialPillars = [['app', 'La app en acción', 5], ['prueba', 'Prueba social', 4], ['dolor', 'Dolor → alivio', 3], ['tip', 'Tip de valor', 3], ['adentro', 'Desde adentro', 2], ['reconocimiento', 'Reconocimiento', 2]] as const
const socialCalendar = (from: string, to: string) => {
    const inRange = (post: Record<string, unknown>) => !post.scheduled_at ? post.status !== 'published' : String(post.scheduled_at).slice(0, 10) >= from && String(post.scheduled_at).slice(0, 10) <= to
    const published = socialPosts.filter(post => post.status === 'published')
    const reach = (post: Record<string, unknown>) => { const m = post.metrics as { ig?: { reach?: number }, fb?: { reach?: number } } | null; return (m?.ig?.reach ?? 0) + (m?.fb?.reach ?? 0) }
    return {
        items: socialPosts.filter(inRange), from, to,
        month: {
            label: now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }), planned: socialPosts.filter(post => post.status !== 'idea').length, published: published.length,
            reach: published.reduce((sum, post) => sum + reach(post), 0),
            pillars: socialPillars.map(([key, label, target]) => ({ key, label, target, count: socialPosts.filter(post => post.pillar === key).length })),
            arrivals: { instagram: 4, facebook: 1 },
            best: published.map(post => ({ id: post.id, title: post.title, format: post.format, thumb: (post.media as Array<{ url: string }>)[0]?.url ?? null, published_at: post.published_at, reach: reach(post), metrics: post.metrics })),
        },
        pillars: socialPillars.map(([key, label]) => ({ key, label })),
        meta: { ready: true, page: 'EyPlease', instagram: 'eyplease.mx' },
    }
}
const growthFunnel = (period: string) => {
    const scale = period === 'trimestre' ? 7 : period === 'mes' ? 3 : 1
    const bySource = [
        { source: 'invitacion', registered: 5 * scale, uses: 4 * scale, pays: 2 * scale, monthly: 698 * scale },
        { source: 'instagram', registered: 14 * scale, uses: 7 * scale, pays: 1 * scale, monthly: 349 * scale },
        { source: 'facebook', registered: 9 * scale, uses: 4 * scale, pays: 1 * scale, monthly: 99 * scale },
        { source: 'directo', registered: 6 * scale, uses: 3 * scale, pays: 0, monthly: 0 },
        { source: 'whatsapp', registered: 4 * scale, uses: 3 * scale, pays: 0, monthly: 0 },
    ]
    const sum = (key: 'registered' | 'uses' | 'pays' | 'monthly') => bySource.reduce((total, row) => total + row[key], 0)
    const current = { registered: sum('registered'), uses: sum('uses'), wants: 9 * scale, pays: sum('pays'), lost: 15 * scale, monthly: sum('monthly'), by_source: bySource }
    return { period, from: iso(7 * 1440 * scale), to: iso(0), current, previous: { registered: 29 * scale, uses: 16 * scale, wants: 6 * scale, pays: 3 * scale, lost: 12 * scale, monthly: 1047 * scale } }
}

const me = {
    id: 'demo-admin', name: 'Administración Demo', email: 'demo@ejemplo.com', profile_picture: null, username: 'DEMOADMIN',
    country: 'MEX', phone: '0000000000', on_notifications: true, on_biometric_auth: false,
    role: { id: 'role-demo', name: 'Super administrador', role_key: 'super_admin', permissions: [] },
}

const revenue = (back: number, collected: number, outstanding: number) => ({
    period: period(back), collected, outstanding, paid_count: 61, overdue_count: back ? 0 : 4, in_review_count: back ? 0 : 3, pending_count: back ? 0 : 12, total_count: 80,
    card_pending_count: back ? 0 : 5, card_pending_total: back ? 0 : 2900,
})

/* Las diarias que la API vigila de verdad (PostCoverageService::DAILY_SCHEDULE) */
const daily = ([['early', 'Ordenantes del mes', '09:00'], ['birthdays', 'Cumpleaños', '20:00'], ['anniversaries', 'Aniversarios', '20:00']] as Array<[string, string, string]>).map(([key, name, scheduled_at], index) => {
    const [h, m] = scheduled_at.split(':').map(Number)
    const due = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
    return {
        key, name, scheduled_at, ran_today: due, today_status: due ? (key === 'birthdays' ? 'partial' : key === 'anniversaries' ? 'empty' : 'ok') : 'scheduled', failed_today: due && key === 'birthdays' ? 3 : 0, empty_days: key === 'anniversaries' ? [2, 9, ...(due ? [today] : [])] : [],
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
/* Colombia (`?country=COL`): una clienta de ejemplo, su dinero en pesos colombianos y nada pendiente;
   las corridas diarias son las mismas (maquinaria compartida) */
const colombiaOverview = {
    ...overview,
    country: 'COL',
    revenue: {
        current: { ...revenue(0, 0, 179900), currency: 'COP', card_pending_count: 0, card_pending_total: 0 },
        previous: { ...revenue(1, 179900, 0), currency: 'COP' },
    },
    publishing: { ...overview.publishing, monthly: { covered: 2, total: 11, missing: [] } },
    service_requests: { new: 0, in_review: 0, latest: [] },
    corrections: { count: 1, latest: [request(590, 'Invitación · Colombia', 'Clienta de ejemplo en Colombia', 0)] },
    clients: { active: 1, inactive: 0, new_this_month: 1 },
}
const countryAttention = [{ country: 'MEX', attention: 4 }, { country: 'COL', attention: 1 }]

const notifications = {
    unread: { whatsapp: 6, service_requests: 3, corrections: 1, delivery_failures: 0, card_failures: 1 }, unread_total: 11,
    seen_at: { whatsapp: null, service_requests: null, corrections: null, delivery_failures: null, card_failures: null },
    items: [
        { id: 'n1', channel: 'whatsapp', title: 'Clienta de ejemplo A', detail: '¿Ya quedó mi invitación?', at: iso(12), count: 2, ref: null },
        { id: 'n2', channel: 'service_requests', title: '#581 Invitación · Junta de unidad', detail: 'Sin asignar', at: iso(40), count: 1, ref: 'task-581' },
        { id: 'n3', channel: 'corrections', title: '#572 Invitación · cambiar la hora', detail: 'Pidió corrección', at: iso(95), count: 1, ref: 'task-572' },
        { id: 'n4', channel: 'card_failures', title: 'Clienta de ejemplo C', detail: '2026-09 · $659 · Su tarjeta está vencida', at: iso(180), count: 1, ref: 'EJ-003' },
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
/* Colombia (`?country=COL`): sólo las ventas del día (los Corazones no existen allá) y nada bajado todavía */
const colombiaDailyReports = dailyReports.filter(report => report.section_key === 'early').map(report => ({ ...report, usual: 0, loaded: 0, last_at: null }))

/* Finanzas: resumen y balance con la forma real (las listas de pagos y clientas abren vacías) */
const monthsSoFar = Array.from({ length: now.getMonth() + 1 }, (_, index) => index + 1)
const incomeOf = (month: number) => month === now.getMonth() + 1 ? 48210 : 52000 + ((month * 7919) % 9000)
const summaryMonth = (month: number) => ({
    month, income: incomeOf(month), overdue_total: month === now.getMonth() + 1 ? 5480 : 0, pending_total: month === now.getMonth() + 1 ? 14380 : 0,
    card_pending_total: month === now.getMonth() + 1 ? 2900 : 0, card_pending_count: month === now.getMonth() + 1 ? 5 : 0,
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

/* Publicaciones: cobertura por sección y por clienta, y las últimas corridas. Las cifras son las del
   2-oct-2026 por la mañana (cierre de septiembre), para recorrer cada motivo de «qué falta». */
type DemoArtifact = 'image' | 'image_square' | 'video'
const fmt = (done: number, live: number, pending: number | null, missing = 0, tpl: [number, number] = [1, 1], pausedPending = 0) => ({
    done, live, pending, paused_pending: pausedPending, missing_template_pending: missing, templates_ready: tpl[0], templates_total: tpl[1],
})
const sub = (item_key: string, name: string, formats: Partial<Record<DemoArtifact, { done: number, live: number, pending: number | null, has_template: boolean | null }>>, extra: Record<string, unknown> = {}) => ({
    item_key, name, expected: null, pending: null, posts: 0, with_image: 0, with_video: 0, is_live: false, paused: null, formats, ...extra,
})
const sf = (done: number, pending: number | null, has_template: boolean | null = true, live = 0) => ({ done, live, pending, has_template })
const coverageSection = (section_key: string, name: string, newsletter: 'unit_newsletter' | 'national_newsletter', cadence: 'daily' | 'monthly', scheduled_at: string | null,
    formats: Partial<Record<DemoArtifact, ReturnType<typeof fmt>>>, subsections: unknown[] = [], extra: Record<string, unknown> = {}) => {
    const image = formats.image ?? fmt(0, 0, null)
    const video = formats.video
    return {
        section_key, name, newsletter, cadence, scheduled_at, artifacts: Object.keys(formats), last_activity_at: iso(200), expected: null, pending: null,
        posts: image.done + image.live, with_image: image.done + image.live, with_video: video ? video.done + video.live : 0, notified: image.done,
        live_posts: image.live, paused: null, formats, subsections, ...extra,
    }
}
const HONOR_PAUSE = 'Lo cubre el Cuadro de Honor en vivo (cierre), que ya salió completo'
const QUINTA_PAUSE = '5ª Herramienta apagada desde el 21-sep: falta confirmar la regla con Mary Kay'
const coverageSections = [
    coverageSection('honor_roll', 'Cuadro de Honor', 'unit_newsletter', 'monthly', null,
        { image: fmt(0, 467, 0, 0, [0, 0], 344), image_square: fmt(0, 467, null, 0, [0, 0]), video: fmt(0, 467, 0, 0, [0, 0], 344) },
        [...['consolidated|Top 3', 'queen|1er lugar', 'first-princess|2º lugar', 'second-princess|3er lugar'].map(entry => {
            const [key, name] = entry.split('|')
            return sub(key, name, { image: sf(0, 86, false), video: sf(0, 86, false) }, { paused: HONOR_PAUSE })
        }), ...['live-consolidated|Top 3 · en vivo', 'live-queen|1er lugar · en vivo', 'live-first-princess|2º lugar · en vivo', 'live-second-princess|3er lugar · en vivo'].map(entry => {
            const [key, name] = entry.split('|')
            return sub(key, name, { image: sf(0, null, null, 117), image_square: sf(0, null, null, 117), video: sf(0, null, null, 117) }, { is_live: true })
        })]),
    coverageSection('stars', 'Estrellas', 'unit_newsletter', 'monthly', null,
        { image: fmt(375, 12, 0, 0, [5, 5]), image_square: fmt(375, 12, 0, 0, [5, 5]), video: fmt(362, 12, 13, 0, [5, 5]) },
        [['sapphire', 'Zafiro', 239, 13], ['ruby', 'Rubí', 57, 0], ['diamond', 'Diamante', 36, 0], ['emerald', 'Esmeralda', 33, 0], ['pearl', 'Perla', 10, 0]].map(([key, name, total, videoPending]) =>
            sub(key as string, name as string, { image: sf(total as number, 0), image_square: sf(total as number, 0), video: sf((total as number) - (videoPending as number), videoPending as number) }))),
    coverageSection('new_beginnings', 'Nuevos Inicios', 'unit_newsletter', 'monthly', null,
        { image: fmt(407, 78, 0, 0, [3, 3], 76), image_square: fmt(407, 78, 0, 0, [3, 3], 76), video: fmt(0, 78, 407, 0, [3, 3], 76) },
        [...[['previous-1', '2da Herramienta', 140], ['previous-2', '3era Herramienta', 139], ['previous-3', '4ta Herramienta', 128]].map(([key, name, total]) =>
            sub(key as string, name as string, { image: sf(total as number, 0), image_square: sf(total as number, 0), video: sf(0, total as number) })),
        sub('previous-4', '5ta Herramienta', { image: sf(0, 76, false), image_square: sf(0, 76, false), video: sf(0, 76, false) }, { paused: QUINTA_PAUSE }),
        sub('welcome', 'Bienvenida', { image: sf(0, null, null, 78), image_square: sf(0, null, null, 78), video: sf(0, null, null, 78) }, { is_live: true })]),
    coverageSection('pink_circle', 'Círculo Rosa', 'unit_newsletter', 'monthly', null,
        { image: fmt(0, 1852, 220, 220, [0, 5]), image_square: fmt(0, 1852, null, 0, [0, 0]), video: fmt(0, 1348, 328, 328, [0, 5]) },
        [sub('pink-target', 'Target Rosa', { image: sf(0, 220, false), video: sf(0, 220, false) }), sub('pink-vip', 'Rosa Vip', { image: sf(0, 0, false), video: sf(0, 8, false) }),
            sub('pink-vip-plus', 'Rosa Vip Plus', { image: sf(0, 0, false), video: sf(0, 12, false) }), sub('pink-gold', 'Rosa Gold', { image: sf(0, 0, false), video: sf(0, 88, false) })]),
    coverageSection('road_to_success', 'Camino al Éxito', 'unit_newsletter', 'monthly', null,
        { image: fmt(0, 0, 649, 649, [0, 3]), video: fmt(0, 0, 649, 649, [0, 3]) },
        [['future-director', 'Futura Directora', 117], ['target-future-director', 'Target Futura Directora', 499], ['target-diqs', "Target DIQ's", 33]].map(([key, name, total]) =>
            sub(key as string, name as string, { image: sf(0, total as number, false), video: sf(0, total as number, false) }))),
    coverageSection('diqs', "DIQ's", 'unit_newsletter', 'monthly', null, { image: fmt(0, 0, null, 0, [0, 0]), video: fmt(0, 0, null, 0, [0, 0]) }),
    coverageSection('honor_roll_national', 'Cuadro de Honor nacional', 'national_newsletter', 'monthly', null,
        { image: fmt(0, 0, 104, 104, [0, 8]), video: fmt(0, 0, 104, 104, [0, 8]) }),
    coverageSection('sales_cut', 'Corte de ventas', 'national_newsletter', 'monthly', null,
        { image: fmt(43, 0, 0), image_square: fmt(43, 0, 0), video: fmt(34, 0, 9) }),
    coverageSection('national_initiation_cut', 'Corte de iniciación', 'national_newsletter', 'monthly', null,
        { image: fmt(128, 0, 0), image_square: fmt(128, 0, 0), video: fmt(0, 0, 128) }),
    coverageSection('target_unit_club', 'Club de unidades', 'national_newsletter', 'monthly', null,
        { image: fmt(20, 0, 0, 0, [3, 3]), image_square: fmt(20, 0, 0, 0, [3, 3]), video: fmt(0, 0, 20, 0, [3, 3]) }),
    coverageSection('early', 'Ordenantes del mes', 'unit_newsletter', 'daily', '09:00', { image: fmt(0, 0, null, 0, [1, 1]), image_square: fmt(0, 0, null, 0, [1, 1]) }),
    coverageSection('birthdays', 'Cumpleaños', 'unit_newsletter', 'daily', '20:00', { image: fmt(49, 0, 30), image_square: fmt(49, 0, 30), video: fmt(49, 0, 30) }),
    coverageSection('anniversaries', 'Aniversarios', 'unit_newsletter', 'daily', '20:00', { image: fmt(8, 0, 1), image_square: fmt(8, 0, 1), video: fmt(8, 0, 1) }),
    coverageSection('national_birthdays', 'Cumpleaños nacionales', 'national_newsletter', 'daily', '20:00', { image: fmt(4, 0, 1), image_square: fmt(4, 0, 1), video: fmt(4, 0, 1) }),
]
const postsCoverage = { period: period(0), snapshot_at: iso(8), current_target_period: period(0), sections: coverageSections }
/* Por clienta: ocho de ejemplo con casos distintos (todo salió, le falta un formato, sin pieza y una sin
   reporte importado). Las secciones nacionales sólo las incluye el plan Nacional. */
const NATIONAL_KEYS = coverageSections.filter(section => section.newsletter === 'national_newsletter').map(section => section.section_key)
const demoClient = (n: number, name: string, plan: string, holes: Record<string, 'empty' | 'partial'>) => {
    const cells = Object.fromEntries(coverageSections.map(section => [section.section_key,
        plan !== 'Plan Nacional' && NATIONAL_KEYS.includes(section.section_key) ? 'not_included' : holes[section.section_key] ?? 'full']))
    return { client_id: `c-${n}`, client_name: name, client_account: `EJ-00${n}`, plan_name: plan, cells, gaps: Object.values(cells).filter(state => state === 'empty' || state === 'partial').length }
}
const clientCoverage = {
    period: period(0), columns: coverageSections.map(section => ({ section_key: section.section_key, name: section.name, newsletter: section.newsletter, requires_video: section.artifacts.includes('video') })),
    items: [
        demoClient(1, 'Clienta de ejemplo Uno', 'Plan Elite', { stars: 'empty', pink_circle: 'empty', road_to_success: 'empty', new_beginnings: 'empty', birthdays: 'empty' }),
        demoClient(2, 'Clienta de ejemplo Dos', 'Plan Nacional', { honor_roll_national: 'empty', road_to_success: 'empty', national_initiation_cut: 'partial' }),
        demoClient(3, 'Clienta de ejemplo Tres', 'Plan Ejecutivo', { road_to_success: 'empty', new_beginnings: 'partial' }),
        demoClient(4, 'Clienta de ejemplo Cuatro', 'Plan Elite', { pink_circle: 'empty', stars: 'partial' }),
        demoClient(5, 'Clienta de ejemplo Cinco', 'Plan Básico', { road_to_success: 'empty' }),
        demoClient(6, 'Clienta de ejemplo Seis', 'Plan Elite', { new_beginnings: 'partial' }),
        demoClient(7, 'Clienta de ejemplo Siete', 'Plan Ejecutivo', {}),
        demoClient(8, 'Clienta de ejemplo Ocho', 'Plan Básico', {}),
    ],
    total_items: 8, per_page: 20, current_page: 1, last_page: 1,
}
/* A su hora de HOY, y sólo lo que ya pasó: la demo tiene que cuadrar con el reloj de quien la mira */
const at = (h: number, m: number) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d }
const passed = (h: number, m: number) => at(h, m).getTime() <= now.getTime()
const postRun = (id: string, section_key: string, section_name: string, sub_section: string | null, artifact: DemoArtifact, total: number, processed: number, status: string, startedAgo: number, progressAgo: number, by: string | null = 'Claude Admin') => ({
    id, section_key, section_name, sub_section, artifact, total_jobs: total, processed_jobs: processed, succeeded_jobs: processed, failed_jobs: 0, status,
    trigger_source: by ? 'manual' : 'cron', triggered_by: by, started_at: iso(startedAgo), finished_at: status === 'running' ? null : iso(progressAgo), updated_at: iso(progressAgo), error_summary: null,
})
const postRuns = [
    postRun('r1', 'sales_cut', 'Corte de ventas', null, 'video', 43, 34, 'running', 70, 6),
    postRun('r2', 'stars', 'Estrellas', 'sapphire', 'video', 13, 0, 'running', 310, 310),
    postRun('r3', 'new_beginnings', 'Nuevos inicios', 'previous-1', 'video', 140, 0, 'running', 570, 570),
    postRun('r4', 'new_beginnings', 'Nuevos inicios', 'previous-2', 'video', 139, 0, 'running', 571, 571),
    postRun('r5', 'national_initiation_cut', 'Corte de iniciación', null, 'image', 128, 128, 'completed', 75, 30),
    postRun('r6', 'sales_cut', 'Corte de ventas', null, 'image_square', 43, 43, 'completed', 80, 75),
    postRun('r7', 'new_beginnings', 'Nuevos inicios', 'previous-1', 'image_square', 140, 140, 'completed', 575, 560),
    postRun('r8', 'honor_roll', 'Cuadro de Honor', 'live-consolidated', 'image', 25, 25, 'completed', 1300, 1290, null),
]

/* El robot: la descarga de la mañana, la de corazones (deja 2 colgadas) y su reintento */
const downloadRuns = ([
    ['dr-1', ['early'], null, 29, 29, 0, 6, 0], ['dr-2', ['pink_circle_hearts', 'pink_circle_vip_plus'], null, 196, 194, 2, 11, 30], ['dr-3', ['pink_circle_hearts'], ['EJ-001', 'EJ-002'], 2, 2, 0, 12, 30],
] as Array<[string, string[], string[] | null, number, number, number, number, number]>).filter(([, , , , , , h, m]) => passed(h, m)).map(([run_id, sections, clients, total, uploaded, failed, h, m]) => ({
    run_id, process: 'daily', sections, clients, reset: false, status: 'completed', result: { total, uploaded, failed, skipped: 0 }, error: null, queued_at: at(h, m).toISOString(), finished_at: at(h, m + 4).toISOString(),
})).reverse()

/* Una pieza de mentira: un mosaico con su rótulo, sin imágenes de nadie */
const tile = (label: string, a: string, b: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="190" r="70" fill="rgba(255,255,255,.22)"/><rect x="90" y="300" width="220" height="18" rx="9" fill="rgba(255,255,255,.55)"/><rect x="130" y="332" width="140" height="12" rx="6" fill="rgba(255,255,255,.35)"/><text x="200" y="440" text-anchor="middle" font-family="system-ui" font-size="22" font-weight="800" fill="rgba(255,255,255,.85)">${label}</text></svg>`)}`
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

const plans = ['A', 'B', 'C'].map((letter, index) => ({ id: `plan-${index}`, name: `Plan de ejemplo ${letter}`, price: [690, 990, 1490][index], currency: 'MXN' as string, active: true, free: false, is_default: index === 0, features: [], accesses: [], color: ['#6C47FF', '#2CD4D9', '#E5077D'][index], clients_count: [41, 33, 24][index], created_at: iso(60 * 24 * 200) }))

const demoDesigners = ['Ana Ejemplo', 'Beto Ejemplo', 'Carla Ejemplo'].map((name, index) => ({ id: `d-${index}`, name, email: `d${index}@ejemplo.com`, profile_picture: null, photo: null, username: `DIS${index}`, country: 'MEX', phone: '', active: true, on_notifications: true, on_biometric_auth: false, role: { id: 'r-des', name: 'Diseñador', role_key: 'designer', permissions: [] } }))

/* Los catálogos que el panel carga al entrar: sin ellos Tareas truena al pintar sus filtros */
const utilData = {
    plans, designers: demoDesigners, training_categories: [], newsletters: [],
    task_types: [{ id: 'tt-1', name: 'Solicitud de clienta', slug: 'user-service-request' }, { id: 'tt-2', name: 'Biblioteca', slug: 'tools' }, { id: 'tt-3', name: 'Entrenamientos', slug: 'trainings' }],
    task_statuses: [['Sin asignar', 'unassigned'], ['En proceso', 'in-progress'], ['Lista para revisión', 'ready-for-review'], ['Corrección', 'correction'], ['Completada', 'completed'], ['Lista para publicar', 'ready-for-publish'], ['Subir recursos AE', 'upload_ae_resources'], ['Publicada', 'published']].map(([name, slug], index) => ({ id: `ts-${index}`, name, slug })),
}

/* Lo que se pidió, de EJEMPLO: los pedidos de clienta llegan del Asistente en renglones «Campo: valor» */
const demoBrief = (consecutive: number, title: string, type: number) => {
    const [piece, ...rest] = title.split(' · ')
    if (consecutive === 597) return null
    if (type === 0) return [`Tipo de pieza: ${piece}`, `Asunto: ${rest.join(' · ') || piece}`, consecutive === 581 ? 'Datos: junta con las nuevas estrellas del mes, que se note la celebración' : 'Nota: pedido de EJEMPLO para revisar la ficha', 'Formato: historia y publicación'].join('\n')
    if (type === 1) return `Diseño para la biblioteca de las clientas: ${title}. Texto e imagen de EJEMPLO; se personaliza con la foto de cada una.`
    return `Material de entrenamiento: ${title}. Pedido de EJEMPLO.`
}

const demoMetadata = (consecutive: number, type: number, days: number): Record<string, unknown> => {
    if (consecutive === 597) return { kind: 'clone_reel', topic: 'Rutina de noche en tres pasos', script: null, product: 'TimeWise Repair', audience: 'clientas', variants: 2 }
    if (type === 0) return consecutive % 2 ? { primaryColor: '#6C47FF', secondaryColor: '#F9A8D4' } : {}
    if (type === 1) return { tools_section: consecutive === 189 ? 'get_started' : 'learn', plan_ids: consecutive % 2 ? ['plan-0', 'plan-1', 'plan-2'] : ['plan-1', 'plan-2'], publication_date: dueIn(days) }
    return {}
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
    /* Como en la vida real: lo que lleva MESES esperando el visto bueno y más entregados en el mes */
    [4, 'Premios trimestrales', 2, 1, -246, 2, 0], [41, 'Entérate Ya · marzo', 2, 2, -210, 2, 0], [189, 'Frases para comenzar en Mary Kay', 1, 1, -141, 2, 0],
    [592, 'Flyer · Promo de reactivación', 2, 0, -1, null, 1], [594, 'Invitación · Desayuno de estrellas', 2, 0, -4, null, 2],
    [548, 'Historia · Tip de maquillaje', 7, 1, -10, 2, 0], [545, 'Carrusel · Rutina de noche', 7, 1, -12, 0, 1], [541, 'Reconocimiento · Reina del mes', 4, 0, -14, 1, 1], [538, 'Publicación · Frase del viernes', 7, 1, -16, 2, 0],
    /* Un reel con su clon: pedido de clienta que se distingue por su metadata */
    [597, 'Reel con mi clon · Rutina de noche', 1, 0, 1, 0, 0],
] as Array<[number, string, number, number, number, number | null, number]>).map(([consecutive, title, status, type, days, designer, files]) => ({
    id: `task-${consecutive}`, consecutive, title, description: demoBrief(consecutive, title, type) as string | null,
    started_at: dueIn(days - 1, 9), expired_at: dueIn(days), task_status: utilData.task_statuses[status], task_type: utilData.task_types[type],
    created_by: type === 0 ? { id: `u-${consecutive % 10}`, name: `CLIENTA DE EJEMPLO ${'ABCDEFGHIJ'[consecutive % 10]}` } : { id: 'demo-admin', name: 'Administración Demo' },
    assigned_to: designer === null ? null : demoDesigners[designer] as (typeof demoDesigners)[number] | null, files: Array.from({ length: files }, (_, index) => ({ id: `f-${consecutive}-${index}` })),
    metadata: demoMetadata(consecutive, type, days) as Record<string, unknown>,
    created_at: iso((5 - days) * 1440), updated_at: iso(30),
    /* Desde cuándo espera: lo entregado a revisión, desde su entrega */
    last_activity_at: iso(Math.max(0, -days) * 1440 + 90), completed_at: [4, 5, 7].includes(status) ? dueIn(days) : null,
}))
type DemoTask = (typeof demoTasks)[number]

/* La ficha: archivos (diseños del equipo y lo que mandó la clienta), plantillas de Nexrender y la conversación de
   cada pedido. Se arman la primera vez que se abre y luego cambian de verdad (subir, borrar, ordenar, comentar). */
type DemoPerson = { id: string, name: string, profile_picture?: null }
type DemoFile = { id: string, uploaded_by: DemoPerson, file: { id: string, url: string, uri: string, name: string, ext: string, sort: number }, file_type: string | null, template_asset_type: string | null, created_at: string }
type DemoActivity = { id: string, activity_type: string, activity_description: string, user: DemoPerson | null, created_at: string }
const demoFiles = new Map<string, DemoFile[]>()
const demoActivity = new Map<string, DemoActivity[]>()
let demoSeq = 0
const demoId = (prefix: string) => `${prefix}-${++demoSeq}`
const PALETTES: Array<[string, string]> = [['#6C47FF', '#2CD4D9'], ['#E5077D', '#6C47FF'], ['#F59E0B', '#E5077D'], ['#4E31C0', '#2CD4D9'], ['#10B981', '#2CD4D9']]
const slugOf = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28)

const demoFile = (task: DemoTask, name: string, by: DemoPerson, sort: number, minutesAgo: number, fileType: string | null = 'image', label?: string): DemoFile => {
    const ext = name.split('.').pop() ?? 'png'
    const [a, b] = PALETTES[(task.consecutive + sort) % PALETTES.length]
    return {
        id: demoId('att'), uploaded_by: { id: by.id, name: by.name },
        file: { id: demoId('file'), url: fileType === 'nexrender_template' ? '' : tile(label ?? `${ext.toUpperCase()} ${sort + 1}`, a, b), uri: `private/tasks/${task.id}/attachments/${name}`, name, ext, sort },
        file_type: fileType, template_asset_type: fileType === 'nexrender_template' ? 'image' : null, created_at: iso(minutesAgo),
    }
}

const filesOf = (task: DemoTask) => {
    if (!demoFiles.has(task.id)) {
        const designer = task.assigned_to ?? demoDesigners[0]
        const base = slugOf(task.title)
        const list: DemoFile[] = []
        /* Lo que mandó la clienta: su foto y una referencia (sólo en sus pedidos) */
        if (task.task_type.slug === 'user-service-request' && task.created_by && task.consecutive % 3 !== 1) {
            list.push(demoFile(task, 'referencia-que-me-gusta.jpg', task.created_by, list.length, 3 * 1440, null, 'Referencia'))
            if (task.consecutive % 2) list.push(demoFile(task, 'foto-de-la-festejada.jpg', task.created_by, list.length, 3 * 1440 - 5, null, 'Foto'))
        }
        task.files.forEach((_, index) => list.push(demoFile(task, `${base}-${index + 1}.png`, designer, list.length, 1440 - index * 3, 'image', `Propuesta ${index + 1}`)))
        if (task.task_type.slug === 'tools' && task.files.length) list.push(demoFile(task, `biblioteca_${task.consecutive}.zip`, designer, list.length, 600, 'nexrender_template'))
        demoFiles.set(task.id, list)
    }
    return demoFiles.get(task.id)!
}

const activityOf = (task: DemoTask) => {
    if (!demoActivity.has(task.id)) {
        const created = new Date(task.created_at).getTime()
        const at = (hours: number) => new Date(Math.min(Date.now() - 60_000, created + hours * 3_600_000)).toISOString()
        const creator: DemoPerson = task.created_by ?? { id: 'demo-admin', name: 'Administración Demo' }
        const designer: DemoPerson = task.assigned_to ?? demoDesigners[0]
        const list: DemoActivity[] = [{ id: demoId('act'), activity_type: 'created', activity_description: 'ha creado esta tarea', user: creator, created_at: at(0) }]
        const stage = task.task_status.slug
        if (task.assigned_to) {
            list.push({ id: demoId('act'), activity_type: 'updated', activity_description: `ha cambiado el responsable de la tarea a ${designer.name}`, user: { id: 'demo-admin', name: 'Administración Demo' }, created_at: at(1) })
            list.push({ id: demoId('act'), activity_type: 'comment', activity_description: 'Arranco con esto. Si hay foto de la festejada, la uso de fondo.', user: designer, created_at: at(2) })
        }
        filesOf(task).filter(file => file.uploaded_by.id === designer.id && file.file_type !== 'nexrender_template').forEach((file, index) => list.push({ id: demoId('act'), activity_type: 'attachment', activity_description: `Ha agregado el adjunto ${file.file.name}`, user: designer, created_at: at(5 + index * .02) }))
        if (!['unassigned', 'in-progress'].includes(stage)) list.push({ id: demoId('act'), activity_type: 'updated', activity_description: 'ha cambiado el estado de la tarea a Lista para revisión', user: designer, created_at: at(6) })
        if (stage === 'correction') {
            list.push({ id: demoId('act'), activity_type: 'request_correction', activity_description: '¿Me lo cambian a las <b>11:00</b>? La junta se movió. Gracias', user: creator, created_at: at(8) })
            list.push({ id: demoId('act'), activity_type: 'updated', activity_description: 'ha cambiado el estado de la tarea a Corrección', user: creator, created_at: at(8.01) })
        }
        demoActivity.set(task.id, list.sort((a, b) => b.created_at.localeCompare(a.created_at)))
    }
    return demoActivity.get(task.id)!
}

const logActivity = (task: DemoTask, activity_type: string, activity_description: string, user: DemoPerson = { id: me.id, name: me.name }) =>
    activityOf(task).unshift({ id: demoId('act'), activity_type, activity_description, user, created_at: new Date().toISOString() })

/* La invitación de la #581 trae su evento (fecha, hora y lugar), como las que llegan del registro de eventos */
const demoEvent = (task: DemoTask) => task.consecutive !== 581 ? null : {
    id: 'ev-581', title: task.title, description: null, start_date: dueIn(4, 10), event_type: 'presential', service: null, online_data: null,
    event_dates: [{ id: 'evd-1', start_date: dueIn(4, 10), end_date: dueIn(4, 13), location: 'Salón Las Palmas · Av. Juárez 120, Celaya' }],
}

/* XHR hacia el S3 de mentira: la subida de archivos del panel usa XMLHttpRequest (para la barra de progreso), no fetch */
const installDemoUploads = () => {
    const open = XMLHttpRequest.prototype.open
    const send = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest & { demoS3?: boolean }, method: string, url: string | URL, ...rest: unknown[]) {
        this.demoS3 = String(url).startsWith('https://demo-s3.invalid/')
        return (open as (...args: unknown[]) => void).call(this, method, url, ...rest)
    } as typeof XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest & { demoS3?: boolean }, body?: Document | XMLHttpRequestBodyInit | null) {
        if (!this.demoS3) return send.call(this, body)
        const total = body instanceof Blob ? body.size || 1 : 1
        let loaded = 0
        const tick = () => {
            loaded = Math.min(total, loaded + total / 3)
            ;(this.upload.onprogress as ((event: ProgressEvent) => void) | null)?.(new ProgressEvent('progress', { lengthComputable: true, loaded, total }))
            if (loaded < total) return void setTimeout(tick, 180)
            Object.defineProperty(this, 'status', { value: 200, configurable: true })
            ;(this.onload as ((event: ProgressEvent) => void) | null)?.(new ProgressEvent('load'))
        }
        setTimeout(tick, 180)
    }
}

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
/* Una clienta de COLOMBIA, para ver la pestaña de Círculo Rosa de allá (meses con descuento, no corazones) */
demoClients.push({
    ...demoClients[1], id: 'c-10', name: 'Clienta de ejemplo en Colombia', account: 'EJ-COL1', country: 'COL', card_subscription: false,
    /* El plan le llega con el precio de SU país, en pesos colombianos, como lo manda el API */
    user: { ...demoClients[1].user, id: 'u-10', name: 'Clienta de ejemplo en Colombia', username: 'EJ-COL1', country: 'COL', plan: { ...plans[2], price: 278300, currency: 'COP' } },
})

/* Círculo Rosa de Colombia: consultoras INVENTADAS con sus 13 meses, del en curso al más viejo
   (S = llegó al 30%, . = no llegó, ? = en curso y aún no llega). La captura vive en memoria. */
const crCapturas: Record<string, number> = {}
const crGente: Array<[string, string, string]> = [
    ['Consultora de ejemplo Uno', 'A2', '?SSSSSSSSSSSS'], ['Consultora de ejemplo Dos', 'A1', 'SSSSSSSSSSSSS'],
    ['Consultora de ejemplo Tres', 'A2', '?SSSSSSSS.SS.'], ['Consultora de ejemplo Cuatro', 'A2', 'SSS.S...SSSS.'],
    ['Consultora de ejemplo Cinco', 'A2', '?S..S...SSSS.'], ['Consultora de ejemplo Seis', 'A3', '?.S...SS..S.S'],
    ['Consultora de ejemplo Siete', 'T1', '?............'], ['Consultora de ejemplo Ocho', 'P2', '?...S....S...'],
]
const pinkCircleColombia = () => {
    const members = crGente.map(([name, status, strip], index) => {
        const id = `cr-${index}`
        const history = strip.split('').map((letra, back) => ({
            month: period(back), status: letra === 'S' ? 'yes' : letra === '.' ? 'no' : 'pending',
            amount: letra === 'S' ? 690000 + ((index * 7919 + back * 3571) % 900000) : letra === '.' ? ((index + back) % 3) * 150000 : 180000,
        }))
        let seguidos = 0
        while (seguidos + 1 < history.length && history[seguidos + 1].status === 'yes') seguidos++
        const alMenos = seguidos === history.length - 1
        const capturados = crCapturas[id] ?? null
        const months = capturados ?? seguidos
        const reached = history[0].status === 'yes'
        const now = months + (reached ? 1 : 0)
        return {
            id, account: `EJ${index + 1}CO`, name: name.toLowerCase(), status, months, at_least: capturados === null && alMenos, source: capturados === null ? 'report' : 'capture',
            as_of: period(1), current_month_reached: reached, months_now: now, in_circle: now >= 3, next_milestone: [3, 6, 9, 18, 24, 36].find(hito => hito > now) ?? null,
            needs_capture: capturados === null && alMenos && seguidos > 0,
            capture: capturados === null ? null : { months: capturados, as_of: period(1), captured_at: iso(3), captured_by: me.name },
            history,
        }
    }).sort((a, b) => Number(b.needs_capture) - Number(a.needs_capture) || b.months_now - a.months_now || a.name.localeCompare(b.name))
    return {
        report: { current_month: period(0), closed_month: period(1), uploaded_at: `${ymd()} 09:15:00`, threshold: 645000 },
        members,
        totals: { members: members.length, in_circle: members.filter(m => m.in_circle).length, current_month_reached: members.filter(m => m.current_month_reached).length, needs_capture: members.filter(m => m.needs_capture).length },
    }
}

/* Cobros con tarjeta que Stripe no pudo hacer (INVENTADOS): tarjeta vencida, factura por correo y suscripción «sin pagar» */
const cardIssues = [
    { id: 'ci-1', client: { user_id: 'u-2', name: 'CLIENTA DE EJEMPLO C', account: 'EJ-003', phone: '5500000003', country: 'MEX', plan: 'Plan de ejemplo C' }, period: period(0), amount: 659, currency: 'MXN', reason_code: 'expired_card', reason: 'Su tarjeta está vencida', invoice_status: 'open', attempts: 5, payment_url: 'https://invoice.stripe.com/i/EJEMPLO', platform_status: 'overdue', detected_at: iso(60 * 24 * 3) },
    { id: 'ci-2', client: { user_id: 'u-4', name: 'CLIENTA DE EJEMPLO E', account: 'EJ-005', phone: '5500000005', country: 'MEX', plan: 'Plan de ejemplo B' }, period: period(0), amount: 450, currency: 'MXN', reason_code: 'invoice_by_email', reason: 'Stripe le manda la factura por correo (no cobra su tarjeta solo) y no la ha pagado', invoice_status: 'open', attempts: 0, payment_url: 'https://invoice.stripe.com/i/EJEMPLO2', platform_status: 'overdue', detected_at: iso(60 * 5) },
    { id: 'ci-3', client: { user_id: 'u-8', name: 'CLIENTA DE EJEMPLO I', account: 'EJ-009', phone: null, country: 'MEX', plan: 'Plan de ejemplo A' }, period: period(1), amount: 349, currency: 'MXN', reason_code: 'subscription_unpaid', reason: 'Stripe dejó de emitir sus cobros: su suscripción quedó «sin pagar» por un cobro anterior · Último rechazo del banco (31/08): su tarjeta está vencida', invoice_status: 'draft', attempts: 0, payment_url: null, platform_status: 'paid', detected_at: iso(60 * 5) },
]

/* Cobranza con la forma real: cada clienta trae sus pagos por periodo (YYYY-MM). «Aprobar» un
   comprobante lo pasa a pagado de verdad, para poder probar la cola. */
const cur = period(0), prev = period(1)
type DemoPayment = { amount: number, paid: number | null, status: string, paid_at?: string | null, receipt_url?: string | null, reference_number?: string | null, receipt_uploaded_at?: string | null }
/* Diciembre del año pasado: lo que quedó sin pagar se arrastra a la cobranza de este año (y lo pagado no) */
const lastDecember = `${now.getFullYear() - 1}-12`
const financeLedger: Record<string, Record<string, DemoPayment>> = {
    'EJ-003': { [lastDecember]: { amount: 1490, paid: 0, status: 'overdue' }, [prev]: { amount: 1490, paid: 0, status: 'overdue' }, [cur]: { amount: 1490, paid: 0, status: 'overdue' } },
    'EJ-008': { [cur]: { amount: 690, paid: 0, status: 'overdue' } },
    'EJ-005': { [cur]: { amount: 552, paid: 0, status: 'in_review', receipt_url: 'https://example.com/comprobante-de-ejemplo', reference_number: 'EJEMPLO-4471', receipt_uploaded_at: iso(95) } },
    'EJ-001': { [cur]: { amount: 1490, paid: 0, status: 'in_review', receipt_url: 'https://example.com/comprobante-de-ejemplo', reference_number: 'EJEMPLO-9020', receipt_uploaded_at: iso(260) } },
    'EJ-002': { [lastDecember]: { amount: 990, paid: 990, status: 'paid', paid_at: `${lastDecember}-10T18:00:00Z` }, [cur]: { amount: 990, paid: 0, status: 'pending' } }, 'EJ-004': { [cur]: { amount: 690, paid: 0, status: 'pending' } }, 'EJ-009': { [cur]: { amount: 990, paid: 0, status: 'pending' } },
}
/* Bajas con adeudo: cuentas desactivadas que se fueron debiendo (sólo salen con `inactive=1`) */
const financeInactiveLedger: Record<string, Record<string, DemoPayment>> = {
    'EJ-010': { [lastDecember]: { amount: 349, paid: 0, status: 'overdue' }, [period(2)]: { amount: 349, paid: 300, status: 'partial' }, [prev]: { amount: 349, paid: 0, status: 'overdue' } },
}
/* Promesas de pago por cuenta ('YYYY-MM-DD'): una en pie y, al guardarlas, las que se pongan */
const ymdAhead = (days: number) => { const d = new Date(now.getTime() + days * 86400000); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
const financePromises: Record<string, string> = { 'EJ-008': ymdAhead(10) }
/* Cuentas sin día de pago: no tienen ningún mes en su libro, así que sólo salen en «Todas». Una se registró sola
   (sigue en su prueba gratis), a otra la dio de alta el equipo y la tercera está en el plan gratis. */
const financeNewAccounts = [
    { account: 'EJ-N01', name: 'CLIENTA NUEVA DE EJEMPLO (EN PRUEBA)', plan: 'Plan de ejemplo consultora', price: 99, free: false, registered_at: ymdAhead(0), trial_ends_at: ymdAhead(14) as string | null },
    { account: 'EJ-N02', name: 'CLIENTA NUEVA DE EJEMPLO (SIN PRUEBA)', plan: 'Plan de ejemplo A', price: 349, free: false, registered_at: ymdAhead(-20), trial_ends_at: null as string | null },
    { account: 'EJ-N03', name: 'CONSULTORA DE EJEMPLO (PLAN GRATIS)', plan: 'Plan gratis de ejemplo', price: 0, free: true, registered_at: ymdAhead(-6), trial_ends_at: null as string | null },
]
const financePaymentDays: Record<string, number> = {}
/* Como la API: del mes en curso en adelante, el primer cobro que no cae dentro de la prueba gratis */
const firstChargeOn = (day: number, trialEndsAt: string | null) => {
    let year = now.getFullYear(), month = now.getMonth() + 1
    for (;;) {
        const date = `${year}-${pad(month)}-${pad(Math.min(day, new Date(year, month, 0).getDate()))}`
        if (!trialEndsAt || date >= trialEndsAt) return date
        month += 1
        if (month > 12) { month = 1; year += 1 }
    }
}
const newAccountItem = (account: string) => {
    const fresh = financeNewAccounts.find(item => item.account === account)
    if (!fresh) return null
    const day = financePaymentDays[account] ?? null
    const payments = financeLedger[account] ?? {}
    const charge = day ? firstChargeOn(day, fresh.trial_ends_at) : null
    const paidFirst = charge ? payments[charge.slice(0, 7)]?.status === 'paid' : false
    return { id: account, user_id: `u-${account}`, name: fresh.name, plan: fresh.plan, plan_free: fresh.free, fixed_payment: fresh.price, billing_type: 'manual', app_status: 'active', payment_day: day, registered_at: fresh.registered_at, trial_ends_at: fresh.trial_ends_at, phone: null, balance: Object.values(payments).reduce((sum, payment) => sum + (payment.status === 'paid' ? 0 : payment.amount - (payment.paid ?? 0)), 0), promotion: null, next_charge_date: paidFirst ? null : charge, next_charge_amount: charge ? fresh.price : null, promised_until: null, payments }
}
const STATUS_GROUP: Record<string, string[]> = { overdue: ['overdue', 'partial'], in_review: ['in_review'], pending: ['pending'], paid: ['paid'], collectable: ['overdue', 'partial', 'pending', 'in_review'] }
/* Como la API (Payment::forCollectionYear): los periodos del año y lo que quedó SIN PAGAR de años anteriores */
const forCollectionYear = (payments: Record<string, DemoPayment>, year: number) =>
    Object.fromEntries(Object.entries(payments).filter(([p, payment]) => p.startsWith(`${year}-`) || (p < `${year}-01` && payment.status !== 'paid')))
const remainingOf = (payment: DemoPayment) => payment.status === 'paid' ? 0 : Math.max(0, payment.amount - (payment.paid ?? 0))
const financeClients = (status: string, inactive = false, year = now.getFullYear(), country: string | null = null, search = '') => {
    /* «Todas» (sólo las activas): cada cuenta, tenga o no un mes en su libro */
    const everyone = status === 'all' && !inactive
    const wanted = STATUS_GROUP[status] ?? STATUS_GROUP.collectable
    const ledger: Record<string, Record<string, DemoPayment>> = inactive ? financeInactiveLedger
        : everyone ? { ...financeLedger, ...Object.fromEntries(financeNewAccounts.filter(item => !financeLedger[item.account]).map(item => [item.account, {}])) }
        : financeLedger
    const matching = Object.entries(ledger)
        .map(([account, payments]) => [account, forCollectionYear(payments, year)] as const)
        .filter(([, payments]) => everyone || Object.values(payments).some(payment => wanted.includes(payment.status)))
        /* Un país a la vez, como la API (`?country=`) */
        .filter(([account]) => !country || (demoClients.find(item => item.account === account)?.country ?? 'MEX') === country)
        .filter(([account]) => !search || `${demoClients.find(item => item.account === account)?.name ?? financeNewAccounts.find(item => item.account === account)?.name ?? ''} ${account}`.toLowerCase().includes(search.toLowerCase()))
    const items = matching.map(([account, payments], index) => {
        const fresh = newAccountItem(account)
        if (fresh) return { ...fresh, payments }
        const client = demoClients.find(item => item.account === account)
        const balance = Object.values(payments).reduce((sum, payment) => sum + remainingOf(payment), 0)
        const paymentDay = Math.min(28, today + 1 + index * 2)
        /* Como la API: con deuda, el próximo cobro es el día de pago del mes más viejo que debe */
        const oldestOwed = Object.keys(payments).sort().find(p => ['pending', 'partial', 'overdue'].includes(payments[p].status))
        return { id: account, user_id: client?.user.id, name: client?.name ?? (inactive ? 'CLIENTA DE EJEMPLO (BAJA)' : account), plan: client?.user.plan.name ?? 'Plan de ejemplo A', fixed_payment: client?.user.plan.price ?? 349, billing_type: inactive || index % 3 !== 0 ? 'manual' : 'stripe', app_status: inactive ? 'inactive' : 'active', payment_day: paymentDay, phone: null, balance, promotion: null, next_charge_date: oldestOwed ? `${oldestOwed}-${pad(paymentDay)}` : null, next_charge_amount: null, promised_until: financePromises[account] ?? null, payments }
    })
    /* Los totales, sobre TODO el filtro y con lo arrastrado, como getTotals de la API */
    const total = (statuses: string[]) => matching.reduce((sum, [, payments]) => sum + Object.values(payments).filter(payment => statuses.includes(payment.status)).reduce((acc, payment) => acc + remainingOf(payment), 0), 0)
    return { ...page(items), total_overdue: total(['overdue', 'partial']), total_pending: total(['pending']), total_in_review: total(['in_review']) }
}
const reportSections = [['early', 'Tempraneras'], ['pink_circle', 'Círculo Rosa'], ['stars', 'Estrellas'], ['honor_roll', 'Cuadro de Honor'], ['new_beginnings', 'Nuevos inicios'], ['birthdays', 'Cumpleaños']]
const clientsStatus = {
    sections: reportSections.map(([section_key, name]) => ({ section_key, name, group: 'unit', plans: plans.map(plan => plan.name) })),
    clients: demoClients.filter(client => client.user.active).map((client, index) => ({
        id: client.id, name: client.name, account: client.account, plan: client.user.plan.name,
        cells: Object.fromEntries(reportSections.slice(0, 4 + (index % 3)).map(([key], column) => [key, (index === 2 && column > 1) || (index === 7 && column === 0) ? 'missing' : 'completed'])),
    })),
}
const colombiaClientsStatus = {
    sections: clientsStatus.sections,
    clients: [{ id: 'col-1', name: 'Clienta de ejemplo en Colombia', account: 'EJ-COL1', plan: 'Plan de ejemplo C', cells: Object.fromEntries(reportSections.slice(0, 4).map(([key]) => [key, 'missing'])) }],
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
/* `?lento=1`: la sesión tarda, para revisar la pantalla de espera. Se lee al arrancar: la demo cambia la URL enseguida */
const SLOW_SESSION = new URLSearchParams(window.location.search).get('lento') === '1'

/* ── Plantillas de publicaciones (admin/templates) ────────────────────────────────────────────
   El arte es de EJEMPLO: tarjetas SVG con el nombre de la sección, no el arte real. Hay de todo lo
   que la pantalla tiene que saber pintar: vertical, cuadrada y video; apagadas; sin preset (sin
   ajuste directo); una de Colombia; y dos meses, el pasado y el que corre. */
const demoArt = (title: string, hue: number, square = false) => {
    const [w, h] = square ? [540, 540] : [540, 960]
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},62%,30%)'/><stop offset='1' stop-color='hsl(${(hue + 50) % 360},72%,58%)'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><circle cx='${w / 2}' cy='${h * 0.4}' r='${w * 0.2}' fill='rgba(255,255,255,.16)' stroke='rgba(255,255,255,.55)' stroke-width='4'/><text x='50%' y='${h * 0.72}' fill='white' font-family='Arial' font-size='30' font-weight='700' text-anchor='middle'>${title}</text><text x='50%' y='${h * 0.72 + 40}' fill='rgba(255,255,255,.75)' font-family='Arial' font-size='20' text-anchor='middle'>EJEMPLO</text></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
type DemoTemplate = Record<string, unknown> & { id: string, name: string, month: number, active: boolean, template_group: string, variants: Array<Record<string, unknown>> }
const demoTemplates: DemoTemplate[] = []
/* Las medidas de la base de prueba de cumpleaños (1080×1080), las mismas con que el servidor armó la pieza de ejemplo */
const demoCumpleAcomodo = {
    cara: { cx: 727, cy: 302, ancho: 270 }, velo: [600, 800],
    nombre: { fuente: 'playfair', peso: 800, sx: 0.84, cap: 70, cx: 724, base2: 851, interlinea: 80, ancho_max: 540, grad: [[253, 236, 203], [253, 247, 229], [253, 227, 185]], sombra: [2, 3, 4, 0.5, [70, 12, 38]], relieve: false, brillo: false, renglones: 2, estricto: true, interlinea_escala: true },
    valor: null,
    firma: { fuente: 'playfair', peso: 400, cap: 20, cx: 700, base: 1000, ancho_max: 400, grad: [[251, 241, 241]], sombra: [1, 1.5, 2, 0.45, [70, 12, 38]] },
    avatar: 'circulo',
    circulo: { aro: [252, 240, 222], filo: [206, 160, 98], sombra: [60, 10, 30], diametro: 430, cx: 745 },
}
/** Lo que se subió en la demo (llave → la imagen en el navegador): una base nueva se ve al guardarla */
const demoUploads = new Map<string, string>()
{
    const curMonth = now.getMonth() + 1
    const prevMonth = ((curMonth + 10) % 12) + 1
    /* [sección, subgrupo, nombre, tono, cuadrada, video, preset] */
    const rows: Array<[string, string | null, string, number, boolean, boolean, string | null]> = [
        ['honor_roll', 'queen', 'Cuadro de Honor - 1er lugar', 265, false, true, 'top3_honor_board'],
        ['honor_roll', 'first-princess', 'Cuadro de Honor - 2do lugar', 265, false, true, 'top3_honor_board'],
        ['honor_roll', 'second-princess', 'Cuadro de Honor - 3er lugar', 265, false, true, 'top3_honor_board'],
        ['honor_roll', 'consolidated', 'Cuadro de Honor - Podio', 265, false, true, null],
        ['stars', 'emerald', 'Círculo del Éxito Esmeralda', 150, true, true, 'photo_name_points'],
        ['stars', 'diamond', 'Círculo del Éxito Diamante', 200, true, true, 'photo_name_points'],
        ['stars', 'ruby', 'Círculo del Éxito Rubí', 350, true, true, 'photo_name_points'],
        ['pink_circle', 'pink', 'Círculo Rosa - Rosa', 330, false, true, 'photo_name_client_logo'],
        ['pink_circle', 'pink-vip', 'Círculo Rosa - VIP', 320, false, true, 'photo_name_client_logo'],
        ['pink_circle', 'pink-gold', 'Círculo Rosa - Gold 13-23', 40, false, true, 'photo_name_client_logo'],
        ['new_beginnings', 'previous-1', 'Nuevos Inicios - 2do mes', 190, false, true, 'photo_name'],
        ['new_beginnings', 'previous-2', 'Nuevos Inicios - 3er mes', 190, false, true, 'photo_name'],
        ['early', null, 'Ordenantes del mes', 25, true, false, 'photo_name_points'],
        ['birthdays', null, 'Cumpleaños de la unidad', 300, true, true, 'photo_name'],
        ['anniversaries', null, 'Aniversarios de la unidad', 280, true, true, 'photo_name_hearts_anniversary_next'],
        ['national_birthdays', null, 'Cumpleaños nacional', 300, true, true, 'photo_name_client_logo'],
        ['sales_cut', null, 'Target a Corte de Ventas', 220, false, true, null],
    ]
    const make = (month: number, [group, sub, name, hue, square, video, preset]: typeof rows[number], index: number, extra: Partial<DemoTemplate> = {}): DemoTemplate => {
        const id = `tpl-${month}-${index}`
        const variants: Array<Record<string, unknown>> = [{ id: `${id}-v`, template_id: id, kind: 'image', enabled: true, template_file_uri: `demo/${id}/v.svg`, template_file_url: demoArt(name.split(' - ').pop() ?? name, hue) }]
        if (square) variants.push({ id: `${id}-c`, template_id: id, kind: 'image_square', enabled: true, template_file_uri: `demo/${id}/c.svg`, template_file_url: demoArt(name.split(' - ').pop() ?? name, hue, true) })
        if (video) variants.push({ id: `${id}-m`, template_id: id, kind: 'video', enabled: true, template_file_uri: `demo/${id}/m.mp4`, template_file_url: null })
        return {
            id, name: `${name} - ${MONTH_SHORT[month - 1]}`, slug: id, month, active: true, template_group: group, template_subgroup: sub, preset_slug: preset,
            metadata: null, variants, clients_count: 0, enabled_all_clients: false, template_asset_type: null, template_file_uri: null, template_file_url: null,
            reference_file_url: null, picture: null, font_color: null, mock_values: null, render_provider_id: null, ai_analyzed_at: null,
            created_at: iso(60 * 24 * (40 - month)), updated_at: iso(60 * 24 * 2), ...extra,
        }
    }
    rows.forEach((row, index) => demoTemplates.push(make(prevMonth, row, index, index === 3 ? { active: false } : {})))
    rows.slice(0, 13).forEach((row, index) => demoTemplates.push(make(curMonth, row, index, index === 9 ? { active: false } : {})))
    /* En vivo: las del mes que corre, y una de Colombia (metadata.country) */
    demoTemplates.push(make(curMonth, ['honor_roll', 'live-queen', 'CH en vivo - 1er lugar', 280, true, true, 'photo_name_points'], 40))
    demoTemplates.push(make(curMonth, ['honor_roll', 'live-consolidated', 'CH en vivo - Podio', 280, true, true, 'top3_honor_board'], 41))
    demoTemplates.push(make(curMonth, ['stars', 'emerald', 'Círculo del Éxito Esmeralda (Colombia)', 160, true, true, 'photo_name_points'], 42, { metadata: { country: 'COL' } }))
    /* Con base (motor «llenado»): los cumpleaños del mes que corre, con llave fija para abrir su ficha directo. La
       cuadrada ya está medida (su archivo ES la base, 1080×1080) y la vertical sigue por capas, para pasarla a base. */
    const cumple = make(curMonth, ['birthdays', null, 'Cumpleaños de la unidad', 330, true, true, 'photo_name'], 13)
    const id = 'tpl-cumples-base'
    demoTemplates.push({
        ...cumple, id, slug: id,
        variants: cumple.variants.map(variant => {
            const own = { ...variant, id: String(variant.id).replace(cumple.id, id), template_id: id }
            if (variant.kind !== 'image_square') return own
            const folder = `public/templates/posts/${id}/variants/image_square`
            return { ...own, template_file_uri: `${folder}/base-cumples.jpg`, template_file_url: demoCumpleBaseImg, render_configuration: { engine: 'llenado', encima: `${folder}/encima-cumples.png`, acomodo: demoCumpleAcomodo } }
        }),
    })
}

/** Lo que se pidió y a qué se contestó: `window.__demo.calls` dice qué no estaba previsto. */
export const calls: Array<{ method: string, path: string, mocked: boolean }> = []

const respond = (data: unknown, status = 200) => new Response(JSON.stringify({ success: status < 400, data, message: status < 400 ? 'OK' : 'Simulado' }), { status, headers: { 'Content-Type': 'application/json' } })
const page = <T,>(items: T[]) => ({ items, current_page: 1, last_page: 1, per_page: 15, total_items: items.length, next_cursor: null })

/* Retos (admin/challenges): tres retos de EJEMPLO, uno en cada momento de su base — por medir, pedida a diseño y
   lista — con ganadoras inventadas. La base y la pieza son imágenes de ejemplo (sin personas reales). */
const demoRetoClient = (n: number, name: string) => ({ id: `u-reto-${n}`, name, username: `EJ-00${n}`, network_person_id: `np-reto-${n}`, country_code: 'MEX' })
const demoRetoRow = (id: string, name: string, extra: Record<string, unknown>) => ({ id, name, photo: { has_photo: false, url: null }, done: true, awarded: false, ...extra })
const demoAcomodo = {
    cara: { cx: 724, cy: 496, ancho: 307 }, velo: [720, 960], min_cara: 200,
    nombre: { cx: 512, base2: 1028, cap: 71, interlinea: 80, ancho_max: 640, peso: 800, sx: 0.83, fuente: 'playfair', grad: [[253, 233, 225], [240, 176, 172]], relieve: true, brillo: true },
    valor: { cx: 512, base: 1200, alto: 124, ancho_max: 440, peso: 900, sx: 0.8, fuente: 'playfair', grad: [[251, 216, 210], [230, 156, 152]], relieve: true, brillo: true },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- datos de ejemplo de forma libre, sólo en la demo
type DemoReto = Record<string, any>
const demoRetos: DemoReto[] = [
    {
        id: 'reto-1', type: 'unit_reactivation', title: 'Pon tu negocio en acción', prize: 'Kit especial por $139', target: 1,
        client: demoRetoClient(10, 'Rocío Sánchez Beltrán'), progress: { current: 2, goal: 69, measure: 'people', done: false, detail: '2 de 69 inactivas ya regresaron', data_missing: false },
        rows: [demoRetoRow('np-r1', 'Arcelia Medina Ruiz', { current: 1, goal: 1, returned_on: `${period(0)}-15` }), demoRetoRow('np-r2', 'Beatriz Nava Olmos', { current: 1, goal: 1, returned_on: `${period(0)}-19` })],
        template: { state: 'por_medir', has_value: false, base: null, acomodo: null, registered_at: null, candidate: { uri: 'service-requests/demo/base.jpg', url: demoBaseImg, task_id: 'task-620', at: iso(40) }, base_task: { id: 'task-620', title: 'Base de tus ganadoras · Pon tu negocio en acción', status: 'ready-for-review', status_name: 'Lista para revisión' } },
        celebrated: [],
    },
    {
        id: 'reto-2', type: 'unit_points', title: 'Llegar a 1,000 puntos', prize: 'Kit de brochas', target: 1000,
        client: demoRetoClient(11, 'Julieta Ruiz Maldonado'), progress: { current: 3, goal: 214, measure: 'people', done: false, detail: null, data_missing: false },
        rows: [demoRetoRow('np-p1', 'Carmen Ortiz Salas', { current: 1502, goal: 1000 }), demoRetoRow('np-p2', 'Dolores Peña Vidal', { current: 1184, goal: 1000 }), demoRetoRow('np-p3', 'Elena Robles Cano', { current: 1045, goal: 1000 })],
        template: { state: 'lista', has_value: true, base: { uri: 'private/challenges/demo/plantilla/base.jpg', url: demoBaseImg }, acomodo: demoAcomodo, registered_at: iso(3 * 1440), candidate: null, base_task: { id: 'task-601', title: 'Base de tus ganadoras · Llegar a 1,000 puntos', status: 'completed', status_name: 'Completada' } },
        celebrated: [{ person_id: 'np-p1', post_id: 'post-1', via: 'plantilla', photo: 'avatar', avatar_reason: 'no tiene foto', at: iso(2 * 1440) }, { person_id: 'np-p2', post_id: 'post-2', via: 'plantilla', photo: 'avatar', avatar_reason: 'la foto corta la cabeza arriba', at: iso(1440) }],
    },
    {
        id: 'reto-3', type: 'unit_hearts', title: 'Ganar 2 corazones este mes', prize: 'Pashmina rosa', target: 2,
        client: demoRetoClient(12, 'Ana María Tovar'), progress: { current: 0, goal: 96, measure: 'people', done: false, detail: null, data_missing: false },
        rows: [],
        template: { state: 'pedida', has_value: true, base: null, acomodo: null, registered_at: null, candidate: null, base_task: { id: 'task-622', title: 'Base de tus ganadoras · Ganar 2 corazones este mes', status: 'in-progress', status_name: 'En proceso' } },
        celebrated: [],
    },
]
const demoRetoDetail = (reto: DemoReto) => ({
    id: reto.id, scope: 'unit', type: reto.type, title: reto.title, description: null, target: reto.target, prize: reto.prize,
    period: period(0), starts_on: `${period(0)}-01`, ends_on: `${period(0)}-${daysInMonth}`, is_open: true, progress: reto.progress,
    piece: { url: demoPieceImg, status: 'completed', status_name: 'Entregado' },
    rows: reto.rows.map((row: DemoReto) => ({ ...row, piece: reto.celebrated.some((entry: DemoReto) => entry.person_id === row.id && entry.post_id) ? { url: demoPieceImg, status: 'published' } : null })),
    client: reto.client, kit_task: { id: 'task-616', title: reto.type === 'unit_reactivation' ? 'Flyer · Promo reactivación T1-T7 · hasta 30 sep' : `Kit del reto · ${reto.title}` }, template: reto.template, celebrated: reto.celebrated,
})
const demoRetoItem = (reto: DemoReto) => ({
    id: reto.id, type: reto.type, title: reto.title, prize: reto.prize, period: period(0), ends_on: `${period(0)}-${daysInMonth}`, progress: reto.progress, is_open: true,
    client: reto.client, template_state: reto.template.state, celebrated_count: reto.celebrated.length, published_count: reto.celebrated.filter((entry: DemoReto) => entry.post_id).length,
})

export const installMockApi = () => {
    const base = import.meta.env.VITE_API_URL as string
    const realFetch = window.fetch.bind(window)
    installDemoUploads()

    window.fetch = async (input, init) => {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        if (raw.startsWith('https://demo-s3.invalid/')) {
            if (init?.body instanceof Blob) demoUploads.set(decodeURIComponent(raw.slice('https://demo-s3.invalid/'.length)), URL.createObjectURL(init.body))
            await wait(500)
            return new Response(null, { status: 200 })
        }
        if (!raw.startsWith(base)) return realFetch(input, init)

        const url = new URL(raw)
        const path = url.pathname.replace(new URL(base).pathname.replace(/\/$/, ''), '') || '/'
        const method = (init?.method ?? 'GET').toUpperCase()
        let known = true
        let response: Response

        if (path === '/me') { if (SLOW_SESSION) await wait(6000); response = respond(me) }
        else if (path === '/util-data') response = respond(utilData)
        else if (path === '/overview') response = respond(url.searchParams.get('country') === 'COL' ? colombiaOverview : overview)
        else if (path === '/overview/attention') response = respond(countryAttention)
        // Aviso a clientas: el API sólo lo encola (el cuerpo queda en window.__demoLastNotice para revisarlo)
        else if (path === '/notifications/clients' && method === 'POST') {
            Object.assign(window, { __demoLastNotice: typeof init?.body === 'string' ? JSON.parse(init.body) : null })
            response = respond({ message: 'Notificaciones en cola para envio.' })
        }
        else if (path === '/notifications/center') response = respond(notifications)
        else if (path === '/notifications/center/seen') response = respond(true)
        else if (path === '/live-news') response = respond(url.searchParams.get('country') === 'COL' ? { ...liveNews, star_level_up: [], star_close: [], new_beginning: [], totals: { star_level_up: 0, star_close: 0, new_beginning: 0 } } : liveNews)
        else if (path === '/reports/daily-reports') response = respond(url.searchParams.get('country') === 'COL' ? colombiaDailyReports : dailyReports)
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
        else if (path === '/posts/coverage/clients') {
            const term = (url.searchParams.get('search') ?? '').toLowerCase()
            const items = clientCoverage.items.filter(item => !term || item.client_name.toLowerCase().includes(term) || item.client_account.toLowerCase().includes(term))
            response = respond({ ...clientCoverage, items, total_items: items.length })
        }
        else if (path === '/posts/runs') response = respond(postRuns)
        else if (path === '/posts/publish-newsletter' && method === 'POST') { await wait(300); response = respond({ message: 'Encolado (demo)', total_queued: 1, queued: [] }) }
        /* Apagar / encender a propósito: lo pendiente pasa a «apagado» (o vuelve) en la cobertura de ejemplo */
        else if ((path === '/posts/pauses' || path === '/posts/pauses/resume') && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { section_key: string, sub_section: string | null, reason?: string }
            const resume = path.endsWith('/resume')
            const section = coverageSections.find(item => item.section_key === body.section_key) as unknown as {
                paused: string | null, subsections: Array<{ item_key: string, paused: string | null }>,
                formats: Record<string, { pending: number | null, paused_pending: number, missing_template_pending: number, paused_missing?: number }>,
            } | undefined
            if (section) {
                const reason = resume ? null : body.reason ?? ''
                if (body.sub_section) section.subsections.filter(item => item.item_key === body.sub_section).forEach(item => { item.paused = reason })
                else section.paused = reason
                Object.values(section.formats).forEach(format => {
                    if (resume) {
                        format.pending = (format.pending ?? 0) + format.paused_pending; format.paused_pending = 0
                        format.missing_template_pending += format.paused_missing ?? 0; format.paused_missing = 0
                    } else {
                        format.paused_pending += format.pending ?? 0; format.pending = 0
                        format.paused_missing = (format.paused_missing ?? 0) + format.missing_template_pending; format.missing_template_pending = 0
                    }
                })
            }
            await wait(300)
            response = respond([])
        }
        else if (path === '/pulse') response = respond(url.searchParams.get('country') === 'COL' ? { ...pulse, pieces: pulse.pieces.slice(0, 1).map(item => ({ ...item, posts: 1, clients: 1 })) } : pulse)
        else if (path === '/reports/download-runs' && method === 'GET') response = respond(downloadRuns)
        /* Bajar ahora (México o Colombia): la corrida entra arriba de la lista, «en cola» */
        else if (path === '/reports/download-runs' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { sections?: string[], reset?: boolean }
            const run = { run_id: `demo-${Date.now()}`, process: 'monthly', sections: body.sections ?? null, clients: null, reset: !!body.reset, status: 'queued', result: null, error: null, queued_at: iso(0), finished_at: null }
            ;(downloadRuns as unknown[]).unshift(run)
            await wait(300)
            response = respond([run])
        }
        else if (path === '/reports/dispatch-import' && method === 'POST') { await wait(300); response = respond(true) }
        // Redes: el calendario (EJEMPLO, no toca Meta)
        else if (path === '/social/posts' && method === 'GET') response = respond(socialCalendar(url.searchParams.get('from') ?? ymd(), url.searchParams.get('to') ?? ymd()))
        else if (path === '/social/media' && method === 'POST') {
            const file = (init?.body as FormData | undefined)?.get('file') as File | null
            await wait(500)
            response = respond({ url: file ? URL.createObjectURL(file) : demoPieceImg, path: null, type: file?.type.startsWith('video/') ? 'video' : 'image' })
        }
        else if (path === '/social/posts' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
            const media = (body.media as unknown[] | undefined) ?? []
            const post = { id: `sp-${Date.now()}`, pillar: null, format: 'post', channels: ['ig', 'fb'], caption: null, scheduled_at: null, change_note: null, approved_at: null, approved_by: null, created_by: 'Administración Demo', published_at: null, results: null, last_error: null, attempts: 0, metrics: null, metrics_at: null, ...body, media, status: media.length ? 'review' : 'idea' }
            socialPosts.push(post)
            await wait(250)
            response = respond(post)
        }
        else if (/^\/social\/posts\/[^/]+$/.test(path) && (method === 'PUT' || method === 'DELETE')) {
            const index = socialPosts.findIndex(post => post.id === path.split('/')[3])
            if (method === 'DELETE') { socialPosts.splice(index, 1); response = respond({ deleted: true }) }
            else {
                const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
                const next = { ...socialPosts[index], ...body }
                if (next.status === 'idea' && (next.media as unknown[]).length) next.status = 'review'
                if (next.status === 'failed') next.status = 'review'
                socialPosts[index] = next
                await wait(250)
                response = respond(next)
            }
        }
        else if (/^\/social\/posts\/[^/]+\/(approve|request-change|unschedule|publish-now)$/.test(path) && method === 'POST') {
            const [, , , id, action] = path.split('/')
            const post = socialPosts.find(item => item.id === id)!
            const body = JSON.parse(String(init?.body ?? '{}')) as { note?: string }
            if (action === 'approve') Object.assign(post, { status: 'scheduled', approved_at: iso(0), approved_by: 'Administración Demo', change_note: null })
            if (action === 'request-change') Object.assign(post, { status: 'production', change_note: body.note ?? null, approved_at: null, approved_by: null })
            if (action === 'unschedule') Object.assign(post, { status: 'review', approved_at: null, approved_by: null })
            if (action === 'publish-now') Object.assign(post, { status: 'scheduled', scheduled_at: iso(0), approved_by: 'Administración Demo' })
            await wait(300)
            response = respond(post)
        }
        // Crecimiento: el embudo y a quién escribirle (datos de EJEMPLO)
        else if (path === '/growth/funnel') response = respond(growthFunnel(url.searchParams.get('period') ?? 'semana'))
        else if (path === '/growth/prospects') response = respond(growthProspects())
        else if (path === '/growth/contacts' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { target: string, action: string }
            const contact = { id: `gc-${Date.now()}`, target: body.target, action: body.action, at: iso(0) }
            growthContacts.push(contact)
            await wait(250)
            response = respond({ id: contact.id, action: contact.action, note: null, at: contact.at, by: 'Administración Demo' })
        }
        else if (path.startsWith('/growth/contacts/') && method === 'DELETE') {
            const index = growthContacts.findIndex(contact => contact.id === path.split('/')[3])
            if (index >= 0) growthContacts.splice(index, 1)
            response = respond({ deleted: true })
        }
        else if (/^\/growth\/prospects\/[^/]+\/to-sales$/.test(path) && method === 'POST') {
            const contact = { id: `gc-${Date.now()}`, target: `user:${path.split('/')[3]}`, action: 'to_sales', at: iso(0) }
            growthContacts.push(contact)
            await wait(300)
            response = respond({ id: contact.id, action: contact.action, note: null, at: contact.at, by: 'Administración Demo' })
        }
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
            /* Como TaskService::patchTask: asignar a alguien lo regresa a «En proceso»; «Sin asignar» le quita a quien lo hace */
            const body = JSON.parse(String(init?.body ?? '{}')) as { status?: string, user?: string | null, title?: string, description?: string, started_at?: string, expired_at?: string, expired_at_time?: string, metadata?: Record<string, unknown> }
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            const byId = (slug: string) => utilData.task_statuses.find(item => item.slug === slug)!
            if (task && body.status) {
                task.task_status = utilData.task_statuses.find(item => item.id === body.status) ?? task.task_status
                if (task.task_status.slug === 'unassigned') task.assigned_to = null
                if (['completed', 'ready-for-publish', 'published'].includes(task.task_status.slug)) task.completed_at = new Date().toISOString()
                logActivity(task, 'updated', `ha cambiado el estado de la tarea a ${task.task_status.name}`)
            }
            if (task && 'user' in body) {
                task.assigned_to = demoDesigners.find(item => item.id === body.user) ?? null
                if (task.assigned_to) task.task_status = byId('in-progress')
                logActivity(task, 'updated', task.assigned_to ? `ha cambiado el responsable de la tarea a ${task.assigned_to.name}` : 'ha eliminado el responsable de la tarea')
            }
            if (task && body.title) task.title = body.title
            if (task && typeof body.description === 'string') task.description = body.description
            /* El calendario cambia de día un pedido con `started_at` */
            if (task && body.started_at) task.started_at = new Date(body.started_at).toISOString()
            if (task && (body.expired_at || body.expired_at_time)) {
                const next = body.expired_at ? new Date(body.expired_at) : new Date(task.expired_at)
                const [hours, minutes] = (body.expired_at_time ?? '').split(':').map(Number)
                const previous = new Date(task.expired_at)
                next.setHours(body.expired_at_time ? hours : previous.getHours(), body.expired_at_time ? minutes : previous.getMinutes(), 0, 0)
                task.expired_at = next.toISOString()
                logActivity(task, 'updated', `establecio que la fecha de vencimiento de la tarea fuera: ${next.toLocaleDateString('es-MX')} ${next.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })}`)
            }
            if (task && body.metadata) task.metadata = body.metadata
            if (task) task.last_activity_at = new Date().toISOString()
            await wait(350)
            response = respond(task ? { ...task, created_by: undefined } : null, task ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+$/.test(path) && method === 'DELETE') {
            const index = demoTasks.findIndex(item => item.id === path.split('/')[2])
            if (index >= 0) demoTasks.splice(index, 1)
            await wait(400)
            response = respond({ message: 'Task deleted successfully' }, index >= 0 ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+$/.test(path) && method === 'GET') {
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            response = respond(task ? { ...task, event: demoEvent(task) } : null, task ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+\/activity$/.test(path)) {
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            const type = url.searchParams.get('activity_type')
            await wait(250)
            response = respond(task ? activityOf(task).filter(item => !type || type === 'all' || item.activity_type === type) : [])
        }
        else if (/^\/tasks\/task-\d+\/comment$/.test(path) && method === 'POST') {
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            const comment = String(JSON.parse(String(init?.body ?? '{}')).comment ?? '')
            if (task) logActivity(task, 'comment', comment)
            await wait(300)
            response = respond(task ? activityOf(task)[0] : null, task ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+\/attachments$/.test(path) && method === 'GET') {
            const task = demoTasks.find(item => item.id === path.split('/')[2])
            const type = url.searchParams.get('file_type')
            await wait(300)
            const list = task ? [...filesOf(task)].sort((a, b) => a.file.sort - b.file.sort) : []
            response = respond(type ? list.filter(file => file.file_type === type) : list)
        }
        else if (/^\/tasks\/task-\d+\/attachments$/.test(path) && method === 'POST') {
            const task = demoTasks.find(item => item.id === path.split('/')[2])!
            const uris = (JSON.parse(String(init?.body ?? '{}')).file_uris ?? []) as Array<{ fileUri: string, name: string, extension: string, file_type?: string }>
            const list = filesOf(task)
            const created = uris.map(item => {
                const file = demoFile(task, item.name, { id: me.id, name: me.name }, list.length, 0, item.file_type ?? null, item.name.replace(/\.[^.]+$/, '').slice(0, 16))
                list.push(file)
                logActivity(task, 'attachment', `Ha agregado el adjunto ${item.name.replace(/\.[^.]+$/, '')}`)
                return file
            })
            await wait(400)
            response = respond(created)
        }
        else if (/^\/tasks\/task-\d+\/attachments\/[\w-]+$/.test(path) && method === 'DELETE') {
            const [, , taskId, , attachmentId] = path.split('/')
            const task = demoTasks.find(item => item.id === taskId)
            const list = task ? filesOf(task) : []
            const index = list.findIndex(item => item.id === attachmentId)
            const [gone] = index >= 0 ? list.splice(index, 1) : []
            if (task && gone) logActivity(task, 'attachment', `Ha eliminado el archivo adjunto ${gone.file.name}`)
            await wait(350)
            response = respond(gone ?? null, gone ? 200 : 404)
        }
        else if (/^\/tasks\/task-\d+\/attachments\/[\w-]+$/.test(path) && method === 'PATCH') {
            const [, , taskId, , attachmentId] = path.split('/')
            const task = demoTasks.find(item => item.id === taskId)
            const file = task ? filesOf(task).find(item => item.id === attachmentId) : null
            if (file) file.template_asset_type = JSON.parse(String(init?.body ?? '{}')).template_asset_type ?? null
            response = respond(file ? 1 : 0)
        }
        else if (/^\/tasks\/task-\d+\/upload-template$/.test(path) && method === 'POST') {
            const task = demoTasks.find(item => item.id === path.split('/')[2])!
            const uri = String(JSON.parse(String(init?.body ?? '{}')).file_uri ?? 'plantilla.zip')
            filesOf(task).push(demoFile(task, uri.split('/').pop() ?? 'plantilla.zip', { id: me.id, name: me.name }, filesOf(task).length, 0, 'nexrender_template'))
            await wait(700)
            response = respond([])
        }
        else if (path === '/files/sort' && method === 'PUT') {
            const ids = (JSON.parse(String(init?.body ?? '{}')).file_ids ?? []) as string[]
            demoFiles.forEach(list => list.forEach(item => { const index = ids.indexOf(item.file.id); if (index >= 0) item.file.sort = index }))
            await wait(250)
            response = respond(true)
        }
        else if (path === '/clients' && method === 'GET') {
            const search = (url.searchParams.get('search') ?? '').toLowerCase()
            /* `?country=` como el API: sólo las de ese país; sin él, todas */
            const country = url.searchParams.get('country')
            response = respond(page(demoClients.filter(client => (!country || client.user.country === country) && (!search || `${client.name} ${client.account}`.toLowerCase().includes(search)))))
        }
        else if (path === '/clients/metrics') response = respond(url.searchParams.get('country') === 'COL'
            ? { active_clients: 1, inactive: 0, pending_payment: 0, total_upload_reports: 1, upload_percentage: 100, missing_reports: 0 }
            : { active_clients: 98, inactive: 7, pending_payment: 4, total_upload_reports: 90, upload_percentage: 91.84, missing_reports: 8 })
        /* Activar / desactivar, como `change-status`: cambia `user.active` DE VERDAD, para que al recargar siga igual */
        else if (/^\/clients\/c-\d+\/change-status$/.test(path) && method === 'PATCH') {
            const client = demoClients.find(item => item.id === path.split('/')[2])
            if (client) client.user.active = !!JSON.parse(String(init?.body ?? '{}')).active
            await wait(400)
            response = respond(client ?? null, client ? 200 : 404)
        }
        /* Lo que debe (todos los años), como `clients/{id}/debt`: la F, dada de baja, se fue debiendo tres
           meses y ya pasó el plazo (activa, sólo podría entrar a pagar); las activas, lo de su cobranza */
        else if (/^\/clients\/c-\d+\/debt$/.test(path) && method === 'GET') {
            const client = demoClients.find(item => item.id === path.split('/')[2])
            const gone = client?.id === 'c-5'
            const owed: Record<string, DemoPayment> = gone
                ? { [period(3)]: { amount: 349, paid: 300, status: 'partial' }, [period(2)]: { amount: 349, paid: 0, status: 'overdue' }, [prev]: { amount: 349, paid: 0, status: 'overdue' } }
                : financeLedger[client?.account ?? ''] ?? {}
            const periods = Object.entries(owed)
                .filter(([, payment]) => ['pending', 'partial', 'overdue'].includes(payment.status))
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, payment]) => ({ period: key, remaining: payment.amount - (payment.paid ?? 0), status: payment.status }))
            const late = periods.some(item => item.status !== 'pending')
            await wait(350)
            /* Dada de baja: al reactivarla se le crea el mes en curso (como la API desde el cierre de mes) */
            response = respond({ total: periods.reduce((sum, item) => sum + item.remaining, 0), currency: 'MXN', periods, days_overdue: gone ? 85 : late ? 12 : 0, account_blocked: gone, on_reactivation: gone ? { period: period(0), amount: 349 } : null })
        }
        else if (/^\/clients\/c-\d+$/.test(path) && method === 'PUT') {
            /* Editar sus datos desde la ficha (lo mismo que ClientsService::update): sólo cambia lo que llega.
               La foto y el logo de la demo no se guardan en ningún lado: se pinta un cuadro de color para ver el cambio */
            const client = demoClients.find(item => item.id === path.split('/')[2])
            const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, string>
            const swatch = (text: string, color: string) => ({ url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}"/><text x="50" y="58" font-family="Arial" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">${text}</text></svg>`)}`, uri: 'demo', has_photo: true })
            if (client) {
                if (body.name) { client.name = body.name; client.user.name = body.name }
                if (body.email) client.user.email = body.email
                if (body.phone) client.user.phone = body.phone
                if (body.country_code) { client.country = body.country_code; client.user.country = body.country_code }
                if (body.username) { client.account = body.username; client.user.username = body.username }
                if (body.platform_guest_account) client.platform_guest_account = body.platform_guest_account
                if (body.mk_password) client.external_company_pw = body.mk_password
                if (body.photo) (client as Record<string, unknown>).photo = swatch('FOTO', '#6C47FF')
                if (body.logo) (client as Record<string, unknown>).logotype = swatch('LOGO', '#2CD4D9')
            }
            await wait(400)
            response = respond(client ?? null, client ? 200 : 404)
        }
        else if (/^\/clients\/c-\d+$/.test(path) && method === 'GET') {
            /* La ficha espera `{ client, stats }`, no la clienta suelta */
            const found = demoClients.find(client => client.id === path.split('/')[2])
            response = respond(found ? { client: found, stats: { tools_download_percentage: 42, total_tools: 120, downloaded_tools: 50, monthly_posts: 64, shared_posts: 19, posts_shared_percentage: 30, month: period(0) } } : null, found ? 200 : 404)
        }
        else if (/^\/clients\/c-\d+\/network$/.test(path)) {
            /* Su unidad de EJEMPLO: 30 consultoras y 3 Directoras (una es clienta, para ver la liga a su ficha) */
            const directors = url.searchParams.get('vendorRole') === 'directors'
            const text = (url.searchParams.get('search') ?? '').toLowerCase()
            const pageNumber = Number(url.searchParams.get('page')) || 1
            const perPage = Number(url.searchParams.get('perPage')) || 15
            const people = Array.from({ length: directors ? 3 : 30 }, (_, index) => ({
                id: directors && index === 0 ? 'c-1' : `np-demo-${directors ? 'd' : 'u'}-${index}`,
                name: `${directors ? 'Directora' : 'Consultora'} de ejemplo ${index + 1}`,
                account: `${directors ? 'DIR' : 'CON'}${String(100 + index)}`,
                country: 'MEX', photo: null,
                rank: directors ? 'Directora' : index % 7 === 0 ? 'Consultora Estrella' : 'Consultora',
                isClient: directors && index === 0, isClientActive: directors && index === 0, created_at: iso(60 * 24 * (40 + index * 9)),
            })).filter(person => !text || `${person.name} ${person.account}`.toLowerCase().includes(text))
            const lastPage = Math.max(1, Math.ceil(people.length / perPage))
            response = respond({ ...page(people.slice((pageNumber - 1) * perPage, pageNumber * perPage)), current_page: pageNumber, last_page: lastPage, per_page: perPage, total_items: people.length })
        }
        else if (/^\/clients\/c-\d+\/insights$/.test(path)) {
            /* Indicadores y uso de EJEMPLO (la forma de ClientInsightsService); la F, dada de baja, sin movimiento */
            const gone = path.split('/')[2] === 'c-5'
            const months = Array.from({ length: 6 }, (_, index) => period(5 - index))
            response = respond({
                month: period(0),
                indicators: { month: period(0), unit_size: 215, leaders: { count: 4, period: prev, people: [] }, ordered: { count: gone ? null : 38, total: 215, source: gone ? null : 'sales' }, with_hearts: { count: 28 }, near_gift: { count: 2 } },
                production: months.map((month, index) => ({ month, current: index === 5, loaded: !gone || index < 3, unit_points: !gone || index < 3 ? [42501, 48499, 61942, 62665, 58896, 21340][index] : null, own_points: !gone || index < 3 ? [5012, 3004, 10012, 2560, 3732, 1180][index] : null, ordered: !gone || index < 3 ? [46, 47, 58, 71, 67, 38][index] : null })),
                activity: gone ? { last_active_at: iso(60 * 24 * 95), last_sign_in_at: iso(60 * 24 * 95), has_app: false, devices: [] } : { last_active_at: iso(95), last_sign_in_at: iso(60 * 9), has_app: true, devices: [{ platform: 'android', model: 'SM-S948B', since: iso(60 * 24 * 44) }] },
                usage_days: 30,
                usage: {
                    areas: gone ? [] : [
                        { key: 'notifications', label: 'Avisos leídos', total: 85 },
                        { key: 'posts', label: 'Publicaciones compartidas', total: 22 },
                        { key: 'assistant', label: 'Mensajes al Asistente', total: 9, app: 7, web: 2 },
                        { key: 'library', label: 'Biblioteca', total: 3, shared: 2, saved: 1 },
                        { key: 'trainings', label: 'Entrenamientos bajados', total: 2 },
                        { key: 'requests', label: 'Pedidos de diseño', total: 1, via_assistant: 1 },
                        { key: 'challenges', label: 'Retos creados', total: 1 },
                        { key: 'events', label: 'Eventos e invitaciones', total: 0 },
                    ],
                    posts_by_section: gone ? [] : [{ key: 'birthdays', label: 'Cumpleaños', total: 8 }, { key: 'new_beginnings', label: 'Nuevos inicios', total: 6 }, { key: 'stars', label: 'Estrellas', total: 5 }, { key: 'pink_circle', label: 'Circulo rosa', total: 2 }, { key: 'honor_roll', label: 'Cuadro de Honor', total: 1 }],
                    library_by_section: gone ? [] : [{ key: 'proposals', label: 'Propuestas', total: 1 }, { key: 'products', label: 'Productos', total: 1 }],
                },
                trend: months.map((month, index) => ({ month, posts_shared: gone ? 0 : [0, 0, 3, 8, 22, 4][index], assistant_messages: gone ? 0 : [0, 0, 0, 2, 11, 3][index] })),
            })
        }
        else if (/^\/clients\/c-\d+\/clone-reel$/.test(path)) response = respond({ enabled: false, enabled_at: null, enabled_by_env: false, reels_this_month: 0, reels_total: 0 })
        else if (/^\/clients\/c-\d+\/accounts$/.test(path) && method === 'GET') {
            /* La clienta A trae dos cuentas (México y Colombia) para poder ver la tarjeta llena */
            const id = path.split('/')[2]
            response = respond(id === 'c-0' ? [
                { id: 'liga-mex', account: 'EJ-001', country: 'MEX', name: 'Clienta de ejemplo A', plan: 'Plan de ejemplo C', active: true, current: true },
                { id: 'liga-col', account: 'EJ-001MX', country: 'COL', name: 'Clienta de ejemplo A', plan: 'Plan de ejemplo B', active: true, current: false },
            ] : [])
        }
        else if (/^\/clients\/c-\d+\/accounts$/.test(path)) { await wait(300); response = respond(true) }
        else if (/^\/clients\/c-\d+\/pink-circle$/.test(path)) response = respond(pinkCircleColombia())
        else if (/^\/clients\/c-\d+\/pink-circle\/[^/]+$/.test(path)) {
            const id = path.split('/')[4]
            if (method === 'PUT') crCapturas[id] = Number(JSON.parse(String(init?.body ?? '{}')).months)
            if (method === 'DELETE') delete crCapturas[id]
            await wait(300)
            response = respond(pinkCircleColombia())
        }
        /* El cierre de mes (MonthCloseService): quién se pausaría el día 1 y el correo; el interruptor vive en los ajustes */
        else if (path === '/finance/month-close' && method === 'GET') response = respond(monthClosePreview())
        else if (path === '/finance/month-close/mail' && method === 'GET') {
            const row = [...monthClosePreview().pause, ...monthClosePreview().spared].find(item => item.account === url.searchParams.get('account'))
            response = row ? new Response(monthCloseMail(row), { status: 200, headers: { 'Content-Type': 'text/html' } }) : respond(null, 404)
        }
        else if (path === '/finance/payment-methods/settings' && method === 'PUT') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { month_close_enabled?: boolean }
            if (typeof body.month_close_enabled === 'boolean') demoMonthClose.enabled = body.month_close_enabled
            await wait(350)
            response = respond({ month_close_enabled: demoMonthClose.enabled })
        }
        else if (path === '/finance/card-issues') response = respond(cardIssues)
        else if (path === '/finance/card-issues/scan') { await wait(900); response = respond({ checked: 11, open: cardIssues.length, errors: 0, issues: cardIssues }) }
        /* Como en producción hoy: sin el Portal de clientes activado, Stripe no da la liga */
        else if (/^\/finance\/card-issues\/[^/]+\/card-link$/.test(path)) { await wait(400); response = new Response(JSON.stringify({ success: false, data: null, message: 'Primero activa el «Portal de clientes» en Stripe (Configuración → Billing → Portal de clientes) y vuelve a intentar.' }), { status: 422, headers: { 'Content-Type': 'application/json' } }) }
        else if (path === '/finance/clients') response = respond(financeClients(url.searchParams.get('collection_status') ?? 'collectable', url.searchParams.get('inactive') === '1', Number(url.searchParams.get('year')) || undefined, url.searchParams.get('country'), url.searchParams.get('search') ?? ''))
        /* Día de pago, como la API: entra al calendario y, si el primer cobro cae en el mes en curso, se le crea ya */
        else if (/^\/finance\/clients\/[^/]+\/payment-day$/.test(path) && method === 'PUT') {
            const account = decodeURIComponent(path.split('/')[3])
            const day = Number((JSON.parse(String(init?.body ?? '{}')) as { payment_day: number }).payment_day)
            const fresh = financeNewAccounts.find(item => item.account === account)
            financePaymentDays[account] = day
            if (fresh) {
                const charge = firstChargeOn(day, fresh.trial_ends_at)
                if (charge.slice(0, 7) === cur) (financeLedger[account] ??= {})[cur] ??= { amount: fresh.price, paid: 0, status: charge < ymdAhead(0) ? 'overdue' : 'pending' }
            }
            await wait(300)
            response = respond(newAccountItem(account) ?? financeClients('collectable').items.find(item => item.id === account) ?? null)
        }
        /* Registrar un pago como la API: «pagado» liquida con su fecha, un monto solo es abono, y
           deshacer un pagado lo deja debiéndose entero */
        else if (path === '/finance/payments' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { account: string, period: string, status?: string, amount?: number, paid_at?: string }
            const ledger = financeLedger[body.account] ? financeLedger : financeInactiveLedger
            const row = ((ledger[body.account] ??= {})[body.period] ??= { amount: financeNewAccounts.find(item => item.account === body.account)?.price ?? 349, paid: 0, status: 'pending' })
            if (body.status === 'paid') { row.paid = row.amount; row.status = 'paid'; row.paid_at = body.paid_at ?? new Date().toISOString() }
            else if (body.status) { if (row.status === 'paid') { row.paid = 0; row.paid_at = null } row.status = body.status }
            else if (body.amount) { row.paid = (row.paid ?? 0) + body.amount; row.status = row.paid >= row.amount ? 'paid' : 'partial'; row.paid_at = body.paid_at ?? null }
            await wait(300)
            response = respond(true)
        }
        else if (/^\/finance\/clients\/[^/]+\/promise$/.test(path) && method === 'PUT') {
            const account = decodeURIComponent(path.split('/')[3])
            const until = (JSON.parse(String(init?.body ?? '{}')) as { promised_until: string | null }).promised_until
            if (until) financePromises[account] = until
            else delete financePromises[account]
            await wait(300)
            response = respond(financeClients('collectable').items.find(item => item.id === account) ?? financeClients('paid').items.find(item => item.id === account) ?? null)
        }
        else if (path === '/finance/payments/review' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { account: string, period: string, decision: string }
            const payment = financeLedger[body.account]?.[body.period]
            if (payment) { payment.status = body.decision === 'approve' ? 'paid' : 'pending'; payment.paid = body.decision === 'approve' ? payment.amount : 0 }
            await wait(350)
            response = respond(true)
        }
        else if (/^\/finance\/clients\/[^/]+$/.test(path)) {
            const account = decodeURIComponent(path.split('/')[3])
            const year = Number(url.searchParams.get('year')) || undefined
            response = respond(newAccountItem(account) ?? financeClients('collectable', false, year).items.find(item => item.id === account) ?? financeClients('paid', false, year).items.find(item => item.id === account) ?? financeClients('collectable', true, year).items.find(item => item.id === account) ?? null)
        }
        else if (path === '/reports/clients-status') response = respond(url.searchParams.get('country') === 'COL' ? colombiaClientsStatus : clientsStatus)
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
        else if (path === '/challenges' && method === 'GET') response = respond(demoRetos.map(demoRetoItem))
        else if (/^\/challenges\/reto-\d+$/.test(path)) {
            const reto = demoRetos.find(item => item.id === path.split('/')[2])
            response = respond(reto ? demoRetoDetail(reto) : null, reto ? 200 : 404)
        }
        else if (/^\/challenges\/reto-\d+\/request-base$/.test(path) && method === 'POST') {
            const reto = demoRetos.find(item => item.id === path.split('/')[2])!
            reto.template = { ...reto.template, state: 'pedida', base_task: { id: 'task-630', title: `Base de tus ganadoras · ${reto.title}`, status: 'pending', status_name: 'Recibido' } }
            await wait(500)
            response = respond(demoRetoDetail(reto), 201)
        }
        /* Como en el servidor: arma la pieza (aquí, siempre la misma imagen de ejemplo) sin guardar nada */
        else if (/^\/challenges\/reto-\d+\/winner-preview$/.test(path) && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { person_id?: string | null }
            await wait(1600)
            response = respond({ uri: 'private/challenges/demo/vista-previa.jpg', url: demoPieceImg, fill: body.person_id ? { foto: 'avatar', motivo: 'la foto corta la cabeza arriba', lineas: [] } : { foto: 'avatar', motivo: 'no tiene foto', lineas: ['María Guadalupe', 'Hernández Villaseñor'] } })
        }
        else if (/^\/challenges\/reto-\d+\/winner-template$/.test(path) && method === 'PUT') {
            const reto = demoRetos.find(item => item.id === path.split('/')[2])!
            const body = JSON.parse(String(init?.body ?? '{}')) as { base: string, acomodo: unknown }
            reto.template = { ...reto.template, state: 'lista', base: { uri: body.base, url: reto.template.candidate?.url ?? demoBaseImg }, acomodo: body.acomodo, registered_at: new Date().toISOString(), candidate: null }
            await wait(700)
            response = respond({ winner_template: reto.template })
        }
        else if (/^\/challenges\/reto-\d+\/celebrate$/.test(path) && method === 'POST') {
            const reto = demoRetos.find(item => item.id === path.split('/')[2])!
            const dry = !!JSON.parse(String(init?.body ?? '{}')).dry_run
            const pending = reto.rows.filter((row: DemoReto) => !reto.celebrated.some((entry: DemoReto) => entry.person_id === row.id && entry.post_id))
            if (!dry) reto.celebrated = [...reto.celebrated.filter((entry: DemoReto) => !pending.some((row: DemoReto) => row.id === entry.person_id)), ...pending.map((row: DemoReto) => ({ person_id: row.id, post_id: `post-${row.id}`, via: 'plantilla', photo: 'avatar', avatar_reason: 'no tiene foto', at: new Date().toISOString() }))]
            await wait(600)
            response = respond({ dry_run: dry, winners: pending.map((row: DemoReto) => ({ challenge: reto.title, person: row.name, task_id: null })) })
        }
        else if (/^\/challenges\/reto-\d+\/refill$/.test(path) && method === 'POST') {
            const reto = demoRetos.find(item => item.id === path.split('/')[2])!
            const ids = (JSON.parse(String(init?.body ?? '{}')).person_ids ?? null) as string[] | null
            const redo = reto.celebrated.filter((entry: DemoReto) => entry.post_id && (!ids || ids.includes(entry.person_id)))
            redo.forEach((entry: DemoReto) => { entry.photo = 'circulo'; entry.avatar_reason = 'la foto corta la cabeza arriba' })
            await wait(500)
            response = respond({ winners: redo.map((entry: DemoReto) => ({ challenge: reto.title, person: reto.rows.find((row: DemoReto) => row.id === entry.person_id)?.name ?? entry.person_id, task_id: null })) })
        }
        else if (path === '/files/sign-url' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}')) as { fileName: string }
            response = respond({ url: `https://demo-s3.invalid/${encodeURIComponent(body.fileName)}`, key: body.fileName, disk: 'private' })
        }
        /* Plantillas: la API devuelve la LISTA entera (no pagina); encender, apagar y borrar cambian de verdad */
        else if (path === '/templates' && method === 'GET') {
            await wait(500)
            response = respond(demoTemplates)
        }
        else if (path === '/templates/presets' && method === 'GET') response = respond([])
        /* Los subgrupos de cada sección con su nombre del boletín (los mismos que manda la API) */
        else if (/^\/newsletters\/sections\/[^/]+\/items$/.test(path)) {
            const names: Record<string, Record<string, string>> = {
                honor_roll: { queen: 'Cuadro Honor - Reina', 'first-princess': 'Cuadro Honor - Primeras Princesas', 'second-princess': 'Cuadro Honor - Segundas Princesas', consolidated: 'Cuadro Honor - Top 3', 'live-queen': 'En curso · Reina', 'live-consolidated': 'En curso · Top 3' },
                stars: { emerald: 'Esmeralda', diamond: 'Diamante', ruby: 'Rubí', sapphire: 'Zafiro', pearl: 'Perla' },
                pink_circle: { pink: 'Rosa', 'pink-vip': 'Rosa Vip', 'pink-gold': 'Rosa Gold' },
                new_beginnings: { 'previous-1': '2da Herramienta', 'previous-2': '3era Herramienta', 'previous-3': '4ta Herramienta' },
            }
            response = respond(Object.entries(names[path.split('/')[3]] ?? {}).map(([item_key, name], index) => ({ id: `item-${index}`, item_key, name })))
        }
        /* La ficha: la misma plantilla con sus variantes completas (sin capas: el editor abre vacío; las que van con
           base traen sus medidas) */
        else if (/^\/templates\/tpl-[\w-]+$/.test(path) && method === 'GET') {
            const template = demoTemplates.find(item => item.id === path.split('/')[2])
            response = template
                ? respond({ ...template, variants: template.variants.map(variant => ({ ...variant, render_configuration: variant.render_configuration ?? null, reference_file_url: variant.template_file_url, ai_draft_json: null, ai_analyzed_at: null, ai_image_hash: null, created_at: template.created_at, updated_at: template.updated_at })) })
                : respond(null, 404)
        }
        /* Con base, como en el servidor: la vista previa arma la pieza (aquí, siempre la de la persona de prueba) sin
           guardar nada; guardar registra la máscara y las medidas y, si viene una base nueva, la vuelve el archivo de
           la variante. Los cuerpos quedan en window.__demoLastFillPreview y window.__demoLastFill para revisarlos. */
        else if (/^\/templates\/tpl-[\w-]+\/variants\/[\w-]+\/fill-preview$/.test(path) && method === 'POST') {
            Object.assign(window, { __demoLastFillPreview: JSON.parse(String(init?.body ?? '{}')) })
            await wait(1400)
            response = respond({ uri: 'private/templates/demo/vista-previa.jpg', url: demoCumplePieceImg, fill: { foto: 'avatar', motivo: 'no tiene foto', escala: 0.576, lineas: ['María Guadalupe', 'Hernández Villaseñor'] } })
        }
        else if (/^\/templates\/tpl-[\w-]+\/variants\/[\w-]+\/fill$/.test(path) && method === 'PUT') {
            const [, , templateId, , variantId] = path.split('/')
            const variant = demoTemplates.find(item => item.id === templateId)?.variants.find(item => item.id === variantId)
            const body = JSON.parse(String(init?.body ?? '{}')) as { base?: string, encima?: string | null, acomodo: unknown }
            Object.assign(window, { __demoLastFill: body })
            if (variant) {
                if (body.base) Object.assign(variant, { template_file_uri: body.base, template_file_url: demoUploads.get(body.base) ?? variant.template_file_url })
                variant.render_configuration = { engine: 'llenado', encima: body.encima ?? null, acomodo: body.acomodo }
            }
            await wait(700)
            response = respond(variant ?? null, variant ? 200 : 404)
        }
        else if (/^\/templates\/tpl-[\w-]+$/.test(path) && method === 'PUT') {
            const template = demoTemplates.find(item => item.id === path.split('/')[2])
            if (template) Object.assign(template, JSON.parse(String(init?.body ?? '{}')))
            await wait(350)
            response = respond(template ?? null, template ? 200 : 404)
        }
        else if (/^\/templates\/tpl-[\w-]+$/.test(path) && method === 'DELETE') {
            const index = demoTemplates.findIndex(item => item.id === path.split('/')[2])
            if (index >= 0) demoTemplates.splice(index, 1)
            await wait(350)
            response = respond(null, index >= 0 ? 200 : 404)
        }
        else if (path === '/logout') response = respond(null)
        else if (path === '/sign-in') response = respond(null, 401)
        /* Lo no previsto contesta vacío: la pantalla abre en su estado «sin datos», que también hay que ver */
        else { known = false; response = respond(method === 'GET' ? page([]) : null) }

        calls.push({ method, path: path + (url.search || ''), mocked: known })
        return response
    }
}
