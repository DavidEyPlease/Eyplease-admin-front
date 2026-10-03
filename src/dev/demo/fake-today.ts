// SÓLO DEV: `demo.html?hoy=2026-10-28` hace que toda la demo crea que es ese día, para ver cómo se pinta el panel en
// otra fecha (fin de mes, el día 1…). Se importa ANTES que la API de mentira, que calcula sus fechas al cargar.
const hoy = new URLSearchParams(window.location.search).get('hoy')

if (hoy && /^\d{4}-\d{2}-\d{2}$/.test(hoy)) {
    const RealDate = Date
    const offset = new RealDate(`${hoy}T12:00:00`).getTime() - RealDate.now()

    class FakeDate extends RealDate {
        constructor(...args: unknown[]) {
            // Sin argumentos es «ahora»: el día pedido. Con argumentos, la fecha que se pide, igual que siempre.
            super(...(args.length ? args : [RealDate.now() + offset]) as [number])
        }

        static now() { return RealDate.now() + offset }
    }

    window.Date = FakeDate as DateConstructor
}

export {}
