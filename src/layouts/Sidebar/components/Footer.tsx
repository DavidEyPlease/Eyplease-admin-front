import {
    BadgeCheck,
    ChevronsUpDown,
    LogOut,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/uishadcn/ui/dropdown-menu"

import {
    SidebarFooter as UISidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/uishadcn/ui/sidebar"
import { IUser } from "@/interfaces/users"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "react-router"
import { APP_ROUTES } from "@/constants/app"
import LoggedUserAvatar from "@/components/generics/LoggedUserAvatar"
import { IAuthUser } from "@/interfaces/auth"



interface Props {
    user: IAuthUser
}

const SidebarFooter = ({ user }: Props) => {
    const { handleLogout } = useAuth()
    const navigate = useNavigate()

    return (
        <UISidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="text-white data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {user && <LoggedUserAvatar user={user} />}
                                <div className="grid flex-1 text-sm leading-tight text-left">
                                    <span className="font-semibold truncate">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs truncate">
                                        {user?.username}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side="bottom"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    {user && <LoggedUserAvatar user={user} />}
                                    <div className="grid flex-1 text-sm leading-tight text-left">
                                        <span className="font-semibold truncate">
                                            {user?.name}
                                        </span>
                                        <span className="text-xs truncate">
                                            {user?.username}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => navigate(APP_ROUTES.HOME.PROFILE)}>
                                    <BadgeCheck />
                                    Perfil
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                    <Bell />
                                    Notificaciones
                                </DropdownMenuItem> */}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut />
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </UISidebarFooter>
    )
}

export default SidebarFooter;