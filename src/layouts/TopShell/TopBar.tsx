import { Link, useLocation, useNavigate } from 'react-router'
import { BadgeCheckIcon, ChevronDownIcon, LogOutIcon, SparklesIcon, UndoIcon } from 'lucide-react'

import ISOTIPO from '@/assets/images/icon-white.png'
import ButtonBack from '@/components/generics/ButtonBack'
import { DarkModeSelector } from '@/components/generics/DarkModeSelector'
import LoggedUserAvatar from '@/components/generics/LoggedUserAvatar'
import NetworkPeopleSearch from '@/components/generics/NetworkPeopleSearch'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { APP_ROUTES } from '@/constants/app'
import useAuth from '@/hooks/useAuth'
import { useNotificationCenter } from '@/hooks/useNotificationCenter'
import { MenuItem, RoleKeys } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import { ICONS } from '@/layouts/Sidebar/icons'
import { cn } from '@/lib/utils'
import { useHeaderActions } from '@/providers/HeaderActionsProvider'
import useAuthStore from '@/store/auth'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/uishadcn/ui/dropdown-menu'
import { ADMIN_COPY, adminLabelOf } from './menuCopy'
import CommandBar from './CommandBar'
import { requestLogout } from './logoutBridge'
import { setNewShell } from './useNewShell'

/**
 * Cómo se reparte el menú de siempre en la barra. NO inventa entradas: agrupa las que ya trae
 * `sidebarMenu`, que llega filtrado por los permisos del rol. Un grupo al que el rol le deja una
 * sola entrada se pinta como enlace directo; uno vacío no se pinta. Las entradas que en el menú
 * lateral tenían submenú (WhatsApp, Plantillas, Configuraciones) abren aquí sus hijas.
 */
const DIRECT_FIRST: PermissionKeys[] = [PermissionKeys.DASHBOARD]
const GROUPS: Array<{ label: string, keys: PermissionKeys[] }> = [
    { label: 'Clientas', keys: [PermissionKeys.CLIENTS, PermissionKeys.WHATSAPP, PermissionKeys.SALES] },
    /* Pedidos de diseño es operación (el trabajo que hay que sacar), no un dato de la clienta */
    { label: 'Operación', keys: [PermissionKeys.TASKS, PermissionKeys.PUBLISH_POSTS, PermissionKeys.REPORTS_MONITOR] },
    { label: 'Contenido', keys: [PermissionKeys.TEMPLATES, PermissionKeys.TRAININGS] },
]
const DIRECT_LAST: PermissionKeys[] = [PermissionKeys.FINANCES]
const GROUPED = new Set<PermissionKeys>([...DIRECT_FIRST, ...GROUPS.flatMap(group => group.keys), ...DIRECT_LAST])

const NAV_BUTTON = 'relative flex h-[38px] cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground'
const ROW = 'shell-drop-row cursor-pointer gap-3 rounded-[14px] px-2.5 py-2.5'

const ActiveBar = () => <span className="shell-grad absolute inset-x-3 bottom-[3px] h-[2.5px] rounded-full" />
const Count = ({ value }: { value: number }) => value > 0
    ? <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#E5077D] px-1 text-[10px] font-extrabold tabular-nums text-white">{value > 99 ? '99+' : value}</span>
    : null

interface Props {
    /** El rol puede usar el Copiloto (el servidor lo vuelve a exigir) */
    copilot: boolean
    copilotOpen: boolean
    onToggleCopilot: () => void
}

const TopBar = ({ copilot, copilotOpen, onToggleCopilot }: Props) => {
    const { user } = useAuth()
    const sidebarMenu = useAuthStore(state => state.sidebarMenu)
    const { data: notifications } = useNotificationCenter()
    const { headerActions } = useHeaderActions()
    const location = useLocation()
    const navigate = useNavigate()

    const isSuperAdmin = user?.role?.role_key === RoleKeys.SUPER_ADMIN
    const whatsapp = notifications?.unread?.whatsapp ?? 0
    const badgeOf = (item: MenuItem) => item.key === PermissionKeys.WHATSAPP ? whatsapp : 0

    const byKey = new Map(sidebarMenu.map(item => [item.key, item]))
    const pick = (keys: PermissionKeys[]) => keys.map(key => byKey.get(key)).filter((item): item is MenuItem => !!item)
    /* Una entrada está activa si lo está ella o alguna de sus hijas */
    const isActive = (item: MenuItem) => [item.path, ...(item.children?.map(child => child.path) ?? [])]
        .some(path => !!path && location.pathname.startsWith(path))

    const direct = (item: MenuItem) => (
        <Link key={item.key} to={item.path} className={cn(NAV_BUTTON, isActive(item) && 'text-foreground')}>
            {adminLabelOf(item)}
            {isActive(item) && <ActiveBar />}
        </Link>
    )

    /* Una fila del desplegable por página: la entrada, o cada una de sus hijas si tiene submenú */
    const rowsOf = (item: MenuItem) => {
        const Icon = ICONS[item.icon]
        const pages = item.children?.length
            ? item.children.map(child => ({ key: `${item.key}-${child.key}`, label: `${adminLabelOf(item)} · ${child.label}`, path: child.path }))
            : [{ key: item.key.toString(), label: adminLabelOf(item), path: item.path }]

        return pages.map((page, index) => ({ ...page, Icon, hint: index === 0 ? ADMIN_COPY[item.key]?.hint : undefined, badge: index === 0 ? badgeOf(item) : 0 }))
    }

    const dropdown = (label: string, items: MenuItem[]) => {
        const rows = items.flatMap(rowsOf)
        const active = items.some(isActive)
        const badge = items.reduce((sum, item) => sum + badgeOf(item), 0)
        return (
            <DropdownMenu key={label}>
                <DropdownMenuTrigger className={cn(NAV_BUTTON, 'group outline-none', active && 'text-foreground')}>
                    {label}
                    <Count value={badge} />
                    <ChevronDownIcon className="size-3.5 opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    {active && <ActiveBar />}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={12} className="shell-drop w-[350px] rounded-[20px] border-border p-2 shadow-[0_18px_50px_-24px_rgba(27,20,80,.5)]">
                    {rows.map((row, index) => (
                        <DropdownMenuItem key={row.key} onClick={() => navigate(row.path)} style={{ '--i': index } as React.CSSProperties} className={ROW}>
                            <span className="shell-drop-icon grid size-[38px] shrink-0 place-items-center rounded-xl text-primary [&_svg]:size-[18px]">{row.Icon && <row.Icon />}</span>
                            <span className="min-w-0 flex-1">
                                <b className="block text-[13.5px] font-bold">{row.label}</b>
                                {row.hint && <small className="block text-[11.5px] text-muted-foreground">{row.hint}</small>}
                            </span>
                            <Count value={row.badge} />
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    /* Lo que el rol trae y no está en ningún grupo (Configuración, o una entrada nueva del menú) no se pierde: va en «Más» */
    const others = sidebarMenu.filter(item => !GROUPED.has(item.key))

    return (
        <header className="shell-glass sticky top-3 z-40 mx-auto mt-3 flex h-[62px] w-[min(1560px,calc(100%-28px))] items-center gap-1.5 rounded-[20px] pr-2.5 pl-3.5">
            <Link to={APP_ROUTES.HOME.INITIAL} className="flex items-center gap-2.5 pr-2">
                <span className="shell-grad shell-mark grid size-9 place-items-center rounded-xl shadow-[0_8px_18px_-8px_rgba(108,71,255,.9)]">
                    <img src={ISOTIPO} alt="" className="relative z-[1] w-[21px]" />
                </span>
                <span className="hidden leading-none xl:block">
                    <b className="block text-[15px] font-extrabold tracking-tight">eyplease<span className="text-[#E5077D]">+</span></b>
                    <small className="text-[9.5px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">Admin</small>
                </span>
            </Link>

            <ButtonBack />

            <nav className="hidden items-center gap-0.5 md:flex">
                {pick(DIRECT_FIRST).map(direct)}
                {GROUPS.map(group => {
                    const items = pick(group.keys)
                    if (!items.length) return null
                    /* Un grupo de una sola página es un enlace; con submenú o varias, desplegable */
                    return items.length === 1 && !items[0].children?.length ? direct(items[0]) : dropdown(group.label, items)
                })}
                {pick(DIRECT_LAST).map(direct)}
                {others.length > 0 && dropdown('Más', others)}
            </nav>

            <CommandBar copilot={copilot} />

            <div className="ml-auto flex items-center gap-1.5">
                {/* Las acciones que cada página sube a la cabecera (HeaderActionsProvider) conservan su sitio */}
                {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
                {isSuperAdmin && <span className="hidden 2xl:block"><NetworkPeopleSearch /></span>}
                {isSuperAdmin && <NotificationCenter />}
                {copilot && (
                    <button
                        type="button"
                        title={copilotOpen ? 'Plegar el Copiloto' : 'Abrir el Copiloto'}
                        aria-pressed={copilotOpen}
                        onClick={onToggleCopilot}
                        className={cn('hidden h-[38px] cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[12.5px] font-bold transition-colors lg:flex', copilotOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground')}
                    >
                        <SparklesIcon className="size-4" /> <span className="hidden xl:inline">Copiloto</span>
                    </button>
                )}
                <DarkModeSelector />

                <DropdownMenu>
                    <DropdownMenuTrigger className="group ml-0.5 flex cursor-pointer items-center gap-2 rounded-[14px] py-1 pr-2 pl-1 outline-none transition-colors hover:bg-foreground/5 data-[state=open]:bg-foreground/5">
                        {user && <LoggedUserAvatar user={user} />}
                        <span className="hidden text-left leading-tight whitespace-nowrap lg:block">
                            <b className="block max-w-[130px] truncate text-[12.5px] font-bold">{user?.name}</b>
                            <small className="block text-[10.5px] text-muted-foreground">{user?.role?.name}</small>
                        </span>
                        <ChevronDownIcon className="size-3.5 opacity-55 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={12} className="shell-drop min-w-60 rounded-[20px] p-2">
                        <DropdownMenuLabel className="px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">Tu cuenta</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={() => navigate(APP_ROUTES.HOME.PROFILE)}>
                            <BadgeCheckIcon /> Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={() => setNewShell(false)}>
                            <UndoIcon /> Volver al diseño anterior
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={requestLogout}>
                            <LogOutIcon /> Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default TopBar
