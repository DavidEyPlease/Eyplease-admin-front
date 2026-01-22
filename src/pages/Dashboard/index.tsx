import useAuth from "@/hooks/useAuth"
import AdminDashboard from "./components/AdminDashboard"
import { RoleKeys } from "@/interfaces/common"

const DashboardPage = () => {
    const { user } = useAuth()

    return (
        user?.role?.role_key === RoleKeys.SUPER_ADMIN ? <AdminDashboard /> : null
    )
}

export default DashboardPage