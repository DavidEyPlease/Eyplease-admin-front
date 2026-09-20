import ISOTIPO from '@/assets/images/icon-white.png'
import './shell.css'

/** Tres vistazos de lo que hay dentro, dibujados en CSS: el pulso del día, los carriles y la cobranza. */
const Preview = () => (
    <div className="relative mt-12 hidden h-[372px] w-full max-w-[540px] lg:block" aria-hidden>
        <div className="auth-float auth-glass absolute top-0 left-0 w-[276px] rounded-[22px] p-3.5" style={{ '--d': '0s' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5">
                <b className="text-[12.5px] font-bold text-white">El pulso de hoy</b>
                <span className="ml-auto rounded-full bg-emerald-400/90 px-2 py-0.5 text-[9.5px] font-bold text-[#0B3B2A]">TODO SALIÓ</span>
            </div>
            {['Reportes del día · 3 de 3', 'Cumpleaños · 41 piezas', 'Círculo Rosa en vivo · 11:30'].map(row => (
                <p key={row} className="mt-2 flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2 text-[11.5px] text-white/90">
                    <i className="size-1.5 rounded-full bg-emerald-300" />{row}
                </p>
            ))}
        </div>

        <div className="auth-float auth-glass absolute top-[72px] right-0 z-[1] w-[236px] rounded-[22px] p-3.5" style={{ '--d': '-2.2s' } as React.CSSProperties}>
            <b className="text-[12.5px] font-bold text-white">Carriles de hoy</b>
            <div className="mt-3 grid gap-2">
                {[['06:00', 82], ['11:30', 56], ['12:30', 30]].map(([hour, width]) => (
                    <div key={hour} className="flex items-center gap-2 text-[10.5px] text-white/70">
                        <span className="w-9 tabular-nums">{hour}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"><i className="block h-full rounded-full bg-white" style={{ width: `${width}%` }} /></span>
                    </div>
                ))}
            </div>
        </div>

        <div className="auth-float auth-glass absolute bottom-0 left-[120px] z-[2] flex w-[280px] items-center gap-3.5 rounded-[22px] p-3.5" style={{ '--d': '-4.1s' } as React.CSSProperties}>
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="7" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray="163.4" className="auth-ring" />
            </svg>
            <span><b className="block text-[19px] leading-none font-extrabold text-white">Cobranza</b><small className="mt-1 block text-[11px] text-white/65">lo cobrado del mes contra lo esperado</small></span>
        </div>
    </div>
)

/**
 * Marco nuevo de las pantallas de acceso del panel (entrar, recuperar contraseña, código).
 * Cambia SÓLO el marco: cada pantalla sigue pasando su formulario como `children`.
 */
const AuthStage = ({ children }: { children: React.ReactNode }) => (
    <div className="auth-stage relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_1fr]">
        <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

        <aside className="relative z-[1] hidden flex-col justify-center px-[clamp(40px,6vw,96px)] py-12 lg:flex">
            <div className="flex items-center gap-3">
                <span className="shell-mark grid size-11 place-items-center rounded-[14px] border border-white/30 bg-white/15 backdrop-blur-sm">
                    <img src={ISOTIPO} alt="" className="relative z-[1] w-6" />
                </span>
                <span className="text-[19px] leading-none font-extrabold tracking-tight text-white">eyplease<span className="text-[#FF8AC4]">+</span> <small className="ml-1 align-middle text-[11px] font-bold tracking-[.14em] text-white/60 uppercase">Admin</small></span>
            </div>
            <h1 className="auth-rise mt-10 text-[clamp(30px,3.2vw,44px)] leading-[1.05] font-extrabold tracking-tight text-white" style={{ '--i': 0 } as React.CSSProperties}>
                La operación, <span className="text-[#9FF3F5]">de un vistazo.</span>
            </h1>
            <p className="auth-rise mt-4 max-w-[44ch] text-[15px] text-white/75" style={{ '--i': 1 } as React.CSSProperties}>
                Qué salió hoy, qué falta, quién necesita algo y cómo va el mes.
            </p>
            <Preview />
        </aside>

        <main className="relative z-[1] grid place-items-center p-5 sm:p-8">
            <div className="auth-rise auth-card w-full max-w-[420px] rounded-[28px] p-7 sm:p-9" style={{ '--i': 2 } as React.CSSProperties}>
                <span className="shell-grad shell-orb mx-auto mb-5 grid size-[60px] place-items-center rounded-full">
                    <img src={ISOTIPO} alt="" className="relative w-1/2" />
                </span>
                {children}
            </div>
        </main>
    </div>
)

export default AuthStage
