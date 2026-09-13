import * as React from "react"
import { Link } from "react-router"
import { ChevronRight } from "lucide-react"

import EYPLEASE_LOGO_WHITE from "@/assets/images/icon-white.png"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/uishadcn/ui/sidebar"
import SidebarFooter from "@/layouts/Sidebar/components/Footer"
import useAuth from "@/hooks/useAuth"
import useAuthStore from "@/store/auth"
import { ICONS } from "@/layouts/Sidebar/icons"
import { useNotificationCenter } from "@/hooks/useNotificationCenter"
import { PermissionKeys } from "@/interfaces/permissions"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { APP_ROUTES } from "@/constants/app"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth()
	const { sidebarMenu } = useAuthStore(state => state)
	const { data: notifications } = useNotificationCenter()

	return (
		<Sidebar variant="floating" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to={APP_ROUTES.HOME.INITIAL}>
								<div className="bg-sidebar-primary p-1 text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
									<img src={EYPLEASE_LOGO_WHITE} />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">Eyplease</span>
									<span className="">{user?.username}</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu className="gap-2">
						{sidebarMenu.map((item) => {
							const Icon = ICONS[item.icon]
							const isActive = location.pathname === item.path
							// Mensajes de WhatsApp sin ver, contestados por el bot o no.
							const badge =
								item.key === PermissionKeys.WHATSAPP ? (notifications?.unread?.whatsapp ?? 0) : 0
							return (
								item.children ? (
									<Collapsible
										key={item.key}
										asChild
										defaultOpen={isActive}
										className="group/collapsible"
									>
										<SidebarMenuItem>
											<CollapsibleTrigger asChild>
												<SidebarMenuButton tooltip={item.label} className="p-5">
													{Icon && <Icon />}
													<span>{item.label}</span>
													{badge > 0 && (
														<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold tabular-nums text-violet-700">
															{badge > 99 ? "99+" : badge}
														</span>
													)}
													<ChevronRight className={(badge > 0 ? "" : "ml-auto ") + "transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"} />
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub>
													{item.children?.map((subItem) => {
														const subMenuActive = location.pathname === subItem.path
														return (
															<SidebarMenuSubItem key={subItem.key}>
																<SidebarMenuSubButton isActive={subMenuActive} asChild>
																	<Link to={subItem.path} className="text-sm text-white">
																		{subItem.label}
																	</Link>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														)
													})}
												</SidebarMenuSub>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								) : (
									<SidebarMenuItem key={item.key}>
										<Link to={item.path}>
											<SidebarMenuButton isActive={isActive} className="p-5">
												{Icon && <Icon />}
												{item.label}
												{badge > 0 && (
													<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold tabular-nums text-violet-700">
														{badge > 99 ? "99+" : badge}
													</span>
												)}
											</SidebarMenuButton>
										</Link>
									</SidebarMenuItem>
								)
							)
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			{user && <SidebarFooter user={user} />}
		</Sidebar>
	)
}
