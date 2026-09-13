import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"

/**
 * Claro · Automático · Oscuro.
 *
 * "Automático" sigue al sistema, así que el panel se oscurece solo al
 * anochecer si el equipo lo hace. Antes era un interruptor de dos posiciones:
 * el modo automático existía en el proveedor pero no había forma de elegirlo.
 */

const OPTIONS = [
    { value: "light", label: "Claro", icon: SunIcon },
    { value: "system", label: "Automático (sigue al sistema)", icon: MonitorIcon },
    { value: "dark", label: "Oscuro", icon: MoonIcon },
] as const

export function DarkModeSelector() {
    const { theme, setTheme } = useTheme()

    return (
        <div
            role="radiogroup"
            aria-label="Tema del panel"
            className="flex items-center gap-0.5 rounded-full border border-border bg-background/60 p-0.5"
        >
            {OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = theme === value
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        onClick={() => setTheme(value)}
                        className={cn(
                            "flex size-7 items-center justify-center rounded-full transition",
                            active
                                ? "bg-violet-600 text-white shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <Icon className="size-[15px]" />
                    </button>
                )
            })}
        </div>
    )
}
