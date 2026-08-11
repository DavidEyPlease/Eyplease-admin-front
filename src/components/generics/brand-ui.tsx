// Primitivas visuales de marca Eyplease+ (violeta → cyan).
// Los colores y sombras viven en los tokens de index.css: brand-violet, brand-cyan,
// bg-brand-gradient, shadow-panel, shadow-brand-glow. No hardcodear hex aquí.
import { cn } from "@/lib/utils"

/** Tarjeta base: blanca, esquinas suaves, sombra tenue. */
export const Panel = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("rounded-2xl border border-border bg-card shadow-panel", className)}>
        {children}
    </div>
)

type Accent = "violet" | "rose" | "emerald" | "amber" | "slate"

const ACCENT: Record<Accent, { chip: string; text: string; ring: string }> = {
    violet: { chip: "bg-brand-violet-soft text-brand-violet", text: "text-brand-violet", ring: "ring-brand-violet/15" },
    rose: { chip: "bg-rose-50 text-rose-600", text: "text-rose-600", ring: "ring-rose-500/15" },
    emerald: { chip: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", ring: "ring-emerald-500/15" },
    amber: { chip: "bg-amber-50 text-amber-600", text: "text-amber-600", ring: "ring-amber-500/15" },
    slate: { chip: "bg-muted text-muted-foreground", text: "text-foreground", ring: "ring-border" },
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
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
                {icon && <span className={cn("flex size-9 items-center justify-center rounded-xl", a.chip)}>{icon}</span>}
            </div>
            <div className={cn("mt-3 text-3xl font-bold tracking-tight", a.text)}>{value}</div>
            {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </Panel>
    )
}

/** Tile protagónico con degradado de marca. */
export const HeroTile = ({ label, value, sub, icon }: KpiTileProps) => (
    <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-brand-glow-lg">
        <div className="absolute -top-10 -right-8 size-32 rounded-full bg-card/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">{label}</span>
            {icon && <span className="flex size-9 items-center justify-center rounded-xl bg-card/20 backdrop-blur">{icon}</span>}
        </div>
        <div className="relative mt-3 text-3xl font-bold tracking-tight">{value}</div>
        {sub && <div className="relative mt-1 text-xs text-white/80">{sub}</div>}
    </div>
)

/** Encabezado de panel/sección. */
export const PanelHeader = ({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) => (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
    </div>
)

/** Botón gradiente de marca. */
export const BtnPrimary = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-gradient-btn px-3.5 py-2 text-sm font-medium text-white",
            "shadow-brand-glow transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
            className,
        )}
    >
        {children}
    </button>
)

/** Botón contorno claro. */
export const BtnGhost = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground",
            "transition hover:bg-muted/40 hover:text-foreground active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
            className,
        )}
    >
        {children}
    </button>
)

/** Barrita de progreso con relleno semántico. */
export const MiniBar = ({ value, total, tone = "brand" }: { value: number; total: number; tone?: "brand" | "ok" | "warn" | "bad" }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0
    const fill = {
        brand: "bg-brand-gradient-r",
        ok: "bg-emerald-500",
        warn: "bg-amber-500",
        bad: "bg-rose-500",
    }[tone]

    return (
        <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span className={cn("block h-full rounded-full transition-all", fill)} style={{ width: `${percent}%` }} />
        </span>
    )
}
