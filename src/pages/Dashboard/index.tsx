import useAuth from "@/hooks/useAuth"
import Overview from "./components/Overview"
import HoyPage from "@/pages/Hoy"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import { RoleKeys } from "@/interfaces/common"

const DashboardPage = () => {
    const { user } = useAuth()

    return (
        /* Con el marco nuevo el Inicio es OTRA pantalla (la torre de control como feed), no el de siempre re-vestido */
        user?.role?.role_key === RoleKeys.SUPER_ADMIN ? (isNewShell() ? <HoyPage /> : <Overview />) : null
    )
}

export default DashboardPage