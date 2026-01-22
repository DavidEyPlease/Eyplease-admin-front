import ButtonBack from "@/components/generics/ButtonBack";
import { DarkModeSelector } from "@/components/generics/DarkModeSelector";
import { SIDEBAR_ITEMS } from "@/constants/app";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/uishadcn/ui/breadcrumb";
import { Separator } from "@/uishadcn/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/uishadcn/ui/sidebar";

interface Props {
    children: React.ReactNode;
    page: string;
}

const ContentContainer = ({ children, page }: Props) => {
    const labelPage = SIDEBAR_ITEMS.find(item => item.path === page)?.label;
    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-white dark:bg-background w-full">
                <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <ButtonBack />
                            </BreadcrumbItem>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Eyplease
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{labelPage || ''}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="ml-auto px-3">
                    <DarkModeSelector />
                </div>
            </header>
            <div className="relative min-h-screen bg-gray-50 dark:bg-background">
                {children}
            </div>
        </SidebarInset>
    )
}

export default ContentContainer;