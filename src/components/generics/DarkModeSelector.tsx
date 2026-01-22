import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/providers/theme-provider"
import { Switch } from "@/uishadcn/ui/switch"

export function DarkModeSelector() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <div className="flex items-center space-x-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <SunIcon
                className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "dark" ? "text-[#A1A1AA] scale-75 rotate-12" : "text-foreground scale-100 rotate-0"
                    }`}
            />
            <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
                className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
            />
            <MoonIcon
                className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === "light" ? "text-[#A1A1AA] scale-75 rotate-12" : "text-yellow-300 scale-100 rotate-0"
                    }`}
            />
        </div>
    )
}