// Primitivas visuales del panel de Reportes — estética clara "tech".
// Paleta Eyplease+: violeta #5B47E0 + cyan #5DD9D2 sobre base clara.
import { cn } from "@/lib/utils"

export const BRAND = { violet: "#5B47E0", cyan: "#5DD9D2", cyanInk: "#0E9E97" }

/** Tarjeta base: blanca, esquinas suaves, sombra tenue. */
export const Panel = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div
        className={cn(
            "rounded-2xl border border-slate-200/70 bg-white",
            "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-16px_rgba(91,71,224,0.18)]",
            className
        )}
    >
        {children}
    </div>
)

type Accent = "violet" | "rose" | "emerald" | "slate"
const ACCENT: Record<Accent, { chip: string; text: string; ring: string }> = {
    violet: { chip: "bg-[#EEEBFC] text-[#5B47E0]", text: "text-[#5B47E0]", ring: "ring-[#5B47E0]/15" },
    rose: { chip: "bg-rose-50 text-rose-600", text: "text-rose-600", ring: "ring-rose-500/15" },
    emerald: { chip: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", ring: "ring-emerald-500/15" },
    slate: { chip: "bg-slate-100 text-slate-600", text: "text-slate-900", ring: "ring-slate-400/10" },
}

interface KpiTileProps {
    label: string
    value: React.ReactNode
    sub?: React.ReactNode
    icon?: React.ReactNode
    accent?: Accent
}

/** Tile métrico: etiqueta, número grande, chip de icono, subtítulo. */
export const KpiTile = ({ label, value, sub, icon, accent = "violet" }: KpiTileProps) => {
    const a = ACCENT[accent]
    return (
        <Panel className={cn("p-5 ring-1 ring-inset", a.ring)}>
            <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                {icon && <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", a.chip)}>{icon}</span>}
            </div>
            <div className={cn("mt-3 text-3xl font-bold tracking-tight", a.text)}>{value}</div>
            {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </Panel>
    )
}

/** Tile protagónico con degradado de marca. */
export const HeroTile = ({ label, value, sub, icon }: KpiTileProps) => (
    <div
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgba(91,71,224,0.6)]"
        style={{ backgroundImage: `linear-gradient(135deg, ${BRAND.violet} 0%, #6B5BE8 55%, ${BRAND.cyan} 140%)` }}
    >
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</span>
            {icon && <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">{icon}</span>}
        </div>
        <div className="relative mt-3 text-3xl font-bold tracking-tight">{value}</div>
        {sub && <div className="relative mt-1 text-xs text-white/80">{sub}</div>}
    </div>
)

/** Encabezado de panel/sección. */
export const PanelHeader = ({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) => (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
        </div>
        {action}
    </div>
)

/** Botón gradiente de marca. */
export const BtnPrimary = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white",
            "shadow-[0_8px_20px_-8px_rgba(91,71,224,0.7)] transition active:scale-[0.98] disabled:opacity-50",
            className
        )}
        style={{ backgroundImage: `linear-gradient(135deg, ${BRAND.violet}, #6B5BE8)` }}
    >
        {children}
    </button>
)

/** Botón contorno claro. */
export const BtnGhost = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600",
            "transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50",
            className
        )}
    >
        {children}
    </button>
)
