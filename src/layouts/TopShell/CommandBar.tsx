import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BadgeCheckIcon, SearchIcon, SparklesIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { ICONS } from '@/layouts/Sidebar/icons'
import useAuthStore from '@/store/auth'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/uishadcn/ui/command'
import { askCopilot } from './copilot/copilotBridge'
import { adminLabelOf } from './menuCopy'

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

/**
 * La barra ⌘K del panel: ir a cualquier página (y a cada una de sus hijas) escribiendo su nombre, o
 * mandarle lo escrito al Copiloto tal cual, como pregunta.
 */
const CommandBar = ({ copilot = false }: { copilot?: boolean }) => {
    const navigate = useNavigate()
    const sidebarMenu = useAuthStore(state => state.sidebarMenu)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpen(value => !value)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const go = (path: string) => { setOpen(false); navigate(path) }

    const ask = () => {
        const text = query.trim()
        if (!text) return
        setOpen(false)
        setQuery('')
        askCopilot(text)
    }

    const pages = [
        ...sidebarMenu.flatMap(item => item.children?.length
            ? item.children.map(child => ({ key: `${item.key}-${child.key}`, label: `${adminLabelOf(item)} · ${child.label}`, path: child.path, Icon: ICONS[item.icon] }))
            : [{ key: item.key.toString(), label: adminLabelOf(item), path: item.path, Icon: ICONS[item.icon] }]),
        { key: 'profile', label: 'Perfil', path: APP_ROUTES.HOME.PROFILE, Icon: BadgeCheckIcon },
    ]

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="ml-1.5 hidden h-[38px] min-w-0 flex-1 cursor-text items-center gap-2 rounded-xl border border-border bg-foreground/[.03] px-3 text-[12.5px] text-muted-foreground transition-colors hover:border-[#6C47FF]/40 hover:bg-foreground/[.05] lg:flex lg:max-w-[240px]"
            >
                <SearchIcon className="size-[15px] shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{copilot ? 'Ir a… o pregunta' : 'Ir a…'}</span>
                <kbd className="shrink-0 rounded-md border border-border bg-card/70 px-1.5 py-0.5 text-[10px] font-bold">{IS_MAC ? '⌘' : 'Ctrl'} K</kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen} title="Ir a" description="Escribe el nombre de una página del panel" className="shell-drop top-[22%] translate-y-0 rounded-[22px] sm:max-w-[540px]">
                <CommandInput value={query} onValueChange={setQuery} placeholder={copilot ? 'Escribe una página o una pregunta para el Copiloto…' : 'Escribe una página: Clientes, Publicaciones, Finanzas…'} />
                <CommandList className="max-h-[52vh]">
                    {/* Con el Copiloto a mano nunca está «vacío»: lo que no es una página es una pregunta */}
                    {!(copilot && query.trim().length > 2) && <CommandEmpty>No hay una página con ese nombre.</CommandEmpty>}
                    {copilot && query.trim().length > 2 && (
                        /* `value` lleva lo escrito para que el filtro de cmdk nunca la esconda; `forceMount` por lo mismo */
                        <CommandGroup heading="Copiloto" forceMount>
                            <CommandItem forceMount value={`copiloto ${query}`} onSelect={ask} className="cursor-pointer gap-3 rounded-xl">
                                <span className="shell-grad grid size-8 shrink-0 place-items-center rounded-[10px] text-white"><SparklesIcon className="size-4" /></span>
                                <span className="min-w-0 flex-1 truncate">Preguntarle: «{query.trim()}»</span>
                            </CommandItem>
                        </CommandGroup>
                    )}
                    <CommandGroup heading="Ir a">
                        {pages.map(({ key, label, path, Icon }) => (
                            <CommandItem key={key} value={label} onSelect={() => go(path)} className="cursor-pointer gap-3 rounded-xl">
                                <span className="shell-drop-icon grid size-8 shrink-0 place-items-center rounded-[10px] text-primary [&_svg]:!size-4">{Icon && <Icon />}</span>
                                {label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

export default CommandBar
