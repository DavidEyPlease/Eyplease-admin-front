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
        else if (path === '/util-data') response = respond({ faqs: [], templates: [], newsletters: [], plans: [], task_categories: [], training_categories: [] })
        else if (path === '/overview') response = respond(overview)
        else if (path === '/notifications/center') response = respond(notifications)
        else if (path === '/notifications/center/seen') response = respond(true)
        else if (path === '/live-news') response = respond(liveNews)
        else if (path === '/reports/daily-reports') response = respond(dailyReports)
        else if (path === '/logout') response = respond(null)
        else if (path === '/sign-in') response = respond(null, 401)
        /* Lo no previsto contesta vacío: la pantalla abre en su estado «sin datos», que también hay que ver */
        else { known = false; response = respond(method === 'GET' ? page([]) : null) }

        calls.push({ method, path: path + (url.search || ''), mocked: known })
        return response
    }
}
