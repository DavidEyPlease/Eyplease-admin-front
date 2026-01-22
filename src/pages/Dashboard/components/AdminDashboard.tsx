import useFetchQuery from "@/hooks/useFetchQuery"
import { queryKeys } from "@/utils/queryKeys"
import { API_ROUTES } from "@/constants/api"
import { IDashboardStats } from "@/interfaces/dashboard"
import CardStats from "./CardStats"
import RequestServicesChart from "./RequestServicesChart"
import ClientStatus from "./ClientsStatus"
import UsersLoggingChart from "./UsersLoggingChart"

const AdminDashboard = () => {
    const { response } = useFetchQuery<IDashboardStats>(API_ROUTES.DASHBOARD, {
        customQueryKey: queryKeys.detail('dashboard', 'admin'),
    })

    return (
        <div className="grid gap-y-5">
            <CardStats
                active_percentage_clients={response?.active_percentage_clients || 0}
                inactive_percentage_clients={response?.inactive_percentage_clients || 0}
                total_clients={response?.total_clients || 0}
                active_clients={response?.active_clients || 0}
                inactive_clients={response?.inactive_clients || 0}
                percent_logged_in_today={response?.percent_logged_in_today || 0}
                users_logged_in_today={response?.users_logged_in_today || 0}
                missing_reports={response?.missing_reports || 0}
                total_upload_reports={response?.total_upload_reports || 0}
                upload_percentage={response?.upload_percentage || 0}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UsersLoggingChart data={response?.users_logged_in_by_week || []} />
                <ClientStatus
                    activePercentage={response?.active_percentage_clients || 0}
                    inactivePercentage={response?.inactive_percentage_clients || 0}
                    totalClients={response?.total_clients || 0}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <RequestServicesChart data={response?.user_request_services || []} />
            </div>
        </div>
    )
}

export default AdminDashboard