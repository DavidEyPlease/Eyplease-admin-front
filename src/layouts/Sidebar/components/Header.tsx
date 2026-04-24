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
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </UISidebarHeader>
    )
}

export default SidebarHeader;