import useAuth from "@/hooks/useAuth"
import Overview from "./components/Overview"
import { RoleKeys } from "@/interfaces/common"

const DashboardPage = () => {
    const { user } = useAuth()

    return (
        user?.role?.role_key === RoleKeys.SUPER_ADMIN ? <Overview /> : null
    )
}

export default DashboardPage