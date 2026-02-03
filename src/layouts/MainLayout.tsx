import { Outlet, useLocation, useNavigate } from "react-router";
import { APP_ROUTES, SESSION_KEY } from "@/constants/app";
import { SidebarInset, SidebarProvider } from "@/uishadcn/ui/sidebar";
import { AppSidebar } from "@/uishadcn/app-sidebar";
import ContentContainer from "./Sidebar/components/ContentContainer";
import { useEffect, useState } from "react";
import UploadToastProgress from "@/components/generics/UploadToastProgress";
import { HeaderActionsProvider } from "@/providers/HeaderActionsProvider";

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation()

    const token = localStorage.getItem(SESSION_KEY);

    if (!token) {
        navigate(APP_ROUTES.AUTH.SIGN_IN);
    }

    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
        setAnimationKey((prev) => prev + 1)
    }, [location.pathname])

    return (
        <section className='flex'>
            <HeaderActionsProvider>
                <SidebarProvider
                // style={
                //     {
                //         "--sidebar-width": "19rem",
                //     } as React.CSSProperties
                // }
                >
                    <AppSidebar />
                    <SidebarInset>
                        <ContentContainer page={location.pathname}>
                            <div key={animationKey} className="animate-fade flex flex-col flex-1 gap-4 p-4">
                                <Outlet />
                            </div>
                        </ContentContainer>
                    </SidebarInset>
                </SidebarProvider>

                <UploadToastProgress />
            </HeaderActionsProvider>
        </section>
    )
}

export default MainLayout