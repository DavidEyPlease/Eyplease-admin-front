import { IUser } from "@/interfaces/users";
import { DropdownMenu } from "@/uishadcn/ui/dropdown-menu";
import { SidebarHeader as UISidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/uishadcn/ui/sidebar";

import EYPLEASE_LOGO_WHITE from "@/assets/images/icon-white.png"

// import {
//     ChevronsUpDown,
//     Plus,
//     GalleryVerticalEnd,
//     AudioWaveform,
//     Command
// } from "lucide-react"

interface Props {
    user: IUser
}

const SidebarHeader = ({ user }: Props) => {

    return (
        <UISidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <SidebarMenuButton
                            size="lg"
                            className="text-white hover:bg-transparent hover:text-white"
                        >
                            <div className="flex items-center justify-center aspect-square size-12">
                                <img src={EYPLEASE_LOGO_WHITE} />
                            </div>
                            <div className="grid flex-1 text-lg leading-tight text-left">
                                <span className="font-semibold truncate">
                                    Eyplease
                                </span>
                                <span className="text-sm truncate">
                                    {user?.username}
                                </span>
                            </div>
                        </SidebarMenuButton>
                        {/* <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                                    <activeTeam.logo className="size-4" />
                                </div>
                                <div className="grid flex-1 text-sm leading-tight text-left text-white">
                                    <span className="font-semibold truncate">
                                        Eyplease
                                    </span>
                                    <span className="text-xs truncate">
                                        {user?.account}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side="bottom"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Teams
                            </DropdownMenuLabel>
                            {teams.map((team, index) => (
                                <DropdownMenuItem
                                    key={team.name}
                                    onClick={() => setActiveTeam(team)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex items-center justify-center border rounded-sm size-6">
                                        <team.logo className="size-4 shrink-0" />
                                    </div>
                                    {team.name}
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 p-2">
                                <div className="flex items-center justify-center border rounded-md size-6 bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Add
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent> */}
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </UISidebarHeader>
    )
}

export default SidebarHeader;