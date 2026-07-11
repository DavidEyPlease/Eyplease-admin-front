// Visual primitives for the Finance panel — clean, "tech" aesthetic.
// Eyplease+ brand palette: violet #5B47E0 + cyan #5DD9D2 over a light base.
import { cn } from "@/lib/utils"

const BRAND = {
    violet: "#5B47E0",
    violetSoft: "#8B7BF0",
    cyan: "#5DD9D2",
    ink: "#0F172A",
}

type Accent = "violet" | "cyan" | "rose" | "amber" | "emerald" | "slate"

const ACCENT: Record<Accent, { chip: string; text: string; ring: string }> = {
    violet: { chip: "bg-[#EEEBFC] text-[#5B47E0]", text: "text-[#5B47E0]", ring: "ring-[#5B47E0]/15" },
    cyan: { chip: "bg-[#E2F8F6] text-[#0E9E97]", text: "text-[#0E9E97]", ring: "ring-[#5DD9D2]/20" },
    rose: { chip: "bg-rose-50 text-rose-600", text: "text-rose-600", ring: "ring-rose-500/15" },
    amber: { chip: "bg-amber-50 text-amber-600", text: "text-amber-600", ring: "ring-amber-500/15" },
    emerald: { chip: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", ring: "ring-emerald-500/15" },
    slate: { chip: "bg-slate-100 text-slate-600", text: "text-slate-900", ring: "ring-slate-400/10" },
}

/** Base card: white, soft corners, subtle shadow. */
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

interface KpiTileProps {
    label: string
    value: React.ReactNode
    sub?: React.ReactNode
    icon?: React.ReactNode
    accent?: Accent
}

/** Modern metric tile: label, big number, icon chip, subtitle. */
export const KpiTile = ({ label, value, sub, icon, accent = "violet" }: KpiTileProps) => {
    const a = ACCENT[accent]
    return (
        <Panel className={cn("p-5 ring-1 ring-inset", a.ring)}>
            <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                {icon && (
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", a.chip)}>{icon}</span>
                )}
            </div>
            <div className={cn("mt-3 text-3xl font-bold tracking-tight", a.text)}>{value}</div>
            {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </Panel>
    )
}

/** Hero tile with brand gradient. */
export const HeroTile = ({ label, value, sub, icon }: KpiTileProps) => (
    <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgba(91,71,224,0.6)]"
        style={{ backgroundImage: `linear-gradient(135deg, ${BRAND.violet} 0%, #6B5BE8 55%, ${BRAND.cyan} 140%)` }}>
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</span>
            {icon && (
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">{icon}</span>
            )}
        </div>
        <div className="relative mt-3 text-3xl font-bold tracking-tight">{value}</div>
        {sub && <div className="relative mt-1 text-xs text-white/80">{sub}</div>}
    </div>
)

/** Panel/section header. */
export const PanelHeader = ({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
        </div>
        {action}
    </div>
)

/** Payment status pill with soft colors. */
const STATUS_PILL_LABELS: Record<string, string> = {
    paid: "Pagado",
    partial: "Parcial",
    overdue: "Retraso",
    pending: "Pendiente",
}

export const StatusPill = ({ status }: { status: string | null | undefined }) => {
    const s = status ?? ""
    const map = s === "paid"
        ? "bg-emerald-50 text-emerald-600"
        : s === "partial"
            ? "bg-sky-50 text-sky-600"
            : s === "overdue"
                ? "bg-rose-50 text-rose-600"
                : s === "pending"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-400"
    const label = STATUS_PILL_LABELS[s] ?? "—"
    return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", map)}>{label}</span>
}

/** Small pill for an overdue month. */
export const MonthChip = ({ children, tone = "rose" }: { children: React.ReactNode; tone?: "rose" | "amber" }) => (
    <span className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
    )}>
        {children}
    </span>
)

/** Brand gradient button. */
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

/** Light outline button. */
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
