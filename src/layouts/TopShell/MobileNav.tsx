import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { LayoutGridIcon } from 'lucide-react'

import CountrySwitch from '@/components/generics/CountrySwitch'
import { useNotificationCenter } from '@/hooks/useNotificationCenter'
import { MenuItem } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import { ICONS } from '@/layouts/Sidebar/icons'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/uishadcn/ui/sheet'
import { ADMIN_COPY, adminLabelOf } from './menuCopy'
import { DIRECT_FIRST, DIRECT_LAST, GROUPED, GROUPS } from './menuGroups'

/* Lo que se abre con el pulgar varias veces al día, en este orden; lo demás vive en «Más».
   Si el rol no trae alguna, entra la siguiente de la lista: siempre cuatro, o las que haya. */
const QUICK: Array<{ key: PermissionKeys, label: string }> = [
    { key: PermissionKeys.DASHBOARD, label: 'Hoy' },
    { key: PermissionKeys.TASKS, label: 'Pedidos' },
    { key: PermissionKeys.WHATSAPP, label: 'WhatsApp' },
    { key: PermissionKeys.FINANCES, label: 'Cobranza' },
    { key: PermissionKeys.CLIENTS, label: 'Clientas' },
    { key: PermissionKeys.PUBLISH_POSTS, label: 'Publicar' },
    { key: PermissionKeys.REPORTS_MONITOR, label: 'Reportes' },
]

const TAB = 'relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-2xl text-[10.5px] font-bold text-muted-foreground transition-colors [&_svg]:size-[21px]'

const Dot = ({ value }: { value: number }) => value > 0
    ? <span className="absolute top-1 left-1/2 ml-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#E5077D] px-1 text-[9.5px] font-extrabold tabular-nums text-white">{value > 99 ? '99+' : value}</span>
    : null

/**
 * El menú en teléfono: una barra abajo, al alcance del pulgar, con lo de todos los días y «Más»
 * para el resto del panel. Debajo de 768 px la barra de arriba esconde su menú (no cabe), y sin
 * ésta no había forma de cambiar de página. NO inventa entradas: reparte las de `sidebarMenu`,
 * que ya llega filtrado por los permisos del rol, igual que la barra de arriba.
 */
const MobileNav = () => {
    const sidebarMenu = useAuthStore(state => state.sidebarMenu)
    const { data: notifications } = useNotificationCenter()
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const whatsapp = notifications?.unread?.whatsapp ?? 0
    const badgeOf = (item: MenuItem) => item.key === PermissionKeys.WHATSAPP ? whatsapp : 0

    const byKey = new Map(sidebarMenu.map(item => [item.key, item]))
    const pick = (keys: PermissionKeys[]) => keys.map(key => byKey.get(key)).filter((item): item is MenuItem => !!item)
    const pathOf = (item: MenuItem) => item.children?.[0]?.path ?? item.path
    const isActive = (item: MenuItem) => [item.path, ...(item.children?.map(child => child.path) ?? [])]
        .some(path => !!path && location.pathname.startsWith(path))

    const quick = QUICK.flatMap(entry => { const item = byKey.get(entry.key); return item ? [{ item, label: entry.label }] : [] }).slice(0, 4)
    const elsewhere = !quick.some(entry => isActive(entry.item))

    const sections = [
        { label: 'Inicio', items: pick(DIRECT_FIRST) },
        ...GROUPS.map(group => ({ label: group.label, items: pick(group.keys) })),
        { label: 'Dinero', items: pick(DIRECT_LAST) },
        { label: 'Más', items: sidebarMenu.filter(item => !GROUPED.has(item.key)) },
    ].filter(section => section.items.length > 0)

    /* Una fila por página: la entrada, o cada una de sus hijas si tiene submenú */
    const rowsOf = (item: MenuItem) => {
        const Icon = ICONS[item.icon]
        const pages = item.children?.length
            ? item.children.map(child => ({ key: `${item.key}-${child.key}`, label: `${adminLabelOf(item)} · ${child.label}`, path: child.path }))
            : [{ key: item.key.toString(), label: adminLabelOf(item), path: item.path }]
        return pages.map((page, index) => ({ ...page, Icon, hint: index === 0 ? ADMIN_COPY[item.key]?.hint : undefined, badge: index === 0 ? badgeOf(item) : 0 }))
    }

    const go = (path: string) => {
        setOpen(false)
        navigate(path)
    }

    if (!sidebarMenu.length) return null

    return (
        <>
            <nav aria-label="Menú" className="shell-glass shell-mobile-nav fixed inset-x-3 z-40 flex h-[66px] items-stretch gap-0.5 rounded-[24px] p-1.5 md:hidden">
                {quick.map(({ item, label }) => {
                    const Icon = ICONS[item.icon]
                    const active = isActive(item)
                    return (
                        <Link key={item.key} to={pathOf(item)} aria-current={active ? 'page' : undefined} className={cn(TAB, active && 'bg-primary/10 text-primary')}>
                            {Icon && <Icon />}
                            <span className="max-w-full truncate px-0.5">{label}</span>
                            <Dot value={badgeOf(item)} />
                        </Link>
                    )
                })}
                <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={cn(TAB, (open || elsewhere) && 'bg-primary/10 text-primary')}>
                    <LayoutGridIcon />
                    <span>Más</span>
                </button>
            </nav>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="shell-mobile-sheet max-h-[88dvh] gap-0 rounded-t-[28px] border-border p-0 md:hidden">
                    <SheetHeader className="shrink-0 px-5 pt-5 pb-3 text-left">
                        <SheetTitle className="text-[18px] font-extrabold tracking-tight">Todo el panel</SheetTitle>
                        <SheetDescription className="text-[12.5px]">Cada página, agrupada como en la computadora.</SheetDescription>
                    </SheetHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(18px,env(safe-area-inset-bottom))]">
                        {/* En teléfono el interruptor de país no cabe en la barra de arriba: vive aquí */}
                        <div className="flex items-center justify-between gap-3 rounded-2xl px-2.5 py-2">
                            <span className="text-[13px] font-bold">País que estás viendo</span>
                            <CountrySwitch />
                        </div>

                        {sections.map(section => (
                            <section key={section.label} className="mt-2">
                                <h3 className="px-2.5 pt-2 pb-1 text-[10.5px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">{section.label}</h3>
                                {section.items.flatMap(rowsOf).map(row => {
                                    const active = location.pathname.startsWith(row.path)
                                    return (
                                        <button key={row.key} type="button" onClick={() => go(row.path)} className={cn('flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors active:bg-foreground/5', active && 'bg-primary/8')}>
                                            <span className="shell-drop-icon grid size-[42px] shrink-0 place-items-center rounded-[14px] text-primary [&_svg]:size-5">{row.Icon && <row.Icon />}</span>
                                            <span className="min-w-0 flex-1">
                                                <b className="block text-[14.5px] leading-snug font-bold">{row.label}</b>
                                                {row.hint && <small className="block text-[12px] leading-snug text-muted-foreground">{row.hint}</small>}
                                            </span>
                                            {row.badge > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E5077D] px-1.5 text-[10.5px] font-extrabold tabular-nums text-white">{row.badge > 99 ? '99+' : row.badge}</span>}
                                        </button>
                                    )
                                })}
                            </section>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

export default MobileNav
